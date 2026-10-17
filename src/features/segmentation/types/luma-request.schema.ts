import { z } from 'zod';

export const simulateLumaRequestSchema = z.object({
  kind: z.enum(['registration', 'check_in', 'auto']).default('auto'),
});
