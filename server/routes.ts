import type { Express, Response } from "express";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "../db";
import { gifs, sessions, users } from "@db/schema";
import { eq, like, and, or, gt, desc } from "drizzle-orm";
import { authMiddleware } from "./middleware/auth";
import { apiLimiter, authLimiter } from "./middleware/rateLimiter";
import authRoutes from "./routes/auth";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Function to check disk space
const checkDiskSpace = () => {
  const stats = fs.statfsSync(uploadsDir);
  const availableSpace = stats.bavail * stats.bsize;
  return availableSpace > 100 * 1024 * 1024; // Ensure at least 100MB free
};

// Function to clean up old files if needed
const cleanupOldFiles = async () => {
  try {
    // Get all files in uploads directory
    const files = fs.readdirSync(uploadsDir);
    
    // Get file stats and sort by creation time
    const fileStats = files.map(file => ({
      name: file,
      path: path.join(uploadsDir, file),
      ctime: fs.statSync(path.join(uploadsDir, file)).ctime
    })).sort((a, b) => a.ctime.getTime() - b.ctime.getTime());

    // Delete oldest files until we have enough space
    while (fileStats.length > 0 && !checkDiskSpace()) {
      const oldestFile = fileStats.shift();
      if (oldestFile) {
        fs.unlinkSync(oldestFile.path);
        // Also remove from database
        await db.delete(gifs)
          .where(eq(gifs.filename, oldestFile.name));
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      if (!checkDiskSpace()) {
        await cleanupOldFiles();
      }
      cb(null, uploadsDir);
    } catch (error) {
      cb(error as Error, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // Reduced to 25MB limit
    files: 5 // Reduced to 5 files max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "image/gif") {
      cb(null, false);
      return;
    }
    cb(null, true);
  }
});

export function registerRoutes(app: Express) {
  // Apply rate limiters
  app.use('/api/', apiLimiter);
  app.use('/api/auth/', authLimiter);

  // Register auth routes
  app.use("/api/auth", authRoutes);

  // Serve uploads directory with proper headers
  app.use('/uploads', (req, res, next) => {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': 'public, max-age=31536000', // 1 year cache
      'Cross-Origin-Resource-Policy': 'cross-origin'
    });
    next();
  }, express.static(uploadsDir));

  // Cleanup duplicate GIFs
  app.delete("/api/gifs/cleanup/duplicates", async (req, res) => {
    try {
      // Get all GIFs grouped by filename
      const allGifs = await db.select().from(gifs);
      const groupedByFilename = allGifs.reduce((acc, gif) => {
        if (!acc[gif.filename]) {
          acc[gif.filename] = [];
        }
        acc[gif.filename].push(gif);
        return acc;
      }, {} as Record<string, typeof allGifs>);

      // Find duplicates and keep only the latest one
      const duplicates = Object.values(groupedByFilename)
        .filter(group => group.length > 1)
        .map(group => {
          // Sort by creation date, newest first
          group.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          // Return all but the first (newest) one
          return group.slice(1);
        })
        .flat();

      // Delete duplicate records
      for (const gif of duplicates) {
        await db.delete(gifs).where(eq(gifs.id, gif.id));
      }

      res.json({
        message: "Duplicate GIFs cleaned up successfully",
        removed: duplicates.length,
        details: duplicates
      });
    } catch (error) {
      console.error('Duplicate cleanup error:', error);
      res.status(500).json({ error: "Failed to clean up duplicate GIFs" });
    }
  });

  // Clear all GIFs (temporary route for cleanup)
  app.delete("/api/gifs/cleanup/all", async (req, res) => {
    try {
      await db.delete(gifs);
      res.json({ message: "All GIFs cleared successfully" });
    } catch (error) {
      console.error('Cleanup error:', error);
      res.status(500).json({ error: "Failed to clear GIFs" });
    }
  });

  // Cleanup localhost URLs
  app.delete("/api/gifs/cleanup/localhost", async (req, res) => {
    try {
      // First, get all GIFs with localhost URLs
      const localhostGifs = await db
        .select()
        .from(gifs)
        .where(
          or(
            like(gifs.filepath, '%localhost%'),
            like(gifs.shareUrl, '%localhost%')
          )
        );

      // Delete the files
      for (const gif of localhostGifs) {
        const filePath = path.join(uploadsDir, gif.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Delete from database
      await db
        .delete(gifs)
        .where(
          or(
            like(gifs.filepath, '%localhost%'),
            like(gifs.shareUrl, '%localhost%')
          )
        );

      res.json({ 
        message: "Localhost GIFs cleaned up successfully",
        removed: localhostGifs.length,
        gifs: localhostGifs
      });
    } catch (error) {
      console.error('Localhost cleanup error:', error);
      res.status(500).json({ error: "Failed to clean up localhost GIFs" });
    }
  });

  // Temporary route to fix share URLs
  app.post("/api/gifs/fix-urls", async (req, res) => {
    try {
      const allGifs = await db.select().from(gifs);
      const updates = await Promise.all(
        allGifs.map(async (gif) => {
          if (gif.shareUrl.includes('/g/')) {
            const newShareUrl = gif.shareUrl.replace('/g/', '/uploads/');
            await db
              .update(gifs)
              .set({ shareUrl: newShareUrl })
              .where(eq(gifs.id, gif.id));
            return { id: gif.id, old: gif.shareUrl, new: newShareUrl };
          }
          return null;
        })
      );
      
      const updatedGifs = updates.filter(Boolean);
      res.json({ 
        message: "Share URLs updated successfully", 
        updated: updatedGifs.length,
        details: updatedGifs 
      });
    } catch (error) {
      console.error('URL fix error:', error);
      res.status(500).json({ error: "Failed to update share URLs" });
    }
  });

  // Fix all GIF URLs
  app.post("/api/gifs/fix-all-urls", async (req, res) => {
    try {
      // Always use the public domain
      const baseUrl = 'https://hostyourgif.live';

      const allGifs = await db.select().from(gifs);
      const updates = await Promise.all(
        allGifs.map(async (gif) => {
          const newUrl = `${baseUrl}/uploads/${gif.filename}`;
          if (gif.filepath !== newUrl || gif.shareUrl !== newUrl) {
            await db
              .update(gifs)
              .set({ 
                filepath: newUrl,
                shareUrl: newUrl 
              })
              .where(eq(gifs.id, gif.id));
            return { 
              id: gif.id, 
              oldFilepath: gif.filepath,
              oldShareUrl: gif.shareUrl,
              newUrl 
            };
          }
          return null;
        })
      );
      
      const updatedGifs = updates.filter(Boolean);
      res.json({ 
        message: "All GIF URLs updated successfully", 
        updated: updatedGifs.length,
        details: updatedGifs 
      });
    } catch (error) {
      console.error('URL fix error:', error);
      res.status(500).json({ error: "Failed to update GIF URLs" });
    }
  });

  // Upload GIF(s)
  app.post("/api/upload", authMiddleware, upload.array("gif", 5), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Always use the public domain
      const baseUrl = 'https://hostyourgif.live';

      const results = await Promise.all(
        req.files.map(async (file) => {
          const filepath = `${baseUrl}/uploads/${file.filename}`;
          const gif = await db.insert(gifs).values({
            userId: req.user!.id,
            title: file.originalname,
            filename: file.filename,
            filepath: filepath,
            shareUrl: filepath,
            isPublic: req.body.isPublic === 'true'
          }).returning();
          return gif[0];
        })
      );

      res.json(results);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Get GIFs (with privacy filter)
  app.get("/api/gifs", authMiddleware, async (req, res) => {
    try {
      const search = req.query.q as string;
      const userId = req.query.userId as string;
      const currentUser = req.user;
      
      let conditions = [];

      // Add search condition if provided
      if (search) {
        conditions.push(like(gifs.title, `%${search}%`));
      }

      // Filter by user ID if provided
      if (userId) {
        conditions.push(eq(gifs.userId, parseInt(userId)));
      }

      // Privacy filter:
      // - If user is logged in: show public GIFs and their own private GIFs
      // - If user is not logged in: show only public GIFs
      if (currentUser) {
        conditions.push(
          or(
            and(
              eq(gifs.isPublic, true),
              gt(gifs.userId, 0) // Ensure GIF belongs to a real user
            ),
            eq(gifs.userId, currentUser.id)
          )
        );
      } else {
        conditions.push(
          and(
            eq(gifs.isPublic, true),
            gt(gifs.userId, 0) // Ensure GIF belongs to a real user
          )
        );
      }

      const results = await db
        .select()
        .from(gifs)
        .where(and(...conditions))
        .orderBy(desc(gifs.createdAt));

      res.json(results);
    } catch (error) {
      console.error('Error fetching GIFs:', error);
      res.status(500).json({ error: "Failed to fetch GIFs" });
    }
  });

  // Get single GIF (with privacy check)
  app.get("/api/gifs/:id", async (req, res) => {
    try {
      const [gif] = await db.select()
        .from(gifs)
        .where(eq(gifs.id, parseInt(req.params.id)));

      if (!gif) {
        return res.status(404).json({ error: "GIF not found" });
      }

      // Check privacy
      if (!gif.isPublic && (!req.user || gif.userId !== req.user.id)) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(gif);
    } catch (error) {
      console.error('Get GIF error:', error);
      res.status(500).json({ error: "Failed to fetch GIF" });
    }
  });

  // Delete GIF
  app.delete("/api/gifs/:id", authMiddleware, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const gifId = parseInt(req.params.id);
      if (isNaN(gifId)) {
        return res.status(400).json({ error: "Invalid GIF ID" });
      }

      // First check if the GIF exists and belongs to the user
      const existingGif = await db.select().from(gifs)
        .where(and(
          eq(gifs.id, gifId),
          eq(gifs.userId, req.user.id)
        ));

      if (!existingGif || existingGif.length === 0) {
        return res.status(404).json({ error: "GIF not found or unauthorized" });
      }

      // Delete the file
      const filePath = path.join(uploadsDir, existingGif[0].filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from database
      await db.delete(gifs)
        .where(and(
          eq(gifs.id, gifId),
          eq(gifs.userId, req.user.id)
        ));

      res.json({ message: "GIF deleted successfully" });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: "Failed to delete GIF" });
    }
  });
}
