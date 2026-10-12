export function GET() {
  return Response.json(
    { status: "ok", service: "pact", scope: "application-process" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
