import { createMissionDraft, listMissions } from "@/modules/missions/service";
import {
  assertSameOrigin,
  errorResponse,
  HttpError,
  requireUser,
} from "@/lib/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const organizationId = new URL(request.url).searchParams.get(
      "organizationId",
    );
    if (!organizationId) throw new HttpError(422, "Choose a workspace.");
    return Response.json(
      { missions: await listMissions(user.id, organizationId) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const mission = await createMissionDraft(user.id, await request.json());
    return Response.json({ mission }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
