import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// GIFs table with user reference
export const gifs = pgTable("gifs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  filename: text("filename").notNull(),
  filepath: text("filepath").notNull(),
  shareUrl: text("share_url").notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Sessions table for auth
export const sessions = pgTable("sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  gifs: many(gifs),
  sessions: many(sessions)
}));

export const gifRelations = relations(gifs, ({ one }) => ({
  user: one(users, {
    fields: [gifs.userId],
    references: [users.id]
  })
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;

export const insertGifSchema = createInsertSchema(gifs);
export const selectGifSchema = createSelectSchema(gifs);
export type InsertGif = z.infer<typeof insertGifSchema>;
export type Gif = z.infer<typeof selectGifSchema>;

export const insertSessionSchema = createInsertSchema(sessions);
export const selectSessionSchema = createSelectSchema(sessions);
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = z.infer<typeof selectSessionSchema>;
