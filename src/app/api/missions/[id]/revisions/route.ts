import { requireUser, assertSameOrigin, errorResponse } from "@/lib/http";
import { saveRevision } from "@/modules/missions/revisions";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    return Response.json(
      {
        revision: await saveRevision(
          user.id,
          (await context.params).id,
          await request.json(),
        ),
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
