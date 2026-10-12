import { z } from "zod";
import { getDatabase } from "@/lib/db";
import { assertSameOrigin, errorResponse, requireUser } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { name } = z
      .object({ name: z.string().trim().min(2).max(80) })
      .strict()
      .parse(await request.json());
    const workspace = await getDatabase().$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name,
          memberships: { create: { userId: user.id, role: "OWNER" } },
        },
      });
      await tx.blackBoxTraceEvent.create({
        data: {
          organizationId: organization.id,
          actorId: user.id,
          type: "WORKSPACE_CREATED",
          payload: { role: "OWNER", source: "HUMAN_INPUT" },
        },
      });
      return organization;
    });
    return Response.json({ workspace }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
