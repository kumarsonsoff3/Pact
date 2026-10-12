import "server-only";
import { Client, Environment } from "@paypal/paypal-server-sdk";
import { ConfigurationError, requireSettings } from "@/lib/config";

let client: Client | undefined;
export function getPayPalSandboxClient() {
  requireSettings(["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"]);
  if (process.env.PAYPAL_ENVIRONMENT !== "sandbox")
    throw new ConfigurationError(["PAYPAL_ENVIRONMENT must be sandbox"]);
  return (client ??= new Client({
    environment: Environment.Sandbox,
    clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.PAYPAL_CLIENT_ID!,
      oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
    },
    timeout: 15_000,
    httpClientOptions: {
      retryConfig: { maxNumberOfRetries: 0, retryOnTimeout: false },
    },
  }));
}
// No payment routes/operations are exposed by this initial client factory.
