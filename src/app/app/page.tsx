import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { SetupRequired } from "@/components/setup-required";
import { MissionWorkspace } from "@/components/mission-workspace";
import { isAuthConfigured } from "@/lib/config";
import { getAuth } from "@/lib/auth/server";
import { getDatabase } from "@/lib/db";
import { listMissions } from "@/modules/missions/service";
export const dynamic = "force-dynamic";
export default async function WorkspacePage() {
  if (!isAuthConfigured())
    return (
      <Shell section="Missions">
        <SetupRequired />
      </Shell>
    );
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  const membership = await getDatabase().membership.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
    orderBy: { id: "asc" },
  });
  const missions = membership
    ? await listMissions(session.user.id, membership.organizationId)
    : [];
  return (
    <Shell section="Missions">
      <MissionWorkspace
        workspace={membership?.organization ?? null}
        missions={missions}
        canCreate={
          membership?.role === "OWNER" || membership?.role === "OPERATOR"
        }
      />
    </Shell>
  );
}
