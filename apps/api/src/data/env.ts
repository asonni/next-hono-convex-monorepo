import 'dotenv/config';
import z from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  CONVEX_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
});

let _env: z.infer<typeof envSchema> | null = null;

export const env = new Proxy({} as z.infer<typeof envSchema>, {
  get(_, prop) {
    if (_env === null) {
      const parsed = envSchema.safeParse(process.env);
      if (!parsed.success) {
        throw new Error(`Invalid env: ${parsed.error.message}`);
      }
      _env = parsed.data;
    }
    return _env[prop as keyof typeof _env];
  },
});
