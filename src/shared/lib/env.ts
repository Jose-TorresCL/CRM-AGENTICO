import { z } from "zod";

const publicEnvSchema = z.object({
  appUrl: z.url(),
  supabaseUrl: z.url(),
  supabasePublishableKey: z.string().min(1),
});

const serverEnvSchema = z.object({
  databaseUrl: z.string().min(1),
});

export function getPublicEnv() {
  return publicEnvSchema.parse({
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}

export function getServerEnv() {
  return serverEnvSchema.parse({
    databaseUrl: process.env.DATABASE_URL,
  });
}
