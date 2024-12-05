import type { Express } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "../db";
import { gifs, sessions, users } from "@db/schema";
import { eq, like, and, or, gt } from "drizzle-orm";
import { authMiddleware } from "./middleware/auth";
import { apiLimiter, authLimiter } from "./middleware/rateLimiter";
import authRoutes from "./routes/auth";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Maximum 10 files
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

  // Upload GIF(s)
  app.post("/api/upload", authMiddleware, upload.array("gif", 10), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const results = await Promise.all(
        req.files.map(async (file) => {
          const gif = await db.insert(gifs).values({
            userId: req.user!.id,
            title: file.originalname,
            filename: file.filename,
            filepath: `${baseUrl}/uploads/${file.filename}`,
            shareUrl: `${baseUrl}/g/${file.filename}`,
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
      
      let conditions = [];
      
      // Add search condition if provided
      if (search) {
        conditions.push(like(gifs.title, `%${search}%`));
      }

      // If user is requesting their own GIFs
      if (req.user && userId === req.user.id.toString()) {
        // Show all GIFs (public and private) for the user
        conditions.push(eq(gifs.userId, req.user.id));
      } else if (userId) {
        // Show only public GIFs for other users
        conditions.push(
          and(
            eq(gifs.userId, parseInt(userId)),
            eq(gifs.isPublic, true)
          )
        );
      } else {
        // Show all public GIFs
        conditions.push(eq(gifs.isPublic, true));
      }

      const results = await db.select()
        .from(gifs)
        .where(and(...conditions))
        .orderBy(gifs.createdAt);

      res.json(results);
    } catch (error) {
      console.error('Get GIFs error:', error);
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

  // Delete GIF (only owner can delete)
  app.delete("/api/gifs/:id", authMiddleware, async (req, res) => {
    try {
      const gifId = parseInt(req.params.id);
      
      // Find the GIF first
      const [gif] = await db.select()
        .from(gifs)
        .where(eq(gifs.id, gifId));

      if (!gif) {
        return res.status(404).json({ error: "GIF not found" });
      }

      // Check if user owns the GIF
      if (gif.userId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized to delete this GIF" });
      }

      // Delete the GIF from database
      await db.delete(gifs).where(eq(gifs.id, gifId));

      // Delete the file from uploads directory
      const filePath = path.join(uploadsDir, gif.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.json({ message: "GIF deleted successfully" });
    } catch (error) {
      console.error('Delete GIF error:', error);
      res.status(500).json({ error: "Failed to delete GIF" });
    }
  });
}
