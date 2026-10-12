# PACT

PACT is an AI-assisted, outcome-governed commercial orchestration project for the PayPal AI Hackathon. It connects an objective, a reviewed agreement, evidence, human approval and verified PayPal financial outcomes.

## Current status

The local repository now has a runnable Next.js foundation: account/session wiring, workspace creation, mission drafts, versioned agreement terms, owner approval, role checks, transactional audit events, and clearly labeled sample screens. PayPal SDKs, Appwrite Storage SDK, and AG Studio 3.0 are installed. No payment flow or deployment exists yet; no PayPal provider calls have been performed.

Neon is connected and all three migrations are applied. Real account, mission and revision flows have been verified with isolated synthetic data. PayPal, evidence storage, Studio licensing and AI integration still need their own verification.

## APIMatic in our development workflow

We use the **APIMatic PayPal Context Plugin for Codex** to give our coding assistant PayPal SDK guidance while developing PACT's payment integration.

- Installed the PayPal Context Plugin **v0.3.3** and consulted its TypeScript client-initialization and authentication guidance.
- Cross-checked that guidance against the installed **`@paypal/paypal-server-sdk` v2.5.0** types and exports before implementing the client.
- Used the guidance during implementation of our [server-only PayPal sandbox client](src/integrations/paypal/client.ts), which reads credentials from private environment settings, explicitly selects the sandbox environment, and disables automatic retries.
- Kept SDK initialization separate from PACT's [payment-review proposals](src/modules/finance/proposals.ts), which bind planned amounts to approved agreement revisions and do not execute payments.

**Current scope:** this is development-time use of the installed Context Plugin. Hosted Context API access is not yet integrated, and checkout, capture, refund and dispute operations remain upcoming work. We will continue using the plugin alongside official PayPal API contracts as those flows are implemented.

## Product architecture

- **IntentOS:** will compile objectives into draft agreements for human review.
- **AgentGuard:** enforces deterministic permission, policy and approval checks.
- **BlackBox:** records agreement and review events; the full source-to-provider trace is planned.
- **ResolvOS:** will investigate exceptions and propose grounded recovery choices.
- **AG Studio:** will compose scoped, read-only Case Rooms using its real Agent Framework.
- **PayPal:** provides actual supported payment operations and provider state.

Planned allocations are not PayPal-held money. AI proposals do not authorize payments. The first financial integration will use PayPal sandbox, the official React checkout SDK and TypeScript server SDK, with documented REST calls where SDK coverage requires them.

## Repository setup

Use Node 24 LTS (see `.nvmrc`) and npm. The initial local dependencies are already installed. For another checkout:

```sh
npm ci
cp .env.example .env.local
npm run db:generate
npm run dev
```

Open http://localhost:3005. The overview and sample mission work without credentials. `/app` and `/sign-in` use the connected database; another checkout shows a setup state until configured. `/dev/studio` mounts the real AG Studio canvas with synthetic data in development mode only; AI composition is not connected.

Fill `.env.local` privately. Account and mission features require `DATABASE_URL`, `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` (locally `http://localhost:3005`).

Set `DIRECT_URL` to a direct Neon connection if needed for migrations; otherwise the configuration falls back to `DATABASE_URL`. Run `npm run db:migrate` against your development database before using these features.

The environment template lists the remaining provider settings. Never commit your populated environment file.

## Verification

```sh
npm run db:validate
npm run lint
npm run typecheck
npm run build
npm run format:check
```

If the local environment blocks Turbopack's build-worker port, use `npm run build -- --webpack`.

Local verification has passed 77 unit/service tests and 14 desktop/mobile browser checks, plus real-database checks for proposal deduplication and immutable records. No PayPal provider connectivity or payment execution has been verified.

Planning documents, tests and helper scripts are currently excluded from Git. The test and setup-helper commands require those local files; the existing CI workflow also needs them restored or its checks adjusted before it can pass from a fresh clone.

Keep credentials, buyer passwords, private licenses and private evidence out of source control. Use local environment files or hosting secret settings. A public open-source license must be selected before publication.

## Agreement workflow

Open a saved mission to edit participants, obligations, planned allocations, evidence conditions and dependencies. Every save creates a new revision. Only an owner may approve the latest saved revision; open questions block approval. Approval records owner review of terms only and never authorizes payment or asserts counterparty consent.

Try the interactive editor at `/demo/terms` without credentials. Its checks run locally; edits are not saved. The database-backed flow is connected and all three migrations are applied.

The public landing page now includes a mission walkthrough, planned exception scenarios, trust explanations and FAQ.

Mission Control now includes the dependency graph, milestone criteria, allocation summary and before/after revision comparisons. Try [the local example](http://localhost:3005/demo/terms). Adaptive AG Studio composition and evidence-gated PayPal payments remain upcoming core work.

Owners can now prepare a persisted, non-executable payment review from approved mission terms. Amounts come from the saved milestone, repeated requests reuse the review, and expiry/source fingerprints are recorded. No payment occurs.
