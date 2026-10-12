import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Fingerprint,
  GitBranch,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { MissionStory } from "@/components/mission-story";
import "./landing.css";

export default function Home() {
  return (
    <div className="landing">
      <header className="landing-nav landing-wrap">
        <Link className="brand" href="/" aria-label="PACT home">
          <span className="brand-mark" aria-hidden="true" />
          PACT<span className="landing-beta">IN DEVELOPMENT</span>
        </Link>
        <nav aria-label="Site navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#when-plans-change">When plans change</a>
          <a href="#trust">Built on trust</a>
        </nav>
        <Link className="landing-login" href="/sign-in">
          Your workspace <ArrowUpRight size={15} />
        </Link>
      </header>
      <main id="main">
        <section
          className="landing-hero landing-wrap"
          aria-labelledby="hero-title"
        >
          <div className="landing-hero-copy">
            <div className="landing-kicker">
              <span /> AGREEMENTS WITH ACCOUNTABILITY
            </div>
            <h1 id="hero-title">
              Your intent defines the deal.
              <br />
              <em>Evidence guides the decision.</em>
            </h1>
            <p className="landing-lead">
              Bring the people, promises and proof into one shared mission. Know
              what was agreed, what changed, and who approves what happens next.
            </p>
            <div className="landing-actions">
              <Link className="landing-cta" href="/demo/terms">
                Try the agreement editor <ArrowRight size={17} />
              </Link>
              <Link className="landing-text-link" href="/demo">
                Explore an example <ArrowUpRight size={16} />
              </Link>
            </div>
            <p className="landing-caption">
              No sign-up needed for the example. No money moves.
            </p>
            <div className="landing-principles">
              <span>
                <ShieldCheck size={17} /> Human review
              </span>
              <span>
                <GitBranch size={17} /> Connected commitments
              </span>
              <span>
                <Fingerprint size={17} /> A source trail
              </span>
            </div>
          </div>
          <div className="landing-hero-product">
            <div className="landing-product-label">
              FROM AN OBJECTIVE TO A SHARED PLAN <span>↘</span>
            </div>
            <MissionStory />
            <div className="landing-product-footnote">
              Explore the steps above, then try the working editor.
            </div>
          </div>
        </section>
        <div className="landing-stack">
          <div className="landing-wrap">
            <span>Being built for the PayPal AI Hackathon</span>
            <p>
              <strong>PayPal</strong> payments <span>·</span>{" "}
              <strong>AG Studio</strong> investigation layouts <span>·</span>{" "}
              <strong>PACT</strong> human control
            </p>
          </div>
        </div>
        <section id="how-it-works" className="landing-section landing-wrap">
          <div className="landing-section-intro">
            <div>
              <span className="landing-kicker">01 / ONE CONNECTED MISSION</span>
              <h2>
                Good work needs
                <br />
                more than a payment link.
              </h2>
            </div>
            <p>
              When terms live in a document, progress lives in a chat, and
              decisions lose their context, every exception starts from scratch.
              PACT is being built to keep the whole story together.
            </p>
          </div>
          <div className="landing-process">
            {[
              {
                number: "01",
                icon: Layers3,
                title: "Define what success means.",
                body: "Name the participants. Set the obligations, planned allocations and evidence conditions. Review a version everyone can refer back to.",
                engine: "IntentOS",
                status: "Manual agreement editor available",
              },
              {
                number: "02",
                icon: GitBranch,
                title: "Understand what changed.",
                body: "Connect evidence to the commitment it supports. Investigate a delivery issue or a missed dependency in the context of the original plan.",
                engine: "ResolvOS + AG Studio",
                status: "Evidence and AI composition upcoming",
              },
              {
                number: "03",
                icon: ShieldCheck,
                title: "Approve with the context.",
                body: "See the terms, evidence and policy behind a proposed action. Keep owner review and financial authorization explicit and separate.",
                engine: "AgentGuard + BlackBox",
                status: "Terms approval built; payments upcoming",
              },
            ].map(({ number, icon: Icon, title, body, engine, status }) => (
              <article key={number}>
                <div className="process-number">
                  <span>{number}</span>
                  <Icon size={22} />
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
                <div className="process-engine">{engine}</div>
                <small>{status}</small>
              </article>
            ))}
          </div>
        </section>
        <section id="when-plans-change" className="landing-scenarios">
          <div className="landing-wrap">
            <div className="landing-section-intro">
              <div>
                <span className="landing-kicker">
                  02 / EXCEPTIONS NEED CONTEXT
                </span>
                <h2>
                  Different problems.
                  <br />
                  Different questions.
                </h2>
              </div>
              <p>
                These are the two investigation journeys planned for PACT.
                Actual AI-composed Case Rooms are still in development.
              </p>
            </div>
            <div className="scenario-grid">
              <article className="scenario-delivery">
                <span className="scenario-tag">DELIVERY EXCEPTION</span>
                <h3>
                  The shipment arrived.
                  <br />
                  The outcome didn’t.
                </h3>
                <p>
                  A damaged or late delivery calls for a shared timeline, the
                  agreed conditions, and evidence that supports—or
                  contradicts—the claim.
                </p>
                <ul>
                  <li>What was promised?</li>
                  <li>What does the delivery evidence establish?</li>
                  <li>Which remedy can an authorized person approve?</li>
                </ul>
                <div className="scenario-trail">
                  <span>Agreement</span>
                  <ArrowRight size={14} />
                  <span>Evidence</span>
                  <ArrowRight size={14} />
                  <span>Review</span>
                </div>
              </article>
              <article className="scenario-supplier">
                <span className="scenario-tag">SUPPLIER EXCEPTION</span>
                <h3>
                  One milestone slips.
                  <br />
                  What happens downstream?
                </h3>
                <p>
                  A missed sample date affects the work that depends on it.
                  Understand the dependencies and planned budget before
                  approving a revised plan.
                </p>
                <ul>
                  <li>Which commitments are affected?</li>
                  <li>Can the plan fit the remaining budget?</li>
                  <li>What changes need a new agreement revision?</li>
                </ul>
                <div className="scenario-trail">
                  <span>Dependency</span>
                  <ArrowRight size={14} />
                  <span>Impact</span>
                  <ArrowRight size={14} />
                  <span>Amendment</span>
                </div>
              </article>
            </div>
            <Link
              className="landing-text-link scenario-link"
              href="/demo/terms"
            >
              Explore the underlying agreement <ArrowRight size={17} />
            </Link>
          </div>
        </section>
        <section
          id="trust"
          className="landing-trust landing-wrap landing-section"
        >
          <div>
            <span className="landing-kicker">
              03 / ACCOUNTABILITY BY DESIGN
            </span>
            <h2>
              A suggestion is a starting point.
              <br />
              <em>You make the decision.</em>
            </h2>
            <p>
              AI will help structure intent and investigate evidence. Authority
              stays with people and deterministic server policies.
            </p>
            <Link className="landing-text-link" href="/app">
              Open your workspace <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="trust-ledger">
            <div>
              <ShieldCheck />
              <h3>Approval means something specific.</h3>
              <p>
                Owner review applies to an exact agreement revision. A later
                edit needs a new review. Payment authorization stays separate.
              </p>
            </div>
            <div>
              <Fingerprint />
              <h3>Keep the source in sight.</h3>
              <p>
                Saved revisions and recorded approval events identify the terms
                and person behind the decision.
              </p>
            </div>
            <div>
              <Layers3 />
              <h3>Planned money stays clearly labeled.</h3>
              <p>
                Allocations describe a plan. They do not mean money is held,
                paid, refunded or distributed to participants.
              </p>
            </div>
          </div>
        </section>
        <section className="landing-faq landing-wrap">
          <div>
            <span className="landing-kicker">A FEW CLEAR ANSWERS</span>
            <h2>Before you explore.</h2>
          </div>
          <div>
            <details>
              <summary>What can I try today?</summary>
              <p>
                The interactive agreement editor checks allocations,
                participants and dependencies using sample data. The
                account-backed workflow includes mission drafts, revision
                history and owner review; it needs the configured database and
                migrations. AI investigations and PayPal transactions are not
                active yet.
              </p>
            </details>
            <details>
              <summary>Does PACT hold money in escrow?</summary>
              <p>
                No. PACT does not hold funds. Planned allocations are part of
                the agreement. Future supported payments will run through PayPal
                with separate approval, verification and an audit trail.
              </p>
            </details>
            <details>
              <summary>Can AI approve an agreement or send a payment?</summary>
              <p>
                No. AI-generated terms and remedies will remain proposals.
                Server policies and explicit human authorization govern
                consequential actions.
              </p>
            </details>
            <details>
              <summary>Do I need an account for the example?</summary>
              <p>
                No. The example runs locally in your browser with synthetic
                data. Changes disappear when you reload and create no approvals
                or transactions.
              </p>
            </details>
          </div>
        </section>
        <section className="landing-final landing-wrap">
          <Sparkles size={24} />
          <span className="landing-kicker">START WITH SOMETHING CONCRETE</span>
          <h2>
            Give your next mission
            <br />a shared understanding.
          </h2>
          <Link className="landing-cta" href="/demo/terms">
            Build an example agreement <ArrowRight size={17} />
          </Link>
          <p>Explore freely. Review deliberately.</p>
        </section>
      </main>
      <footer className="landing-footer landing-wrap">
        <Link className="brand" href="/" aria-label="PACT home">
          PACT
          <span className="landing-beta">
            INTENT · EVIDENCE · ACCOUNTABILITY
          </span>
        </Link>
        <div>
          <Link href="/demo">Product example</Link>
          <Link href="/sign-in">Sign in</Link>
          <a href="#how-it-works">How it works</a>
        </div>
        <p>
          Development preview · PayPal sandbox integration upcoming · No live
          payments
        </p>
      </footer>
    </div>
  );
}
