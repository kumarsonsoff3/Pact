"use client";
import dynamic from "next/dynamic";
export const StudioLoader = dynamic(
  () =>
    import("@/integrations/ag-studio/studio-smoke").then((m) => m.StudioSmoke),
  {
    ssr: false,
    loading: () => (
      <p className="p-6" role="status">
        Loading Studio…
      </p>
    ),
  },
);
