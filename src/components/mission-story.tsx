"use client";
import { useState } from "react";
import { ArrowRight, Check, FileText, LockKeyhole } from "lucide-react";
import Link from "next/link";
const stages = [
  {
    label: "01 · Intent",
    title: "A launch. Three commitments.",
    description:
      "Launch a new collection with packaging, production samples and campaign content. Start with a $3,000 planned budget.",
    note: "The objective is the starting point. The terms still need review.",
  },
  {
    label: "02 · Agreement",
    title: "Make the handoffs explicit.",
    description:
      "Artwork comes first. Samples depend on approved artwork. Launch content depends on delivered samples. Each commitment gets an owner and an evidence condition.",
    note: "The agreement editor checks allocations and dependency cycles.",
  },
  {
    label: "03 · Review",
    title: "Keep the decision in human hands.",
    description:
      "Review the exact saved revision and resolve open questions. An owner’s approval records review of the terms; payment approval is a separate step.",
    note: "This illustration creates no approval or provider transaction.",
  },
];
export function MissionStory() {
  const [stage, setStage] = useState(0);
  const selected = stages[stage];
  return (
    <div className="mission-story">
      <div className="story-top">
        <span>
          <span className="story-dot" /> Mission preview
        </span>
        <span>Illustrative data</span>
      </div>
      <div className="story-controls" aria-label="Explore the mission workflow">
        {stages.map((item, index) => (
          <button
            key={item.label}
            aria-pressed={stage === index}
            onClick={() => setStage(index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="story-copy" aria-live="polite">
        <h2>{selected.title}</h2>
        <p>{selected.description}</p>
      </div>
      <div className="story-chain" aria-label="Planned commitment dependencies">
        {[
          ["DESIGN", "Packaging artwork", "$750", "Reviewed print-ready files"],
          [
            "SUPPLY",
            "Production samples",
            "$1,800",
            "Delivery receipt + photographs",
          ],
          ["CREATE", "Launch content", "$450", "Reviewed campaign assets"],
        ].map(([role, title, amount, evidence], index) => (
          <div
            className={`story-node ${stage > 0 ? "story-node-linked" : ""}`}
            key={role}
          >
            <span className="story-node-index">0{index + 1}</span>
            <div>
              <span className="story-role">{role}</span>
              <strong>{title}</strong>
              {stage > 0 && <small>{evidence}</small>}
            </div>
            <span className="story-amount">{amount}</span>
          </div>
        ))}
      </div>
      <div className="story-status">
        {stage === 2 ? <LockKeyhole size={17} /> : <FileText size={17} />}
        <span>{selected.note}</span>
      </div>
      <div className="story-footer">
        <span>
          <Check size={14} /> $3,000 planned · $0 transacted in this example
        </span>
        <Link href="/demo/terms" aria-label="Open the agreement editor">
          <ArrowRight size={19} />
        </Link>
      </div>
    </div>
  );
}
