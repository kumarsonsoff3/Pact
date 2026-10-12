"use client";
import { AgStudio } from "ag-studio-react";
const data = {
  sources: [
    {
      id: "sample_commitments",
      data: [
        {
          participant: "Designer",
          obligation: "Packaging artwork",
          state: "Draft",
        },
        {
          participant: "Supplier",
          obligation: "Production samples",
          state: "Draft",
        },
      ],
    },
  ],
};
export function StudioSmoke() {
  return <AgStudio data={data} mode="edit" />;
}
