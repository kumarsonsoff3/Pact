import { getAuth } from "@/lib/auth/server";
import { errorResponse } from "@/lib/http";
export const runtime = "nodejs";
async function handler(request: Request) {
  try {
    return await getAuth().handler(request);
  } catch (error) {
    return errorResponse(error);
  }
}
export { handler as GET, handler as POST };
