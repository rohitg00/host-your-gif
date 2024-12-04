import type { Express } from "express";
import type { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "../db";

// Ensure uploads directory exists
const uploadsDir = "./uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
import { gifs } from "@db/schema";
import { eq, like } from "drizzle-orm";

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
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
  // Upload GIF
  app.post("/api/upload", upload.single("gif"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const gif = await db.insert(gifs).values({
        title: req.body.title || req.file.originalname,
        filename: req.file.filename,
        filepath: `${baseUrl}/uploads/${req.file.filename}`,
        shareUrl: `${baseUrl}/g/${req.file.filename}`
      }).returning();

      res.json(gif[0]);
    } catch (error) {
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
      res.status(500).json({ error: "Failed to fetch GIF" });
    }
  });
}
