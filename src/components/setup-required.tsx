import Link from "next/link";
import { Button } from "@/components/ui/button";
export function SetupRequired() {
  return (
    <section className="panel auth-panel">
      <span className="pill blue">Workspace setup</span>
      <h1 className="mt-5">A few connections to finish.</h1>
      <p className="subtext">
        The application is running. Account access and saved missions will be
        available once the project owner connects the database and completes
        account setup.
      </p>
      <p className="subtext">
        You can explore the example mission while setup is completed.
      </p>
      <Button className="mt-5" asChild>
        <Link href="/demo">Explore the example</Link>
      </Button>
    </section>
  );
}
