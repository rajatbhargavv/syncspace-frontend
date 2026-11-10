import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = {
  apiBaseUrl: parsed.data.VITE_API_BASE_URL ?? '',
} as const;
