import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="content">
      <h1>This page isn’t available.</h1>
      <Link className="text-link" href="/">
        Return to PACT
      </Link>
    </main>
  );
}
