import type { Express } from "express";
import type { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "../db";

// Ensure uploads directory exists with absolute path
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
import { gifs } from "@db/schema";
import { eq, like } from "drizzle-orm";

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
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
  // Upload GIF(s)
  app.post("/api/upload", upload.array("gif", 10), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const results = await Promise.all(
        req.files.map(async (file) => {
          const gif = await db.insert(gifs).values({
            title: file.originalname,
            filename: file.filename,
            filepath: `${baseUrl}/uploads/${file.filename}`,
            shareUrl: `${baseUrl}/g/${file.filename}`
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

  // Get all GIFs
  app.get("/api/gifs", async (req, res) => {
    try {
      const search = req.query.q as string;
      const query = db.select().from(gifs).where(
        search ? like(gifs.title, `%${search}%`) : undefined
      );

      const results = await query.orderBy(gifs.createdAt);
      res.json(results);
    } catch (error) {
      console.error('Get GIFs error:', error);
      res.status(500).json({ error: "Failed to fetch GIFs" });
    }
  });

  // Get single GIF
  app.get("/api/gifs/:id", async (req, res) => {
    try {
      const gif = await db.select().from(gifs).where(eq(gifs.id, parseInt(req.params.id)));
      if (!gif.length) {
        return res.status(404).json({ error: "GIF not found" });
      }
      res.json(gif[0]);
    } catch (error) {
      console.error('Get GIF error:', error);
      res.status(500).json({ error: "Failed to fetch GIF" });
    }
  });
}
