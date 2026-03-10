import { z } from 'zod';
export const validateEnv = (config: Record<string, unknown>) => z.object({ NODE_ENV: z.string().default('development') }).passthrough().parse(config);
