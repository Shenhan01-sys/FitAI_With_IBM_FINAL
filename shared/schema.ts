import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  weight: integer("weight").notNull(),
  bodyFat: integer("body_fat").notNull(),
  muscleMass: integer("muscle_mass").notNull(),
  age: integer("age").notNull(),
  goal: text("goal").notNull(), // 'cutting', 'bulking', 'recomposition'
  completed: json("completed").$type<Record<string, boolean>>().default({}),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  userId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

// AI Plans interface
export interface AIPlans {
  workoutPlan: string;
  nutritionPlan: string;
  sleepPlan: string;
}
