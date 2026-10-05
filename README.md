# LIQA | لِقا — Office Console

A venture by AMAN Innovation Group — Malaysia.

## Milestone 0.2 — protected staff-console foundation

The approved Arabic RTL administrator and field-marketer interfaces are preserved.
Demo and operational routes are explicitly separated:

| Route | Purpose |
| --- | --- |
| `/` | Entry and demo navigation |
| `/demo/admin/`, `/demo/marketer/` | Fictitious browser-local demonstration; role switching is not authentication |
| `/login/` | Supabase email/password sign-in for staff provisioned by an operator |
| `/admin/`, `/marketer/` | Server-verified staff role and active-status checks |
| `/api/console/` | Session-scoped reads and individually validated database commands |
| `/setup/` | Closed/unconfigured state; never silently substitutes demo data |

**No dedicated cloud database or deployment has been configured for LIQA yet.**
Adding this source does not activate login, create staff, send invitations, collect
payments, or authorize collecting real research data. `LIQA_BACKEND_ENABLED` is
false by default. Do not reuse another AMAN project's database without approval.

## Implemented

- Office registration, editing, filters, profiles, notes, interviews, follow-ups,
  CSV export and reports retained in both interfaces.
- Operational mode reads from the server and writes one command per transaction;
  it does not store office records in localStorage or upload browser snapshots.
- Verified authentication plus active staff membership; no self-assigned admin role.
- PostgreSQL RLS isolates assigned offices and their child records. Administrators
  see all offices and assign them. Staff roles cannot be changed by client users.
- Separate contact consent and research consent; optional ordered four-price input.
- Optimistic version checks reject stale office edits. A committed write is
  acknowledged separately from dashboard refresh; double-clicks are suppressed.
- Database-generated audit events; staff cannot insert fabricated payment rows.
- Request origin, body-size and allowlist validation on mutation APIs.

**Price under test: SAR 196 per month.** Recording trial interest or the start of
 a pilot does not create an operational broker account or a paid subscription.
The illustrative 70% / 55% / 20% are not measured findings.

## Run

Node.js 22+:

```sh
npm ci --ignore-scripts
npm run check
npm run dev
# Production-server test:
npm run build
npm run start
```

This version uses the standard Next.js Node server, not a static export. See
`docs/SETUP.md` before connecting any database. Keep secrets and `.env.local` out
of Git. Direct dependency versions and the complete dependency lock are committed.
Next.js is pinned to the reviewed security release 16.3.8.

## Verification

`npm run check` runs pure-domain and request-validation tests.
`npm run test:browser` runs desktop/mobile browser journeys and captures screenshots.
GitHub Actions also runs `database/schema.sql` and authorization assertions against
 a disposable PostgreSQL 17 service with an `auth.uid()` stand-in. This does not
 test live Supabase authentication, email delivery or billing integration.
Dependency auditing blocks the build on known high/critical advisories; its JSON
report is retained even if the workflow fails. Audit results are time-specific,
not a guarantee of security. Inspect the exact PR run and `liqa-verification`
artifact for results. Never run `tests/database-bootstrap.sql` in Supabase.

## Remaining production gates

Dedicated approved hosting/data location; Auth configuration and staff provisioning;
real-session end-to-end tests; rate limits and administrator MFA; backup/restore;
consent policy review; operational monitoring; real invitations; paginated queries
beyond the initial 1,000-row safety limit; payment-provider and accounting setup.
The current API refuses to present capped data as complete. No billing gateway or
automatic renewal is enabled. The full brokerage product is a separate workstream.

Approved photography still needs a production asset pipeline.
`public/architecture.svg` is decorative, not a photograph. No fonts are bundled.
Demo records are fictional and must never be imported as research.

Copyright AMAN Innovation Group. Publishing the repository is not an open-source
license grant.
