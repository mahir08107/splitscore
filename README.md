# SplitScore

SplitScore helps student groups record shared expenses, settle balances, and build a verified trust score from confirmed repayment behavior.

## Stack

- Next.js App Router, React, TypeScript, and Tailwind CSS
- Supabase Auth and Postgres
- Gemini API for receipt parsing
- Recharts and `react-qr-code`

## Local development

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` and provide the values described below.
3. Apply the Supabase SQL migrations in `supabase/migrations/` in filename order, then apply `supabase/supabase_receipt_scans.sql`.
4. Start the app with `npm run dev`.

Use `npm run build` to create a production build and `npm start` to serve it locally.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key used by browser and server clients |
| `GEMINI_API_KEY` | For receipt scans | Server-only Gemini key. Never expose it with a `NEXT_PUBLIC_` prefix. |
| `SPLITSCORE_SIGNING_SECRET` | Required in production | Private HMAC secret for signed public trust cards. Use a long random value and keep it out of source control. |
| `NEXT_PUBLIC_DEMO_USER_ID` | Optional | User UUID used by demo mode; the local fallback is the all-zero UUID. |
| `DEMO_USER_EMAIL` | Optional | Email used for the demo sign-in route. |
| `DEMO_USER_PASSWORD` | Optional | Password used for the demo sign-in route. |
| `MOCK_RECEIPT` | Optional | Set to `true` only to return the local mock receipt response. Leave unset in production. |

Set production values in Vercel under **Project Settings → Environment Variables** for each environment that needs them. Redeploy after changing values. Never commit `.env`, `.env.local`, or production secrets.

## Deploying this branch on Vercel

1. Push the `ui-overhaul` branch to GitHub and import the repository into Vercel (or select the existing project).
2. Keep the framework preset as **Next.js**. Use `npm ci` for installation and `npm run build` for the build command; Vercel can use its standard Next.js output settings.
3. Add the required Supabase values and a unique `SPLITSCORE_SIGNING_SECRET`. Add `GEMINI_API_KEY` if receipt scanning should be enabled.
4. In Supabase Auth, add the deployed domain’s `/auth/callback` URL to the allowed redirect URLs. Add the production domain to the Google OAuth client’s authorized redirect configuration as required by your Supabase Google provider setup.
5. Apply the database SQL migrations and receipt-scan table SQL before testing signup, groups, settlements, and receipt scanning. Seed the demo user only if you want demo sign-in enabled.
6. Pushes to a non-production Git branch create a Preview Deployment when Git integration is enabled. Select that deployment in Vercel to review it; promote or merge it to the configured production branch when ready.

The receipt parser route allows up to 60 seconds for the external OCR request. Actual function limits still depend on the Vercel plan and function configuration.

## Useful scripts

- `npm run dev` — local development server
- `npm run build` — production build
- `npm start` — serve the production build
- `npm run lint` — ESLint
- `npm test` — Vitest
