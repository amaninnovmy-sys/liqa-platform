# Implementation roadmap

## Milestone 1 — source implementation

- [x] Separate administrator and marketer routes.
- [x] Responsive Arabic-first interface based on the approved LIQA dashboard.
- [x] Office registration/editing, demo assignment and duplicate checks.
- [x] Notes, interviews, consent fields and optional price-sensitivity questions.
- [x] Follow-up tasks, filters, scoped CSV export and calculated sample KPIs.
- [x] Trial-interest and prototype tracking; administrator-only trial simulation.
- [x] Proposed subscription price fixed at SAR 196/month; real collection disabled.
- [x] Sixteen pure-domain tests passed locally.
- [x] GitHub build workflow added. Inspect its actual run status separately.

## Milestone 2 — real accounts and persistence

- [ ] Confirm approved hosting region and the operating/legal scope for the research portal.
- [ ] Create isolated development/staging/production environments.
- [ ] Integrate server-verified authentication and session management; no client-selectable production role.
- [ ] Implement PostgreSQL schema and migrations for users, marketer assignments, offices, contact consents, interviews, tasks, invitation tokens, subscriptions, payment events and immutable audit records.
- [ ] Enforce scope on every read/write/export: administrator scope versus assigned marketer scope. Test unassigned IDs, reassignment, lost sessions and revoked access.
- [ ] Replace local persistence with a repository/service adapter. Keep the demo namespace and fake data separate from production.
- [ ] Office representatives confirm their details and participation on a dedicated flow; a marketer's registration alone does not create consent or paid enrollment.
- [ ] Expiring, single-use invitations; no real sending without an approved provider and sender.
- [ ] Backups and restore tests, rate limits, CSRF/session safeguards, error monitoring, access logging and retention/deletion policies.

## Milestone 3 — field research and subscription operations

- [ ] Participant-facing interview page with no proposed price visible before price-sensitivity questions.
- [ ] Separate research consent, follow-up consent, trial acceptance, account access and paid enrollment.
- [ ] Immutable original research answers; corrections preserve history and reasons.
- [ ] Trial start/expiry policy, with the clock beginning at actual activation rather than interest registration.
- [ ] Billing entity, tax treatment, invoice requirements and merchant approval confirmed before live collection.
- [ ] Server-enforced entitlements and a versioned price catalogue; integer minor units for money.
- [ ] Idempotent, signed payment-webhook handling and reconciliation. Neither a browser redirect nor a marketer action proves payment.
- [ ] Dunning, cancellation-at-period-end, refund and retention policies approved and tested.
- [ ] No subscription changes that silently convert research participation into payment.

## Acceptance and deployment

- [ ] Full build verified against the exact source commit.
- [ ] Keyboard, responsive/mobile and browser smoke tests; appropriate touch targets and a working enlarged-text mode.
- [ ] Real permission tests on server/database; the current client-side filtering tests are not security tests.
- [ ] Paid/trial/interested counts audited against real source records, never simulated metrics.
- [ ] Preview deployment on an approved account, using synthetic data only.
- [ ] Security and operational review before admitting actual office data.

## Explicitly not done in this milestone

No live deployment, protected accounts, production database, phone OTP provider, real invitations, AI backend, official office verification or payment gateway has been activated. This is the first implementation of the field-operations UI, not the completed production platform.
