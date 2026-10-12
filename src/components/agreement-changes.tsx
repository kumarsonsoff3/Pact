import type { Agreement } from "@/modules/missions/agreement";
import { compareAgreements } from "@/modules/missions/overview";

export function AgreementChanges({
  before,
  after,
  label,
}: {
  before: Agreement;
  after: Agreement;
  label: string;
}) {
  const changes = compareAgreements(before, after);
  return (
    <section className="panel my-6" aria-label="Agreement changes">
      <h2>{label}</h2>
      {changes.length ? (
        <ul className="agreement-change-list">
          {changes.map((change, index) => (
            <li key={index}>
              <h3>
                {change.subject} · {change.field}
              </h3>
              <div className="change-values">
                <div>
                  <strong>Before</strong>
                  <p>{change.before}</p>
                </div>
                <div>
                  <strong>After</strong>
                  <p>{change.after}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="subtext">
          No changes to participants, milestone terms or open questions.
        </p>
      )}
      <p className="subtext">
        Changing terms does not approve work or authorize a payment.
      </p>
    </section>
  );
}
