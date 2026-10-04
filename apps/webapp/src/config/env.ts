import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  CLERK_SECRET_KEY: z.string(),
});

// const clientEnvSchema = z.object({
// VITE_CLERK_PUBLISHABLE_KEY: z.string(),
// VITE_CLERK_SIGN_IN_URL: z.string(),
// VITE_CLERK_SIGN_UP_URL: z.string(),
// VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: z.string(),
// VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: z.string(),
// });

// Validate server environment
// NOTE: Module-level parse runs at module load. Fine for Node.js;
// on Cloudflare Workers (and other edge runtimes) `process.env` is
// empty at module load, so wrap this in a function and call it
// inside `.handler()` instead:
//
//   export const getServerEnv = () => envSchema.parse(process.env)
//
// Then read `getServerEnv()` per-request from server functions/middleware.
export const getServerEnv = () => envSchema.parse(process.env);

// Validate client environment (build-time, always safe)
// export const clientEnv = clientEnvSchema.parse(import.meta.env);
