# LIQA | لِقا — Office Console

Arabic-first administrator and field-marketer workspaces for participating-office research and onboarding.  
**A venture by AMAN Innovation Group — Malaysia.**

## Current milestone: 0.1 — interactive implementation

This repository now contains source code, not just a design image:

| Route | Workspace |
| --- | --- |
| `/` | Demo role selection |
| `/admin/` | Administrator: all sample offices, assignment, interviews, trial oversight, follow-ups, reports and subscription overview |
| `/marketer/` | Field marketer: assigned sample offices, consent-based registration, interviews, invitation preview and follow-ups |

Implemented: responsive Arabic RTL layouts; office creation/editing with duplicate detection; separate research and contact consent; interview records and optional four-question price-sensitivity input; notes; dated tasks with completion/reopening; trial-interest and prototype stages; administrator-only trial simulation; scoped CSV export with formula-injection escaping; calculated sample KPIs; an action log; and local persistence with a storage warning.

**Proposed test price: SAR 196 per month.** Interest, account activation and payment are separate events. The initial example paid record is fictitious, not revenue.

## Run

Use Node.js 22 or newer.

```sh
npm install
npm run dev
```

Open the local Next.js development URL shown in the terminal, then `/admin/` or `/marketer/`.

```sh
npm test        # 16 domain-rule checks; no external services needed
npm run build  # static demo output in out/
```

The GitHub Actions workflow runs the domain checks and attempts a static build. Its `liqa-demo-build` artifact, when the build succeeds, includes `out/` and the resolved dependency lock. A successful upload of source code does not by itself mean the build or deployment succeeded. Check Actions for the actual status.

## Important: this is not production authentication

Role selection and filtering are a **demo**, not a security boundary. Both routes use browser-local sample data. There is no server-side authentication, protected database, cross-device synchronization, real account invitation, verified office onboarding, payment processing or operational deployment in this milestone.

**Do not enter actual personal data or payment information.** Do not use this client-side role filter for production access control. Production is blocked until the server verifies identity and authorization for every request and the approved database policies are tested.

The four-question pricing form is an operator-side prototype. A separate participant-facing, unanchored research flow is still required before formal research use; the participant should not see the proposed price first.

## Project structure

- `app/` — route entry points and shared responsive styles.
- `components/` — LIQA brand/icons and office-console interface.
- `lib/offices.mjs` — pure domain functions and explicitly fictitious seed records.
- `tests/` — Node.js domain tests.
- `public/architecture.svg` — compact decorative crop from the previously approved generated concept; not a photograph of a verified office.
- `docs/ROADMAP.md` — production work still required.

## Security and data handling

Never commit `.env` files, API keys, personal office/customer records, interview recordings, real invoices or payment receipts. `.gitignore` excludes common secret and private-data paths. Research participation does not enroll an office in a paid plan. Invitations are previews only. The illustrative 70% / 55% / 20% figures are not presented as measured findings.

## Ownership

Copyright AMAN Innovation Group. No open-source license has been granted by creating or publishing this repository. The `private: true` value in `package.json` prevents accidental npm package publication; it does not determine GitHub repository visibility.
