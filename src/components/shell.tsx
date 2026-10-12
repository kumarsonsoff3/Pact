import Link from "next/link";
import {
  FolderKanban,
  LayoutDashboard,
  LogIn,
  PanelsTopLeft,
  ShieldCheck,
} from "lucide-react";

export function Shell({
  children,
  section = "Overview",
}: {
  children: React.ReactNode;
  section?: string;
}) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="PACT home">
          <span className="brand-mark" aria-hidden="true" />
          PACT
          <span className="text-xs font-normal tracking-normal text-muted-foreground">
            / beta
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <div className="nav-label">Workspace</div>
          <Link
            className={`nav-link ${section === "Overview" ? "active" : ""}`}
            href="/"
          >
            <LayoutDashboard size={17} />
            Overview
          </Link>
          <Link
            className={`nav-link ${section === "Missions" ? "active" : ""}`}
            href="/app"
          >
            <FolderKanban size={17} />
            My missions
          </Link>
          <Link
            className={`nav-link ${section === "Preview" ? "active" : ""}`}
            href="/demo"
          >
            <PanelsTopLeft size={17} />
            Explore a mission
          </Link>
          <Link
            className={`nav-link ${section === "Account" ? "active" : ""}`}
            href="/sign-in"
          >
            <LogIn size={17} />
            Account
          </Link>
        </nav>
        <div className="sidebar-note">
          <ShieldCheck size={19} className="mb-2 text-primary" />
          <strong>Built around human approval.</strong>
          <br />
          Drafts stay drafts until you review them. Every financial action needs
          its own authority.
        </div>
      </aside>
      <div className="min-w-0">
        <header className="topbar">
          <span className="text-muted-foreground">
            PACT <span className="mx-2 text-slate-300">/</span> {section}
          </span>
          <span className="pill">
            <span className="dot" />
            Development preview
          </span>
        </header>
        <main id="main" className="content">
          {children}
        </main>
      </div>
    </div>
  );
}
