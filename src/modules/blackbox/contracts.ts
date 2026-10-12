export type TraceEvent = {
  id: string;
  organizationId: string;
  missionId?: string;
  actorId: string;
  type: string;
  sourceIds: string[];
  createdAt: string;
};
export interface BlackBox {
  append(event: Omit<TraceEvent, "id" | "createdAt">): Promise<TraceEvent>;
}
// Application-level append-only events; no cryptographic immutability claim.
