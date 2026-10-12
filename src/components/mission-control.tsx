"use client";

import { useMemo, useState } from "react";
import {
  Background,
  Controls,
  MarkerType,
  Position,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { formatUsd } from "@/lib/money";
import { projectAgreement } from "@/modules/missions/overview";
import type { Agreement } from "@/modules/missions/agreement";

export function MissionControl({
  agreement,
  budgetMinor,
  source,
}: {
  agreement: Agreement;
  budgetMinor: string;
  source: string;
}) {
  const [selectedId, setSelectedId] = useState<string>();
  const result = useMemo(() => {
    try {
      return { projection: projectAgreement(agreement, budgetMinor) };
    } catch {
      return { projection: null };
    }
  }, [agreement, budgetMinor]);
  const projection = result.projection;
  if (!projection)
    return (
      <section className="notice my-6" aria-label="Mission Control">
        <h2>Mission Control</h2>
        <p>
          Complete valid participants, amounts and evidence conditions to
          preview the plan. Dependencies must reference existing milestones and
          cannot form a cycle.
        </p>
      </section>
    );
  const selected =
    projection.milestones.find((item) => item.id === selectedId) ??
    projection.milestones[0];
  const nodes = projection.milestones.map((item) => ({
    id: item.id,
    position: item.position,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    selected: item.id === selected.id,
    data: {
      label: (
        <>
          <strong>{item.title}</strong>
          <span>
            {item.participant} · {formatUsd(item.allocationMinor)}
          </span>
        </>
      ),
    },
    style: { width: 230, minHeight: 90, borderRadius: 12, padding: 16 },
  }));
  const edges = projection.milestones.flatMap((item) =>
    item.dependsOn.map((id) => ({
      id: `${id}:${item.id}`,
      source: id,
      target: item.id,
      markerEnd: { type: MarkerType.ArrowClosed },
    })),
  );
  return (
    <section className="mission-control my-6" aria-label="Mission Control">
      <div className="section-heading">
        <h2>Mission Control</h2>
        <span className="pill">{source}</span>
      </div>
      <div className="stats">
        <div className="stat">
          <span>Planned budget</span>
          <strong>{formatUsd(budgetMinor)}</strong>
          <span>{formatUsd(projection.unallocatedMinor)} unallocated</span>
        </div>
        <div className="stat">
          <span>Allocated in terms</span>
          <strong>{formatUsd(projection.allocatedMinor)}</strong>
          <span>
            {projection.milestones.length} milestones ·{" "}
            {projection.participantCount} participants
          </span>
        </div>
        <div className="stat">
          <span>Outcome verification</span>
          <strong>Not tracked yet</strong>
          <span>PayPal transactions are not connected to this view.</span>
        </div>
      </div>
      <p className="subtext">
        Arrows show prerequisite milestones. Planned allocations do not indicate
        money held or paid. {projection.unknownCount} open questions.
      </p>
      <div className="mission-graph" aria-label="Milestone dependency graph">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          edgesReconnectable={false}
          deleteKeyCode={null}
          panOnScroll={false}
          preventScrolling={false}
          onNodeClick={(_, node) => setSelectedId(node.id)}
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <div className="mission-detail-grid">
        <div className="panel">
          <h3>Explore milestones</h3>
          <p className="subtext">Select a milestone to review its terms.</p>
          <div className="milestone-buttons">
            {projection.milestones.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={selected.id === item.id}
                onClick={() => setSelectedId(item.id)}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
        <section
          className="panel milestone-detail"
          aria-label="Selected milestone"
        >
          <div className="eyebrow">Completion condition</div>
          <h3>{selected.title}</h3>
          <p>{selected.acceptance}</p>
          <dl>
            <dt>Responsible participant</dt>
            <dd>{selected.participant}</dd>
            <dt>Planned allocation</dt>
            <dd>{formatUsd(selected.allocationMinor)}</dd>
            <dt>Prerequisites</dt>
            <dd>
              {selected.dependencies.map((dep) => dep.title).join(", ") ||
                "No prerequisite milestones"}
            </dd>
            <dt>Evidence review</dt>
            <dd>
              Not connected — these are agreed criteria, not a verification
              result.
            </dd>
          </dl>
        </section>
      </div>
    </section>
  );
}
