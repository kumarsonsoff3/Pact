"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FolderPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usdToMinor, formatUsd } from "@/lib/money";
import { authClient } from "@/lib/auth/client";
type Mission = {
  id: string;
  title: string;
  objective: string;
  budgetMinor: string;
  status: string;
};
export function MissionWorkspace({
  workspace,
  missions,
  canCreate,
}: {
  workspace: { id: string; name: string } | null;
  missions: Mission[];
  canCreate: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    const element = event.currentTarget;
    const form = new FormData(element);
    try {
      const payload = workspace
        ? {
            organizationId: workspace.id,
            title: form.get("title"),
            objective: form.get("objective"),
            budget: {
              amountMinor: usdToMinor(String(form.get("budget"))),
              currency: "USD",
            },
          }
        : { name: form.get("name") };
      const response = await fetch(
        workspace ? "/api/missions" : "/api/workspaces",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not save your changes.");
      element.reset();
      setNotice(
        workspace
          ? "Draft saved. This does not approve an agreement or move money."
          : "Workspace created.",
      );
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <div className="heading-row">
        <div>
          <div className="eyebrow">{workspace?.name || "Your workspace"}</div>
          <h1>Mission Control</h1>
          <p className="subtext">Start with the outcome you want to achieve.</p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            await authClient.signOut();
            router.push("/sign-in");
            router.refresh();
          }}
        >
          Sign out
        </Button>
      </div>
      <div className="columns">
        <section className="panel">
          <h2>{workspace ? "Your mission drafts" : "Create a workspace"}</h2>
          {workspace ? (
            missions.length ? (
              missions.map((mission) => (
                <article className="obligation" key={mission.id}>
                  <div>
                    <Link
                      className="text-link"
                      href={`/app/missions/${mission.id}`}
                    >
                      <strong>{mission.title}</strong>
                    </Link>
                    <p>{mission.objective}</p>
                    <p>
                      {formatUsd(mission.budgetMinor)} planned · No provider
                      transaction
                    </p>
                  </div>
                  <span className="pill">{mission.status}</span>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <FolderPlus size={30} />
                <h3>No missions yet</h3>
                <p className="subtext">Save your first objective as a draft.</p>
              </div>
            )
          ) : (
            <p className="subtext">
              Your workspace keeps mission drafts and membership separate from
              other organizations.
            </p>
          )}
        </section>
        {(canCreate || !workspace) && (
          <section className="panel">
            <h2>{workspace ? "New mission draft" : "Workspace details"}</h2>
            <form className="form" onSubmit={submit}>
              {workspace ? (
                <>
                  <div className="field">
                    <label htmlFor="title">Mission title</label>
                    <input
                      id="title"
                      name="title"
                      required
                      minLength={3}
                      maxLength={120}
                      placeholder="Launch our new collection"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="objective">
                      What outcome are you working toward?
                    </label>
                    <textarea
                      id="objective"
                      name="objective"
                      required
                      minLength={10}
                      maxLength={5000}
                      placeholder="Describe the objective, participants and constraints…"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="budget">Planned budget (USD)</label>
                    <input
                      id="budget"
                      name="budget"
                      required
                      inputMode="decimal"
                      placeholder="3000.00"
                    />
                    <span className="subtext">
                      A planning amount. No payment will be created.
                    </span>
                  </div>
                </>
              ) : (
                <div className="field">
                  <label htmlFor="name">Workspace name</label>
                  <input
                    id="name"
                    name="name"
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder="My organization"
                  />
                </div>
              )}
              {error && (
                <p className="form-message" role="alert">
                  {error}
                </p>
              )}
              {notice && (
                <p className="subtext" role="status">
                  {notice}
                </p>
              )}
              <Button disabled={pending}>
                <Plus size={16} />
                {pending
                  ? "Saving…"
                  : workspace
                    ? "Save draft"
                    : "Create workspace"}
              </Button>
            </form>
          </section>
        )}
      </div>
    </>
  );
}
