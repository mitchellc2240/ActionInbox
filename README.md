# ActionInbox

The free beta turns pasted email into a summary, a checklist with explicit due dates, and a draft reply. Plans and completion states are saved to the signed-in account. The beta allows 20 attempts per account and 200 across beta accounts per UTC day.

## Deploy the beta

Set these server-side environment variables in the Vercel deployment environment.

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Pooled Neon connection for the same branch and database configured for Neon Auth |
| `NEON_AUTH_BASE_URL` | Neon Auth base URL for that branch |
| `NEON_AUTH_COOKIE_SECRET` | Random secret of at least 32 characters, unique to this environment |
| `OPENAI_API_KEY` | OpenAI project key with access to the Responses API and GPT-5.4 mini |
| `ACTIONINBOX_SUPPORT_EMAIL` | Optional address for beta help |
| `ACTIONINBOX_DEMO_CODE` | Optional access code for the separate assignment demo |

Apply [002_workspace.sql](db/002_workspace.sql) and [003_beta_usage.sql](db/003_beta_usage.sql), in order, using the Neon SQL Editor for that branch and database. Add the production site origin to Neon Auth's trusted domains. Enable email/password signup and configure verification and mail delivery for the branch. See the [Neon Auth production checklist](https://neon.com/docs/auth/production-checklist).

Deploy the commit to Production after saving these settings. Vercel automatically builds pushes to its configured production branch when the Git integration is active. Verify with two independent accounts in separate browser sessions.

1. Visit `/account` and finish signup and sign-in.
2. In `/workspace`, paste a fictional email with an explicit deadline. Confirm a summary, tasks, a due date, and a draft reply.
3. Reload or sign back in. Open the saved plan and mark a task done. Reload again and confirm the completion persisted.
4. Sign in with the second account and confirm it has an empty history, then save a different plan and check that it appears only for that account.

## Run locally

Use Node.js 20.9 or newer and install dependencies with `npm ci`. Set the environment variables in an untracked `.env.local` pointing to a development Neon branch. Run `npm run dev` and visit http://localhost:3000/account.

Run `npm run typecheck` and `npm run build` before deploying.
