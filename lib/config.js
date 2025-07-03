import { env } from 'node:process';
import { z } from 'zod';

const envSchema = z.object({
  BSKY_HANDLE: z.string().min(1),
  BSKY_PASSWORD: z.string().min(1),
  BSKY_SERVICE: z.string().min(1).default('https://bsky.social'),
});

const parsedEnv = envSchema.parse(env);

export const bskyAccount = {
  identifier: parsedEnv.BSKY_HANDLE,
  password: parsedEnv.BSKY_PASSWORD,
};

export const bskyService = parsedEnv.BSKY_SERVICE;
