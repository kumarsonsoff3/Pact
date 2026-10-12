import { Shell } from "@/components/shell";
import { AgreementEditor } from "@/components/agreement-editor";
export default function ExampleTerms() {
  return (
    <Shell section="Preview">
      <h1>Build the agreement together.</h1>
      <p className="notice mb-6">
        Interactive example · changes stay in this page and disappear on reload.
        No account, saved revision, approval or payment is created.
      </p>
      <AgreementEditor
        missionId="example"
        budgetMinor="300000"
        canEdit
        canApprove={false}
        preview
        latest={{
          id: "example",
          version: 1,
          contentHash: "",
          approved: false,
          agreement: {
            participants: [
              { id: "designer", name: "Designer", role: "Packaging" },
              { id: "supplier", name: "Supplier", role: "Production" },
              { id: "creator", name: "Creator", role: "Launch content" },
            ],
            obligations: [
              {
                id: "art",
                participantId: "designer",
                title: "Packaging artwork",
                acceptance: "Reviewed print-ready PDF and source files",
                allocationMinor: "75000",
                dependsOn: [],
              },
              {
                id: "samples",
                participantId: "supplier",
                title: "Production samples",
                acceptance:
                  "Delivery receipt and photographs of approved samples",
                allocationMinor: "180000",
                dependsOn: ["art"],
              },
              {
                id: "content",
                participantId: "creator",
                title: "Launch content",
                acceptance: "Reviewed campaign assets using delivered samples",
                allocationMinor: "45000",
                dependsOn: ["samples"],
              },
            ],
            unknowns: [],
          },
        }}
      />
    </Shell>
  );
}
