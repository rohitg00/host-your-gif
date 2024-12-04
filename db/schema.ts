import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const gifs = pgTable("gifs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  filename: text("filename").notNull(),
  filepath: text("filepath").notNull(),
  shareUrl: text("share_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertGifSchema = createInsertSchema(gifs);
export const selectGifSchema = createSelectSchema(gifs);
export type InsertGif = z.infer<typeof insertGifSchema>;
export type Gif = z.infer<typeof selectGifSchema>;
