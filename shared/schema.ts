import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./models/auth";

export const insertUserSchema = createInsertSchema(users);
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // references users.id
  recipient: text("recipient").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status", { enum: ["scheduled", "processing", "sent", "failed", "cancelled"] }).notNull().default("scheduled"),
  scheduledTime: timestamp("scheduled_time").notNull(),
  sentTime: timestamp("sent_time"),
  error: text("error"),
  jobId: text("job_id"), // BullMQ job ID
});

export const insertEmailSchema = createInsertSchema(emails).omit({
  id: true,
  userId: true, // set from session
  status: true,
  sentTime: true,
  error: true,
  jobId: true
});

export type Email = typeof emails.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;

// Input type for the bulk schedule API
export const scheduleRequestSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  recipients: z.array(z.string().email("Invalid email address")).min(1, "At least one recipient is required"),
  startTime: z.string().datetime(), // ISO string
  delay: z.number().min(0).default(2), // Seconds between emails
  hourlyLimit: z.number().min(1).default(100), // Max emails per hour
});

export type ScheduleRequest = z.infer<typeof scheduleRequestSchema>;
