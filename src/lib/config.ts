import { z } from "zod";

export class ConfigurationError extends Error {
  constructor(public readonly keys: string[]) {
    super(`Configuration required: ${keys.join(", ")}`);
    this.name = "ConfigurationError";
  }
}

const authSchema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .refine((v) => /^postgres(ql)?:/.test(v)),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
});

type Environment = Record<string, string | undefined>;

export function authConfig(env: Environment = process.env) {
  const result = authSchema.safeParse(env);
  if (!result.success) {
    throw new ConfigurationError([
      ...new Set(result.error.issues.map((i) => String(i.path[0]))),
    ]);
  }
  return result.data;
}

export function isAuthConfigured(env: Environment = process.env) {
  return authSchema.safeParse(env).success;
}

export function requireSettings(
  keys: string[],
  env: Environment = process.env,
) {
  const missing = keys.filter((key) => !env[key]?.trim());
  if (missing.length) throw new ConfigurationError(missing);
}
