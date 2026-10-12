"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { usdToMinor, formatUsd } from "@/lib/money";
import type { Agreement } from "@/modules/missions/agreement";
import { validateAgreement } from "@/modules/missions/agreement";
import { MissionControl } from "@/components/mission-control";
import { AgreementChanges } from "@/components/agreement-changes";

type Revision = {
  id: string;
  version: number;
  contentHash: string;
  approved: boolean;
  agreement: Agreement;
};
export function AgreementEditor({
  missionId,
  budgetMinor,
  latest,
  canEdit,
  canApprove,
  preview = false,
}: {
  missionId: string;
  budgetMinor: string;
  latest: Revision | null;
  canEdit: boolean;
  canApprove: boolean;
  preview?: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Agreement>(
    latest?.agreement ?? { participants: [], obligations: [], unknowns: [] },
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [notice, setNotice] = useState("");
  const dirty = JSON.stringify(draft) !== JSON.stringify(latest?.agreement);
  async function send(action: "revisions" | "approve") {
    if (preview) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/missions/${missionId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "revisions"
            ? { expectedVersion: latest?.version ?? 0, agreement: draft }
            : {
                revisionId: latest?.id,
                contentHash: latest?.contentHash,
                confirmed,
              },
        ),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not save the agreement.");
      setConfirmed(false);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Try again shortly.");
    } finally {
      setPending(false);
    }
  }
  function updateObligation(
    index: number,
    update: Partial<Agreement["obligations"][number]>,
  ) {
    setDraft({
      ...draft,
      obligations: draft.obligations.map((item, i) =>
        i === index ? { ...item, ...update } : item,
      ),
    });
  }
  return (
    <>
      <MissionControl
        agreement={draft}
        budgetMinor={budgetMinor}
        source={
          preview
            ? "Synthetic example · not saved"
            : dirty
              ? "Unsaved draft"
              : `Saved version ${latest?.version ?? 0} · ${latest?.approved ? "owner approved" : "draft"}`
        }
      />
      {latest && dirty && (
        <AgreementChanges
          before={latest.agreement}
          after={draft}
          label={`Unsaved changes from version ${latest.version}`}
        />
      )}
      <section className="panel">
        <div className="section-heading">
          <h2>
            Agreement terms{" "}
            {latest ? `· version ${latest.version}` : "· first draft"}
          </h2>
          <span className="pill">
            {latest?.approved ? "Owner approved" : "Awaiting review"}
          </span>
        </div>
        <p className="subtext">
          {formatUsd(budgetMinor)} planned budget. Named participants are
          commitments in the plan; their account access and consent are
          separate.
        </p>
        <fieldset disabled={!canEdit || pending} className="agreement-fields">
          <legend>Participants</legend>
          {draft.participants.map((participant, index) => (
            <div className="agreement-row" key={participant.id}>
              <div className="field">
                <label htmlFor={`participant-${index}`}>
                  Participant {index + 1}
                </label>
                <input
                  id={`participant-${index}`}
                  value={participant.name}
                  maxLength={120}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      participants: draft.participants.map((p, i) =>
                        i === index ? { ...p, name: e.target.value } : p,
                      ),
                    })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor={`role-${index}`}>Role in the plan</label>
                <input
                  id={`role-${index}`}
                  value={participant.role}
                  maxLength={80}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      participants: draft.participants.map((p, i) =>
                        i === index ? { ...p, role: e.target.value } : p,
                      ),
                    })
                  }
                />
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  setDraft({
                    ...draft,
                    participants: draft.participants.filter(
                      (p) => p.id !== participant.id,
                    ),
                  })
                }
              >
                Remove participant {index + 1}
              </Button>
            </div>
          ))}
          {canEdit && (
            <Button
              variant="outline"
              disabled={draft.participants.length >= 30}
              onClick={() =>
                setDraft({
                  ...draft,
                  participants: [
                    ...draft.participants,
                    { id: crypto.randomUUID(), name: "", role: "" },
                  ],
                })
              }
            >
              Add participant
            </Button>
          )}
        </fieldset>
        <fieldset disabled={!canEdit || pending} className="agreement-fields">
          <legend>Obligations and evidence conditions</legend>
          {draft.obligations.map((obligation, index) => (
            <div className="agreement-obligation" key={obligation.id}>
              <div className="agreement-row">
                <div className="field">
                  <label htmlFor={`title-${index}`}>
                    Obligation {index + 1}
                  </label>
                  <input
                    id={`title-${index}`}
                    value={obligation.title}
                    maxLength={160}
                    onChange={(e) =>
                      updateObligation(index, { title: e.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor={`owner-${index}`}>
                    Responsible participant
                  </label>
                  <select
                    id={`owner-${index}`}
                    value={obligation.participantId}
                    onChange={(e) =>
                      updateObligation(index, { participantId: e.target.value })
                    }
                  >
                    <option value="">Choose participant</option>
                    {draft.participants.map((p) => (
                      <option value={p.id} key={p.id}>
                        {p.name || "Unnamed participant"}
                      </option>
                    ))}
                  </select>
                </div>
                <AllocationInput
                  id={`amount-${index}`}
                  amount={obligation.allocationMinor}
                  onChange={(allocationMinor) =>
                    updateObligation(index, { allocationMinor })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor={`acceptance-${index}`}>
                  What evidence demonstrates completion?
                </label>
                <textarea
                  id={`acceptance-${index}`}
                  value={obligation.acceptance}
                  maxLength={2000}
                  onChange={(e) =>
                    updateObligation(index, { acceptance: e.target.value })
                  }
                />
              </div>
              <fieldset className="dependency-options">
                <legend>Depends on completion of</legend>
                {draft.obligations
                  .filter((o) => o.id !== obligation.id)
                  .map((o) => (
                    <label key={o.id}>
                      <input
                        type="checkbox"
                        checked={obligation.dependsOn.includes(o.id)}
                        onChange={(e) =>
                          updateObligation(index, {
                            dependsOn: e.target.checked
                              ? [...obligation.dependsOn, o.id]
                              : obligation.dependsOn.filter(
                                  (id) => id !== o.id,
                                ),
                          })
                        }
                      />{" "}
                      {o.title || "Untitled obligation"}
                    </label>
                  ))}
                {draft.obligations.length < 2 && (
                  <p className="subtext">
                    Add another obligation to define a dependency.
                  </p>
                )}
              </fieldset>
              <Button
                variant="outline"
                onClick={() =>
                  setDraft({
                    ...draft,
                    obligations: draft.obligations
                      .filter((o) => o.id !== obligation.id)
                      .map((o) => ({
                        ...o,
                        dependsOn: o.dependsOn.filter(
                          (id) => id !== obligation.id,
                        ),
                      })),
                  })
                }
              >
                Remove obligation {index + 1}
              </Button>
            </div>
          ))}
          {canEdit && (
            <Button
              variant="outline"
              disabled={draft.obligations.length >= 50}
              onClick={() =>
                setDraft({
                  ...draft,
                  obligations: [
                    ...draft.obligations,
                    {
                      id: crypto.randomUUID(),
                      participantId: draft.participants[0]?.id ?? "",
                      title: "",
                      acceptance: "",
                      allocationMinor: "0",
                      dependsOn: [],
                    },
                  ],
                })
              }
            >
              Add obligation
            </Button>
          )}
        </fieldset>
        <div className="field">
          <label htmlFor="unknowns">Open questions — one per line</label>
          <textarea
            id="unknowns"
            disabled={!canEdit || pending}
            defaultValue={draft.unknowns.join("\n")}
            onChange={(e) =>
              setDraft({
                ...draft,
                unknowns: e.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
              })
            }
          />
          <p className="subtext">
            Resolve and remove all open questions before owner approval.
          </p>
        </div>
        {error && (
          <p role="alert" className="form-message">
            {error}
          </p>
        )}
        {preview && (
          <div className="actions">
            <Button
              onClick={() => {
                setNotice("");
                setError("");
                try {
                  validateAgreement(draft, BigInt(budgetMinor));
                  setNotice(
                    "Structure checks passed. This example has not been saved or approved.",
                  );
                } catch (error) {
                  setError(
                    error instanceof Error && error.name !== "ZodError"
                      ? error.message
                      : "Complete participant names, obligations, evidence conditions and valid amounts.",
                  );
                }
              }}
            >
              Check example terms
            </Button>
          </div>
        )}
        {notice && (
          <p role="status" className="subtext">
            {notice}
          </p>
        )}
        {!preview && canEdit && (
          <div className="actions">
            <Button
              disabled={pending || !dirty}
              onClick={() => {
                void send("revisions");
              }}
            >
              {pending
                ? "Saving…"
                : latest
                  ? "Save as a new revision"
                  : "Save first revision"}
            </Button>
          </div>
        )}
        {!preview && latest && !latest.approved && canApprove && (
          <div className="approval-panel">
            <h3>Owner review</h3>
            <p className="subtext">
              Review the saved terms above. This records your approval of this
              exact revision. It does not record other participants’ consent or
              authorize a PayPal payment.
            </p>
            <label>
              <input
                type="checkbox"
                checked={confirmed}
                disabled={dirty || pending}
                onChange={(e) => setConfirmed(e.target.checked)}
              />{" "}
              I have reviewed version {latest.version} and approve these mission
              terms.
            </label>
            <div className="actions">
              <Button
                disabled={
                  !confirmed ||
                  dirty ||
                  pending ||
                  latest.agreement.unknowns.length > 0
                }
                onClick={() => {
                  void send("approve");
                }}
              >
                Approve version {latest.version}
              </Button>
            </div>
            {dirty && (
              <p className="subtext">
                Save your changes and review the new revision before approval.
              </p>
            )}
          </div>
        )}
      </section>
    </>
  );
}

function AllocationInput({
  id,
  amount,
  onChange,
}: {
  id: string;
  amount: string;
  onChange: (value: string) => void;
}) {
  const [value, setValue] = useState(() =>
    formatUsd(amount).replace(/[$,]/g, ""),
  );
  const [invalid, setInvalid] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>Planned allocation (USD)</label>
      <input
        id={id}
        inputMode="decimal"
        value={value}
        aria-invalid={invalid}
        onChange={(e) => {
          setValue(e.target.value);
          try {
            onChange(usdToMinor(e.target.value));
            setInvalid(false);
          } catch {
            onChange("");
            setInvalid(true);
          }
        }}
      />
      {invalid && (
        <span role="alert">
          Enter a USD amount with up to two decimal places.
        </span>
      )}
    </div>
  );
}
