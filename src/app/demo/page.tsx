import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
export default function Demo() {
  return (
    <Shell section="Preview">
      <div className="heading-row">
        <div>
          <div className="eyebrow">Illustrative mission · Nova Retail</div>
          <h1>A launch with everyone aligned.</h1>
          <p className="subtext">
            Bring a physical product to market in 14 days.
          </p>
        </div>
        <span className="pill blue">Sample data · read only</span>
      </div>
      <div className="notice">
        This is a seeded product preview. No agreement has been approved and no
        PayPal payment has been made.
      </div>
      <div className="stats">
        <div className="stat">
          <span>Planned budget</span>
          <strong>$3,000.00</strong>
          <span>Commercial plan only</span>
        </div>
        <div className="stat">
          <span>Participants</span>
          <strong>3</strong>
          <span>Designer, supplier and creator</span>
        </div>
        <div className="stat">
          <span>Provider transactions</span>
          <strong>None</strong>
          <span>No provider resources connected</span>
        </div>
      </div>
      <div className="columns">
        <section className="panel">
          <h2>Proposed commitments</h2>
          <Link className="text-link" href="/demo/terms">
            Try the agreement editor
          </Link>
          {[
            [
              "Packaging design",
              "Designer · final artwork and review",
              "$750.00",
            ],
            [
              "Production samples",
              "Supplier · photos and delivery evidence",
              "$1,800.00",
            ],
            [
              "Launch content",
              "Creator · assets after sample delivery",
              "$450.00",
            ],
          ].map(([title, detail, amount]) => (
            <div className="obligation" key={title}>
              <div>
                <strong>{title}</strong>
                <p>{detail}</p>
              </div>
              <span className="text-sm font-medium">{amount}</span>
            </div>
          ))}
        </section>
        <section className="panel">
          <h2>When the plan changes</h2>
          <p className="subtext">
            A delivery issue needs evidence and remedy comparisons. A supplier
            delay needs a dependency map and recovery plan.
          </p>
          <p className="subtext">
            Future Case Rooms will be composed by AG Studio agents around those
            different questions.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/app">
              Create your own draft <ArrowRight size={16} />
            </Link>
          </Button>
        </section>
      </div>
    </Shell>
  );
}
