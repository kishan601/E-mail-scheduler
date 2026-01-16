import { z } from 'zod';
import { emails, insertEmailSchema, scheduleRequestSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  emails: {
    list: {
      method: 'GET' as const,
      path: '/api/emails',
      input: z.object({
        status: z.enum(["scheduled", "sent", "failed"]).optional(),
        cursor: z.string().optional()
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof emails.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    schedule: {
      method: 'POST' as const,
      path: '/api/emails/schedule',
      input: scheduleRequestSchema,
      responses: {
        201: z.object({ message: z.string(), count: z.number() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/emails/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    stats: {
      method: 'GET' as const,
      path: '/api/emails/stats',
      responses: {
        200: z.object({
          totalScheduled: z.number(),
          totalSent: z.number(),
          totalFailed: z.number()
        }),
        401: errorSchemas.unauthorized,
      }
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ScheduleRequestInput = z.infer<typeof api.emails.schedule.input>;
export type EmailResponse = z.infer<typeof api.emails.list.responses[200]>[number];
