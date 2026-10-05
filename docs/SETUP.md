# LIQA staff console: activation checklist

Status: code preparation, not live deployment. Use a dedicated, approved LIQA
Supabase-compatible environment. Location, organizational ownership and operating
requirements must be settled before collecting real office/interview data.

1. Keep `LIQA_BACKEND_ENABLED=false` while configuring the project. Demo routes
   remain separate, public, and fictitious.
2. In a NEW dedicated database, review and run `database/schema.sql` once using
   its database-owner connection. Back up first; do not apply it to another app.
   This baseline is not an idempotent migration for existing installations.
3. Configure Supabase Auth and provision authorized staff from the secure operator
   console. There is no public sign-up or user-controlled role selection.
4. Add an authorized user's UUID to `public.liqa_staff` using the database-owner
   console, display name, role (`admin` or `marketer`), and active=true. Never
   commit user credentials, real UUID assignments or personal records into Git.
5. Add the project's URL and publishable key to deployment environment variables
   as shown in `.env.example`. The app does NOT use a `service_role` key. Configure
   cookies, HTTPS, allowed origins/redirects, SMTP, Auth rate limiting and account
   recovery. Do not paste secrets into chat or client code.
6. Deploy the Node build in an approved environment and then enable
   `LIQA_BACKEND_ENABLED=true`. Missing/failed configuration must remain closed.
7. Test with two approved marketers and an administrator: wrong-role routes,
   inactive accounts, direct API calls, stale updates, contact consent withdrawal,
   distinct research consent, cross-office access and logout/session expiry.
8. Back up and restore a test database, test operational alerts and review policy
   advisors. Only then approve real field collection. Do not turn on payments yet.

## Permissions

- `liqa_staff`: client SELECT only. No self-escalation or staff creation.
- `liqa_offices`: admin sees all; marketer sees and edits only assigned records.
- `liqa_notes`, `liqa_interviews`, `liqa_tasks`: same office scope, actor from session.
- `liqa_audit`: read-only client; written by narrow private trigger.
- `liqa_subscriptions`: read-only client; provider-backed billing is a later task.
- Public `liqa_command` runs SECURITY INVOKER, not an elevated service connection.
- Private role lookup/trigger have fixed search_path, restricted EXECUTE and no
  externally supplied user identity. User-editable metadata never decides roles.

## Test boundaries

CI PostgreSQL tests use simulated auth users only. They validate RLS SQL and
constraints, not provider email/password authentication. Browser tests verify demo
journeys and closed operational routes with the backend disabled. End-to-end tests
against the chosen real staging project remain required before launch.

## Known limits

This milestone is staff management, not an office-owner self-service portal.
Invitations are previews; trial start is a recorded milestone; no message is sent
and no subscription charge is created. Fields have UI/API/database validation;
all network-facing endpoints still need infrastructure rate-limit and abuse rules.
A 1,000-row query limit fails visibly rather than silently omitting data; implement
server pagination before scaling the field program.
