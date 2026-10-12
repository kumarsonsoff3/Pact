import { assertSameOrigin, errorResponse, requireUser } from "@/lib/http";
import { preparePaymentProposal } from "@/modules/finance/proposals";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    return Response.json(
      await preparePaymentProposal(
        user.id,
        (await context.params).id,
        await request.json(),
      ),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
