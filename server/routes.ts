import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { scheduleBatch } from "./lib/scheduler";
import { initQueue } from "./lib/queue";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Initialize Queue (Non-blocking)
  initQueue().catch(console.error);
  
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Protected Routes
  app.get(api.emails.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const emails = await storage.getUserEmails(userId);
    res.json(emails);
  });

  app.post(api.emails.schedule.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.emails.schedule.input.parse(req.body);
      const userId = req.user.claims.sub;
      
      // Trigger background scheduling
      // We await it here for simplicity to return the count, 
      // but for huge batches we might want to just return "Accepted"
      const count = await scheduleBatch(userId, input);
      
      res.status(201).json({ message: "Emails scheduled successfully", count });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.delete(api.emails.delete.path, isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id);
    const userId = req.user.claims.sub;
    
    const email = await storage.getEmail(id);
    if (!email || email.userId !== userId) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Note: We should also remove from BullMQ if possible
    // await emailQueue.remove(email.jobId); 
    // Implementing cancel in storage updates status to 'cancelled' which worker checks
    await storage.updateEmailStatus(id, "cancelled");
    
    res.status(204).send();
  });

  app.get(api.emails.stats.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const stats = await storage.getStats(userId);
    res.json(stats);
  });

  return httpServer;
}
