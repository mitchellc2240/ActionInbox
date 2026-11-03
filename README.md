# ActionInbox

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
