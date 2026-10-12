import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { SetupRequired } from "@/components/setup-required";
import { AgreementEditor } from "@/components/agreement-editor";
import { AgreementChanges } from "@/components/agreement-changes";
import { getAuth } from "@/lib/auth/server";
import { isAuthConfigured } from "@/lib/config";
import { AccessError } from "@/modules/agentguard/policy";
import { agreementSchema } from "@/modules/missions/agreement";
import { readMission } from "@/modules/missions/revisions";
import { PaymentReview } from "@/components/payment-review";
import { proposalView } from "@/modules/finance/proposals";
export const dynamic = "force-dynamic";
export default async function MissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isAuthConfigured())
    return (
      <Shell section="Agreement">
        <SetupRequired />
      </Shell>
    );
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  let result;
  try {
    result = await readMission(session.user.id, (await params).id);
  } catch (error) {
    if (error instanceof AccessError) notFound();
    throw error;
  }
  const { mission, role } = result;
  const latest = mission.revisions[0];
  const snapshot = latest?.snapshot as Record<string, unknown> | undefined;
  const agreement = snapshot
    ? agreementSchema.parse({
        participants: snapshot.participants,
        obligations: snapshot.obligations,
        unknowns: snapshot.unknowns,
      })
    : null;
  const previous = mission.revisions[1];
  const previousSnapshot = previous?.snapshot as
    Record<string, unknown> | undefined;
  const previousAgreement = previousSnapshot
    ? agreementSchema.parse({
        participants: previousSnapshot.participants,
        obligations: previousSnapshot.obligations,
        unknowns: previousSnapshot.unknowns,
      })
    : null;
  return (
    <Shell section="Agreement">
      <div className="heading-row">
        <div>
          <div className="eyebrow">Mission terms</div>
          <h1>{mission.title}</h1>
          <p className="subtext">{mission.objective}</p>
        </div>
        <span className="pill">No provider transaction</span>
      </div>
      {agreement && previousAgreement && (
        <AgreementChanges
          before={previousAgreement}
          after={agreement}
          label={`Saved changes · version ${previous.version} → ${latest.version}`}
        />
      )}
      <AgreementEditor
        key={`${latest?.id ?? "new"}-${Boolean(latest?.approvedAt)}`}
        missionId={mission.id}
        budgetMinor={mission.budgetMinor.toString()}
        canEdit={role === "OWNER" || role === "OPERATOR"}
        canApprove={role === "OWNER"}
        latest={
          latest && agreement
            ? {
                id: latest.id,
                version: latest.version,
                contentHash: latest.contentHash,
                approved: Boolean(latest.approvedAt),
                agreement,
              }
            : null
        }
      />
      <PaymentReview
        key={latest?.id ?? "no-revision"}
        missionId={mission.id}
        canPrepare={role === "OWNER"}
        revision={
          latest && agreement
            ? {
                id: latest.id,
                contentHash: latest.contentHash,
                approved: Boolean(latest.approvedAt),
                milestones: agreement.obligations.map(({ id, title }) => ({
                  id,
                  title,
                })),
              }
            : null
        }
        proposals={mission.paymentProposals.map((proposal) =>
          proposalView(proposal, mission.revisionHead),
        )}
      />
      <section className="panel mt-6">
        <h2>Revision history</h2>
        {mission.revisions.length ? (
          mission.revisions.map((revision) => (
            <details key={revision.id} className="revision-history">
              <summary>
                Version {revision.version} ·{" "}
                {revision.approvedAt ? "Owner approved" : "Draft"} ·{" "}
                {revision.createdAt.toISOString()}
              </summary>
              <p className="subtext">
                Fingerprint:{" "}
                <code className="break-all">{revision.contentHash}</code>
              </p>
              <p className="subtext">
                Created by {revision.createdBy}
                {revision.approvedBy
                  ? ` · Owner approval by ${revision.approvedBy}`
                  : ""}
              </p>
              <pre className="snapshot">
                {JSON.stringify(revision.snapshot, null, 2)}
              </pre>
            </details>
          ))
        ) : (
          <p className="subtext">
            Save the first revision to begin the source trail.
          </p>
        )}
      </section>
      <section className="panel mt-6">
        <h2>BlackBox · source trail</h2>
        <p className="subtext">
          Latest 50 recorded mission events. Agreement approval has no financial
          effect.
        </p>
        {mission.traces.map((event) => (
          <details key={event.id} className="revision-history">
            <summary>
              {event.type.replaceAll("_", " ")} ·{" "}
              {event.createdAt.toISOString()}
            </summary>
            <p className="subtext">
              Actor: {event.actorId} · Event: {event.id}
            </p>
            <pre className="snapshot">
              {JSON.stringify(event.payload, null, 2)}
            </pre>
          </details>
        ))}
      </section>
    </Shell>
  );
}
