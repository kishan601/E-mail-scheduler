import { Queue, Worker, type Job } from "bullmq";
import { storage } from "../storage";
import { sendEmail } from "./email";
import IORedis from "ioredis";

// Rate limiting and concurrency configuration
const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || "5");

export let emailQueue: Queue | null = null;
export let emailWorker: Worker | null = null;

export async function initQueue() {
  if (emailQueue) return emailQueue;

  console.log("Initializing Queue with REDIS_URL:", process.env.REDIS_URL || "defaulting to localhost");

  if (process.env.NODE_ENV === "production" && !process.env.REDIS_URL) {
    console.warn("REDIS_URL is not set in production. Queue will be disabled.");
    return null;
  }

  // Use provided REDIS_URL or default to localhost
  // Note: For Replit, we need an external Redis URL usually.
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  
  try {
    const connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: false, // Don't queue commands if connection is down
      connectTimeout: 5000,      // Fail fast
      retryStrategy: (times) => {
        // Stop retrying after 3 times if it fails
        if (times > 3) {
          console.error("Redis connection failed too many times. Queue will be disabled.");
          return null;
        }
        return Math.min(times * 50, 2000);
      }
    });

    // Handle connection errors specifically
    connection.on('error', (err) => {
      // Don't log full error if we're shutting down or failed init
      if (connection.status !== 'end') {
        console.error('Redis connection error:', err.message);
      }
    });

    // Test connection
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        if (process.env.NODE_ENV === "production") {
          console.warn("Redis connection timeout in production. Queue will be disabled.");
        } else {
          console.warn("Redis connection timeout. Queue will be disabled.");
        }
        connection.disconnect();
        resolve();
      }, 2000);

      connection.once('connect', () => {
        console.log('Redis connected successfully');
        clearTimeout(timeout);
        resolve();
      });

      connection.once('error', (err) => {
        console.warn("Redis connection error during init:", err.message);
        clearTimeout(timeout);
        resolve();
      });
    });

    if (connection.status === 'ready' || connection.status === 'connecting') {
      emailQueue = new Queue("email-queue", { connection });
      
      emailWorker = new Worker(
        "email-queue",
        async (job: Job) => {
          const { emailId } = job.data;
          console.log(`Processing job ${job.id} for email ${emailId}`);

          try {
            // 1. Fetch email from DB
            const email = await (storage as any).getEmail(emailId);
            if (!email) {
              throw new Error(`Email ${emailId} not found`);
            }

            if (email.status === "cancelled") {
              console.log(`Email ${emailId} was cancelled. Skipping.`);
              return;
            }
            
            // Update status to processing
            await storage.updateEmailStatus(emailId, "processing", undefined, job.id);

            // 2. Send email
            await sendEmail(email.recipient, email.subject, email.body);

            // 3. Update status to sent
            await storage.updateEmailStatus(emailId, "sent", new Date());
            console.log(`Email ${emailId} sent successfully`);

          } catch (error: any) {
            console.error(`Failed to send email ${emailId}:`, error);
            await storage.updateEmailStatus(emailId, "failed", undefined, undefined, error.message);
            throw error; // Let BullMQ handle retries if configured
          }
        },
        {
          connection,
          concurrency: WORKER_CONCURRENCY,
          limiter: {
            max: parseInt(process.env.MAX_EMAILS_PER_HOUR || "100"), // Rate limit
            duration: 3600 * 1000, // 1 hour
          }
        }
      );

      emailWorker.on("completed", (job) => {
        console.log(`Job ${job.id} completed!`);
      });

      emailWorker.on("failed", (job, err) => {
        console.log(`Job ${job?.id} failed with ${err.message}`);
      });
    }

  } catch (error) {
    console.error("Failed to initialize queue:", error);
  }

  return emailQueue;
}
