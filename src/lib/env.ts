import "server-only";
import { z } from "zod";

const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const optionalURL = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.httpUrl().optional(),
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: optionalString,
  DIRECT_URL: optionalString,

  BETTER_AUTH_SECRET: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(32).optional(),
  ),
  BETTER_AUTH_URL: optionalURL,

  MONGODB_URI: optionalString,
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid enviroment variables: ", z.treeifyError(result.error));

  throw new Error("Enviroment variable validation failed.");
}

export const env = result.data;

export function getRequiredEnv<K extends keyof typeof env>(key: K): NonNullable<(typeof env)[K]> {
  const value = env[key];

  if (value === undefined || value === "") {
    throw new Error(`Missing required enviroment variable: ${key}`);
  }

  return value as NonNullable<(typeof env)[K]>;
}
