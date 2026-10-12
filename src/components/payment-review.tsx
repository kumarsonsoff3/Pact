"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatUsd } from "@/lib/money";
import type { ProposalView } from "@/modules/finance/contracts";

export function PaymentReview({
  missionId,
  revision,
  canPrepare,
  proposals,
}: {
  missionId: string;
  revision: {
    id: string;
    contentHash: string;
    approved: boolean;
    milestones: { id: string; title: string }[];
  } | null;
  canPrepare: boolean;
  proposals: ProposalView[];
}) {
  const router = useRouter();
  const [obligationId, setObligationId] = useState(
    revision?.milestones[0]?.id ?? "",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const request = useRef<{ key: string; id: string } | null>(null);
  async function prepare() {
    if (!revision || pending) return;
    const key = `${revision.id}:${obligationId}`;
    if (request.current?.key !== key)
      request.current = { key, id: crypto.randomUUID() };
    setPending(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(
        `/api/missions/${missionId}/payment-proposals`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            revisionId: revision.id,
            contentHash: revision.contentHash,
            obligationId,
            requestId: request.current.id,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not prepare this review.");
      request.current = null;
      setNotice(
        result.reused
          ? "Existing review reused. No payment was made."
          : "Review saved. No payment was made.",
      );
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please retry.");
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="panel mt-6" aria-label="Payment preparation">
      <h2>Payment preparation</h2>
      <p className="subtext">
        Prepare a review from saved, owner-approved terms. This records a
        planned amount only. Evidence verification, merchant connection and
        payment approval must be implemented before execution.
      </p>
      {canPrepare && revision?.approved ? (
        <>
          <div className="field">
            <label htmlFor="payment-milestone">Milestone to review</label>
            <select
              id="payment-milestone"
              value={obligationId}
              disabled={pending}
              onChange={(e) => setObligationId(e.target.value)}
            >
              {revision.milestones.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>
          <Button
            className="mt-4"
            disabled={pending || !obligationId}
            onClick={() => void prepare()}
          >
            {pending ? "Preparing…" : "Prepare payment review"}
          </Button>
        </>
      ) : (
        <p className="notice">
          A workspace owner can prepare a review after approving the current
          agreement.
        </p>
      )}
      {error && (
        <p role="alert" className="form-message mt-4">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="subtext">
          {notice}
        </p>
      )}
      <p className="subtext mt-4">
        Latest 20 saved reviews. None authorizes or executes a payment.
      </p>
      {proposals.length ? (
        proposals.map((proposal) => (
          <details key={proposal.id} className="revision-history">
            <summary>
              {formatUsd(proposal.amountMinor)} · version{" "}
              {proposal.revisionVersion} · execution blocked
            </summary>
            <p className="subtext">
              Milestone ID: {proposal.obligationId} · Review window ends:{" "}
              {proposal.expiresAt}
            </p>
            <ul className="list-disc pl-5 text-sm">
              {proposal.blockers.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            <p className="subtext break-all">
              Review fingerprint: {proposal.fingerprint}
            </p>
          </details>
        ))
      ) : (
        <p className="subtext">No payment reviews prepared yet.</p>
      )}
    </section>
  );
}
