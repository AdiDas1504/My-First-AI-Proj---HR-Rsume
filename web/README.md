# JobFit Web: the paid website

The customer-facing site for JobFit: Hebrew-first (RTL), accessible, with phone login, a free fit check, subscriptions and AI resume tailoring that never invents experience.

The original Python/Streamlit tool in the repository root stays as the prototype. This folder is the product.

## What's inside

| Area | Where |
|---|---|
| Landing, pricing, FAQ | `src/app/page.tsx`, `src/app/pricing`, `src/components/faq.tsx` |
| Phone login (SMS code) | `src/lib/otp.ts`, `src/lib/sms.ts`, `src/app/api/auth/*` |
| Free fit check (one per phone and device, 3 per network per day) | `src/app/api/scan/route.ts` |
| Plans, quotas, renewals | `src/lib/plans.ts`, `src/lib/entitlement.ts`, `src/lib/billing.ts` |
| AI prompts and schemas (honesty rules) | `src/lib/ai.ts` |
| Honesty check (numbers, employers, skills vs. original) | `src/lib/honesty.ts` |
| Word export (RTL, ATS-friendly) | `src/lib/docx-export.ts` |
| PDF | browser print of `src/app/app/doc/[id]/print` |
| Resume builder (one-time product) | `src/app/builder`, `src/components/builder-*.tsx`, `src/lib/ai-builder.ts`, `src/lib/builder.ts` |
| Resume templates (classic, modern, minimal) | `src/components/resume-preview.tsx` |
| Database | `src/lib/store/*`, schema in `supabase/schema.sql` |
| Accessibility toolbar and statement | `src/components/accessibility-toolbar.tsx`, `src/app/accessibility` |

Products: the subscription (below) and a one-time resume builder at 49 ₪ (`BUILDER_PRODUCT` in `src/lib/plans.ts`): the interview is free, and payment unlocks generating one resume with unlimited edits, templates and downloads.

Pricing: 19.90 ₪ for a 7-day trial (once per phone number), then 49.90 ₪ a month, or 119 ₪ for 3 months. Fair use: 40 tailored resumes per 30 days, 10 during the trial.

## Run locally (demo mode)

```bash
cd web
npm install
npm run dev        # http://localhost:3000
```

With no keys, everything runs in demo mode: login codes appear on screen, payment is simulated, analysis uses keyword overlap instead of AI, and data is saved to `web/.data/`. A banner at the top says so.

```bash
npm test           # unit tests: pricing, quotas, phone, honesty check
npx tsc --noEmit && npx eslint src tests
npm run build
```

## Going live: checklist

1. **Claude API key:** create one at console.anthropic.com and set `ANTHROPIC_API_KEY`.
2. **Supabase:** create a project, run `supabase/schema.sql` in the SQL editor (re-run it after updates; it is safe to run again), then set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` (the `sb_secret_...` key; the legacy `SUPABASE_SERVICE_ROLE_KEY` also works until Supabase retires it).
3. **SMS:** Twilio works today (`SMS_PROVIDER=twilio`). An Israeli SMS gateway can be added in `src/lib/sms.ts`.
4. **Payments:** needs a registered business. Pick an Israeli processor that supports recurring charges (standing orders) and webhooks, then implement the three spots marked `PROVIDER` in `src/lib/billing.ts` plus a webhook route.
5. **Hosting:** Vercel works out of the box (set the env vars; tailoring needs up to ~3 minutes per request, so use a plan that allows long functions). Set `SESSION_SECRET` and `APP_URL`.
6. **Before taking money:**
   - Have a lawyer review the terms, privacy policy, auto-renewal wording and cancellation flow (Consumer Protection Law, Privacy Protection Law, Amendment 13).
   - Fill in the accessibility coordinator's name and phone in `src/app/accessibility/page.tsx`.
   - Replace the `@jobfit.co.il` addresses.
   - Check the brand name and domain are available.

Production safety: if the site runs in production without a real SMS or payment provider, login and checkout refuse to work, so demo shortcuts can't leak. `DEMO_MODE=1` overrides this; use it only for a private preview, and always together with `PREVIEW_PASSWORD`, which puts the whole site behind a browser password prompt.

## Quality evaluation

`web/eval` contains fictional resumes and job postings with the score band each pair should land in, plus an HR case that checks role research, questions, use of the candidate's answers and invented facts.

```bash
cd web
ANTHROPIC_API_KEY=... npm run eval          # report in eval/results/latest.md
```

On GitHub: add the repository secret `ANTHROPIC_API_KEY`, then run the "Quality evaluation" workflow (Actions tab) or push to the `run-eval` branch. The report is saved to the `eval-results` branch.
