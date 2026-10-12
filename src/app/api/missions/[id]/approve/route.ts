import { requireUser, assertSameOrigin, errorResponse } from "@/lib/http";
import { approveRevision } from "@/modules/missions/revisions";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    return Response.json({
      revision: await approveRevision(
        user.id,
        (await context.params).id,
        await request.json(),
      ),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
