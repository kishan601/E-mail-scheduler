import { users, emails, type User, type Email, type InsertEmail } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  // Email methods
  createEmail(email: InsertEmail & { startTime?: Date, delay?: number, rateLimit?: number }): Promise<Email>;
  getEmail(id: number): Promise<Email | undefined>;
  getUserEmails(userId: string): Promise<Email[]>;
  updateEmailStatus(id: number, status: string, sentTime?: Date, jobId?: string, error?: string): Promise<Email>;
  deleteEmail(id: number): Promise<void>;
  getStats(userId: string): Promise<{ totalScheduled: number, totalSent: number, totalFailed: number }>;
}

export class DatabaseStorage implements IStorage {
  // Auth methods (delegated/implemented from IAuthStorage)
  async getUser(id: string): Promise<User | undefined> {
    return authStorage.getUser(id);
  }

  async upsertUser(user: any): Promise<User> {
    return authStorage.upsertUser(user);
  }

  // Email methods
  async createEmail(insertEmail: InsertEmail & { userId: string }): Promise<Email> {
    const [email] = await db.insert(emails).values(insertEmail).returning();
    return email;
  }

  async getEmail(id: number): Promise<Email | undefined> {
    const [email] = await db.select().from(emails).where(eq(emails.id, id));
    return email;
  }

  async getUserEmails(userId: string): Promise<Email[]> {
    return db.select()
      .from(emails)
      .where(eq(emails.userId, userId))
      .orderBy(desc(emails.scheduledTime));
  }

  async updateEmailStatus(id: number, status: string, sentTime?: Date, jobId?: string, error?: string): Promise<Email> {
    const [email] = await db
      .update(emails)
      .set({ 
        status: status as any, 
        sentTime, 
        jobId,
        error 
      })
      .where(eq(emails.id, id))
      .returning();
    return email;
  }

  async deleteEmail(id: number): Promise<void> {
    await db.delete(emails).where(eq(emails.id, id));
  }

  async getStats(userId: string): Promise<{ totalScheduled: number, totalSent: number, totalFailed: number }> {
    const userEmails = await this.getUserEmails(userId);
    return {
      totalScheduled: userEmails.filter(e => e.status === 'scheduled').length,
      totalSent: userEmails.filter(e => e.status === 'sent').length,
      totalFailed: userEmails.filter(e => e.status === 'failed').length
    };
  }
}

export const storage = new DatabaseStorage();
