# ActionInbox

## Paid pilot setup

Set these variables in Vercel for the deployment environment:

- `NEON_AUTH_BASE_URL` — the Neon Auth URL of that environment's database branch.
- `NEON_AUTH_COOKIE_SECRET` — a random secret of at least 32 characters, unique to the environment.
- `OPENAI_API_KEY` — the existing server-side key for email analysis.
- `ACTIONINBOX_STRIPE_PAYMENT_LINK` — a Stripe-hosted Payment Link for the pilot plan. Start with a test-mode link. Leave it unset to keep checkout hidden.
- `ACTIONINBOX_PILOT_USER_IDS` — comma-separated Neon Auth user IDs with active access. Leave it unset to deny all pilot access.

Add the deployed site to Neon Auth's trusted domains and configure the production email provider for verification. Deploy after setting variables. Visit `/account` to register and sign in. Stripe receives a reference ID and a prefilled email, both of which can be edited by the customer. Confirm the paid transaction in Stripe and verify the buyer's identity against the intended Neon Auth user before adding their ID. Redeploy after adding or removing access. Use Stripe's hosted customer portal or handle cancellation directly in Stripe and remove the ID when access ends.

Before switching to a live Payment Link, test signup, sign-in, test payment, manual activation, analysis at `/workspace`, and access removal. The pilot processes pasted text without saving it to ActionInbox. The assignment demo remains available at `/demo` with its existing access code.

A responsive, one-page marketing website for an upcoming AI-powered email and task management SaaS. Created by Mitchell Cesanek for a university entrepreneurship assignment.

## Run locally

Install Node.js 20.9 or newer (Node.js 24 LTS recommended), then open PowerShell:

```powershell
cd C:\Users\m1ces\OneDrive\ActionInbox
npm install
npm run dev
```

Open http://localhost:3000. Stop the server with Ctrl+C. Changes in `src/` update automatically during development.

## Production build

```powershell
npm run build
npm run start
```

Open http://localhost:3000. This serves the production build locally; it does not deploy anything. Use `npm run typecheck` for a separate TypeScript check. Use `npm ci` instead of `npm install` for a clean install from the lockfile.

## Structure

- `src/app/page.tsx`: marketing content and page sections.
- `src/app/layout.tsx`: root layout, SEO and social metadata.
- `src/app/globals.css`: Tailwind import, design tokens and responsive styles.
- `src/components/product-preview.tsx`: static, explicitly labeled concept dashboard.
- `src/components/icon.tsx`: shared SVG icons.
- `src/app/icon.svg`: product favicon.

Built with Next.js App Router, TypeScript, and Tailwind CSS v4. The page uses Server Components and system fonts, without external font requests or a client-side JavaScript dependency for its interactions. Navigation links scroll to page sections.

## Scope and future development

This iteration is marketing only. The dashboard is an illustrative concept with fictional example content. The coming-soon call to action is an informational section, with no signup or data collection. Authentication, AI processing, PostgreSQL, email integrations, and Stripe subscriptions are not implemented or connected. No environment variables are needed. Future backend features can be added through App Router routes, server modules, and dedicated components as requirements are defined. Do not place secrets in browser code or commit environment files.

Nothing has been deployed.
