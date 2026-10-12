"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
export function AuthForm() {
  const [creating, setCreating] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    try {
      const result = creating
        ? await authClient.signUp.email({
            name: String(form.get("name")),
            email,
            password,
          })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(
          "We couldn't complete sign-in. Check your details or try again shortly.",
        );
        return;
      }
      router.push("/app");
      router.refresh();
    } catch {
      setError("Account access is unavailable. Please try again shortly.");
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="panel auth-panel">
      <span className="eyebrow">Your PACT account</span>
      <h1>{creating ? "Start with an account." : "Welcome back."}</h1>
      <p className="subtext mb-6">
        Sign in to your workspace and keep your mission drafts together.
      </p>
      <form className="form" onSubmit={submit}>
        {creating && (
          <div className="field">
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required
              maxLength={100}
            />
          </div>
        )}
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">
            Password {creating && "(at least 12 characters)"}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={creating ? "new-password" : "current-password"}
            required
            minLength={creating ? 12 : undefined}
          />
        </div>
        {error && (
          <p role="alert" className="form-message">
            {error}
          </p>
        )}
        <Button disabled={pending}>
          {pending ? "Please wait…" : creating ? "Create account" : "Sign in"}
        </Button>
      </form>
      <button
        className="text-link mt-5"
        onClick={() => {
          setCreating(!creating);
          setError("");
        }}
      >
        {creating
          ? "Already have an account? Sign in"
          : "New to PACT? Create an account"}
      </button>
      <p className="subtext mt-5">
        This is your PACT account. PayPal checkout approval is a separate step.
      </p>
    </section>
  );
}
