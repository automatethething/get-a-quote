# Next.js + ConsentKeys + Supabase App Starter

Copy this scaffold when creating a new Flowstate app that needs:
- ConsentKeys auth
- server-side Supabase access
- a logged-in dashboard shell
- namespaced upload/task/testing table stubs

## Includes
- Next.js metadata baseline
- ConsentKeys Auth.js wiring
- typed session extensions
- server-side Supabase helper
- homepage with sign-in CTA
- dashboard shell
- privacy/terms starter pages
- upload/task/testing SQL starter migration
- `.env.example`

## Usage
1. Copy into `repos/[app-name]`
2. Replace placeholder app name/domain/table prefixes
3. Set `NEXT_PUBLIC_APP_URL`
4. Fill in ConsentKeys and Supabase env vars
5. Review `_templates/builders/new-app-starter-pack.md`
6. Review `_templates/builders/consentkeys.md`
7. Review `_templates/builders/supabase.md`
8. Run `_templates/builders/launch-checklist.md`

## Important
- Do not reuse ConsentKeys credentials from another app
- Do not use un-namespaced DB objects
- Do not trust uploaded files without scanning/review
