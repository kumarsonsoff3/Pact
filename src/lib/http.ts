import "server-only";
import { z } from "zod";
import { getAuth } from "@/lib/auth/server";
import { ConfigurationError } from "@/lib/config";
import { AccessError } from "@/modules/agentguard/policy";
import { AgreementError, RevisionConflict } from "@/modules/missions/agreement";
import { isDatabaseConflict } from "@/lib/database-errors";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function requireUser(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) throw new HttpError(401, "Please sign in to continue.");
  return session.user;
}

export function assertSameOrigin(request: Request) {
  const expected = new URL(
    process.env.BETTER_AUTH_URL || "http://localhost:3005",
  ).origin;
  if (request.headers.get("origin") !== expected)
    throw new HttpError(403, "Request origin is not allowed.");
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    throw new HttpError(415, "Send JSON data.");
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof AgreementError)
    return Response.json({ error: error.message }, { status: 422 });
  if (error instanceof RevisionConflict)
    return Response.json({ error: error.message }, { status: 409 });
  if (isDatabaseConflict(error))
    return Response.json(
      {
        error:
          "Another change was saved. Reload and review before trying again.",
      },
      { status: 409 },
    );
  if (error instanceof ConfigurationError)
    return Response.json(
      { error: "Workspace setup is incomplete. Contact the project owner." },
      { status: 503 },
    );
  if (error instanceof AccessError)
    return Response.json(
      { error: "You do not have access to this workspace action." },
      { status: 403 },
    );
  if (error instanceof z.ZodError || error instanceof SyntaxError)
    return Response.json(
      { error: "Check the required fields and use a valid USD amount." },
      { status: 422 },
    );
  if (error instanceof HttpError)
    return Response.json({ error: error.message }, { status: error.status });
  // Do not serialize database/provider errors, which may contain private configuration.
  console.error("PACT request failed", {
    errorType: error instanceof Error ? error.name : "Unknown",
    databaseCode:
      error &&
      typeof error === "object" &&
      "cause" in error &&
      error.cause &&
      typeof error.cause === "object" &&
      "originalCode" in error.cause &&
      typeof error.cause.originalCode === "string" &&
      /^[A-Z0-9]{5}$/.test(error.cause.originalCode)
        ? error.cause.originalCode
        : undefined,
  });
  return Response.json(
    { error: "The request could not be completed. Please try again." },
    { status: 500 },
  );
}
