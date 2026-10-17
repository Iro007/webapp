import { z } from 'zod';

const answerSchema = z.object({
  label: z.string(),
  question_type: z.string().optional(),
  answer: z.string(),
});

export const lumaGuestSchema = z.object({
  api_id: z.string().min(1),
  event_api_id: z.string().min(1),
  user_name: z.string().optional(),
  user_email: z.string().optional(),
  approval_status: z.string().optional(),
  registered_at: z.string(),
  checked_in_at: z.string().nullable().optional(),
  registration_answers: z.array(answerSchema),
});

export const lumaEventSchema = z.object({
  api_id: z.string().min(1),
  name: z.string().min(1),
  start_at: z.string(),
});

export const lumaWebhookSchema = z.object({
  type: z.enum(['guest.registered', 'guest.updated']),
  data: z.object({ event: lumaEventSchema, guest: lumaGuestSchema }),
});

export type LumaGuest = z.infer<typeof lumaGuestSchema>;
export type LumaEvent = z.infer<typeof lumaEventSchema>;
export type LumaWebhook = z.infer<typeof lumaWebhookSchema>;
