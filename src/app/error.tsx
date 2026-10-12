"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="content">
      <h1>We couldn’t load this view.</h1>
      <p className="subtext">
        Please try again. If this continues, ask the project owner to check the
        workspace connection.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
