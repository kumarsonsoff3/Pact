import { notFound } from "next/navigation";
import { Shell } from "@/components/shell";
import { StudioLoader } from "@/components/studio-loader";
export const dynamic = "force-dynamic";
export default function StudioPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <Shell section="Studio setup">
      <h1>AG Studio integration check</h1>
      <p className="notice">
        Local development smoke test using synthetic data. This is the actual
        Studio canvas; AI composition is not connected. Evaluation terms and
        deployment licensing still need verification.
      </p>
      <div className="studio-frame">
        <StudioLoader />
      </div>
    </Shell>
  );
}
