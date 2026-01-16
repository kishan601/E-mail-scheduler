import { emailQueue } from "./queue";
import { storage } from "../storage";
import type { ScheduleRequest } from "@shared/schema";
import { addSeconds, addHours, startOfHour } from "date-fns";

export async function scheduleBatch(userId: string, data: ScheduleRequest) {
  const { subject, body, recipients, startTime, delay, hourlyLimit } = data;
  
  const start = new Date(startTime);
  const now = new Date();
  
  let scheduledCount = 0;
  
  // Check if queue is available
  if (!emailQueue) {
    console.warn("Queue is not initialized. Emails will be saved to DB but not scheduled.");
  }
  
  // Basic scheduling logic:
  // We need to distribute emails respecting the delay AND the hourly limit.
  // 
  // Strategy:
  // 1. Calculate the ideal time for each email based on delay: Start + (i * delay)
  // 2. Check if that time falls into an hour bucket that is full.
  // 3. If full, push to the next hour.
  
  // Note: For a "production grade" system handling thousands, we might want to 
  // push this logic into a "Batch Job" processor instead of doing it in the HTTP request.
  // But for this assignment, we'll do it here.
  
  // Track usage per hour window to enforce limit
  // In a real system, this should be in Redis. Here we'll calculate offsets.
  
  const emailsPerHour = new Map<string, number>();
  
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    // Initial calculated time based on delay
    let scheduledTime = addSeconds(start, i * delay);
    
    // Check hourly limit
    // We iterate until we find a slot
    while (true) {
      const hourKey = startOfHour(scheduledTime).toISOString();
      const currentCount = emailsPerHour.get(hourKey) || 0;
      
      if (currentCount < hourlyLimit) {
        // Slot found
        emailsPerHour.set(hourKey, currentCount + 1);
        break;
      } else {
        // Hour full, move to start of next hour
        scheduledTime = addHours(startOfHour(scheduledTime), 1);
        // Add a small jitter or reset the minute/second to preserve order?
        // Simpler to just move to next hour + (original minute/second offset % 3600)? 
        // Or just stack them at the start of the hour?
        // Let's stack them at start of next hour + (i % 60) seconds to spread slightly
        scheduledTime = addSeconds(scheduledTime, (i % 60)); 
      }
    }
    
    // Create DB Record
    const email = await storage.createEmail({
      userId,
      recipient,
      subject,
      body,
      scheduledTime,
      startTime: start,
      delay,
      rateLimit: hourlyLimit
    });
    
    // Add to Queue (only if available)
    if (emailQueue) {
        // Calculate delay in ms from NOW (BullMQ expects delay from now)
        const delayMs = Math.max(0, scheduledTime.getTime() - Date.now());
        
        await emailQueue.add("send-email", {
        emailId: email.id,
        recipient
        }, {
        delay: delayMs,
        jobId: `email-${email.id}` // Deduplication
        });
    }
    
    scheduledCount++;
  }
  
  return scheduledCount;
}
