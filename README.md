# LIQA | لِقا — Office Console

A venture by AMAN Innovation Group — Malaysia.

## Milestone 0.1: interactive interface implementation

This is the first source-code implementation of the approved participating-office dashboards. It is not the completed production platform.

- `/`: demo workspace selection.
- `/admin/`: administrator interface with all sample offices, assignments, interviews, trial oversight, follow-ups, reports and subscription overview.
- `/marketer/`: field-marketer interface scoped in the UI to assigned sample offices.

Implemented: Arabic RTL responsive layouts; registration/editing; duplicate detection; separate contact/research consent; interview records; optional four-question price-sensitivity input; notes; tasks and completion; trial-interest/prototype tracking; administrator-only trial simulation; scoped CSV export with formula escaping; calculated sample KPIs; and a browser-local action log.

**Proposed test price: SAR 196 per month.** Interest, trial activation and payment remain separate events. The example paid record is fictitious, not actual revenue.

## Run and test

Use Node.js 22 or newer.

```sh
npm install
npm run dev
npm test
npm run build
```

The build is configured to export a static demo into `out/`. GitHub Actions attempts a build and uploads `out/` and the resolved dependency lock when successful. Inspect the actual run status in Actions. Source upload alone does not prove a successful build or deployment.

Sixteen pure-domain tests passed locally. They are not server security tests or browser acceptance tests.

## Current boundaries

Role selection and client filtering are a demo, not authentication or authorization. There is no protected database, cross-device sync, real invitation sending, payment gateway or operational deployment in this milestone. **Do not enter real personal data or payment information.** All sample records are fictitious. Browser storage can be cleared or unavailable.

The proposed price is visible in the operator dashboard. A separate unanchored participant-facing research flow is still required before formal interviewing; do not show participants the proposed price before their price-sensitivity answers.

`public/architecture.svg` is a lightweight decorative tone background, not a photograph or a verified office. Approved photographic assets still need a proper production asset pipeline. Fonts are not bundled.

## Files

- `app/`: routes and styles.
- `components/`: brand/icons and workspace interface.
- `lib/offices.mjs`: domain rules and synthetic records.
- `tests/`: Node domain tests.
- `docs/ROADMAP.md`: remaining production work and acceptance gates.

## Security and ownership

Never commit `.env` files, secrets, personal office/customer records, research recordings, real invoices or payment receipts. Invitations are previews only. The illustrative 70% / 55% / 20% figures are not treated as measured findings.

Copyright AMAN Innovation Group. No open-source license is granted by publishing this repository. `private: true` in `package.json` prevents accidental npm publication; it does not set GitHub visibility.
