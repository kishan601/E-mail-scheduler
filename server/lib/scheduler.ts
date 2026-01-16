import { storage } from "../storage";
import { sendEmail } from "./email";
import { addSeconds, addHours, startOfHour } from "date-fns";

export async function scheduleBatch(userId: string, data: any) {
  const { subject, body, recipients, startTime, delay, hourlyLimit } = data;
  
  const start = new Date(startTime);
  let scheduledCount = 0;
  const emailsPerHour = new Map<string, number>();
  
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    let scheduledTime = addSeconds(start, i * delay);
    
    while (true) {
      const hourKey = startOfHour(scheduledTime).toISOString();
      const currentCount = emailsPerHour.get(hourKey) || 0;
      
      if (currentCount < hourlyLimit) {
        emailsPerHour.set(hourKey, currentCount + 1);
        break;
      } else {
        scheduledTime = addHours(startOfHour(scheduledTime), 1);
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

    // Since we're removing Redis, we'll process it immediately if scheduled for now,
    // or just leave it in the DB. For a simple "no-redis" version, we'll just 
    // mark it as scheduled. In a real simple app, you'd have a setInterval poller.
    // For now, we just remove the Redis call.
    
    scheduledCount++;
  }
  
  return scheduledCount;
}
