# Smart Online College Admission Management System

A complete, production-ready admission platform with three roles — **Student**,
**Faculty**, and **Admin** — covering the full application lifecycle from
program discovery through admission confirmation.

## Structure

```
college-admission-platform/
├── backend/     Node.js + Express + TypeScript API
└── frontend/    React 19 + Vite + TypeScript + Tailwind + shadcn UI
```

## Quick start

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # MONGODB_URI + JWT secrets are required; Cloudinary/Brevo are optional
npm run seed:programs   # optional: seeds 20 sample engineering programs
npm run seed:admin      # required once: creates the first Admin login (see below)
npm run dev              # http://localhost:5000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Document uploads fall back to local disk (served at `/uploads`) without
Cloudinary credentials, and notification emails are logged instead of sent
without SMTP credentials (`SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`/`EMAIL_FROM` —
see "Email (Brevo SMTP)" below).

## Roles

All three roles log in through role-specific portals — `/login` (Student),
`/faculty/login` (Faculty), and `/admin/login` (Admin) — each hitting the
same `/auth/login` endpoint but rejecting a login whose account role doesn't
match that portal (e.g. a student account can't sign in at `/admin/login`).
Public self-registration only ever creates **Student** accounts; Faculty and
Admin accounts are provisioned by an existing Admin from **Admin → Faculty**
(creates a Faculty account) and **Admin → Users → New admin account**
(creates an Admin account), each with a temporary password the new user
should change after first login.

### First login (no default admin credentials exist)

There is no hardcoded or seeded admin account — every "create Faculty/Admin"
endpoint requires you to already be logged in as an Admin, so a brand new
database has no way in. Break that loop once with the seed script:

```bash
cd backend
SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=ChangeMe123 npm run seed:admin
```
(or set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / optional `SEED_ADMIN_NAME`
in `backend/.env` instead of passing them inline). This creates exactly one
Admin, hashed the same way any other account is. Log in at `/admin/login`
with that email/password, **change the password from Admin → Profile
immediately**, and from then on use **Admin → Users → New admin account** and
**Admin → Faculty → New faculty account** to provision everyone else — you
won't need the seed script again unless you're setting up a new database.

### Forgot / reset password

Every login portal links to `/forgot-password`. The flow: request a reset
link by email (the response is intentionally generic either way, to avoid
leaking which emails are registered) → click the emailed link
(`/reset-password?token=...`, valid for 1 hour) → set a new password. On
reset, every existing session (access + refresh tokens) for that account is
invalidated, so a stolen session can't outlive a password change. When
SMTP isn't configured, the reset link is logged to the server console
instead of emailed, so the flow is still testable locally.

### Email (Brevo SMTP)

All notification emails (registration is silent, but application submitted /
faculty review / correction requested / admin approved / admin declined /
password reset) are sent through [Brevo](https://www.brevo.com)'s SMTP relay
via Nodemailer.

1. Sign up at brevo.com and verify a sender (an email address or a domain)
   under **Senders, Domains & Dedicated IPs**.
2. Go to **SMTP & API → SMTP tab** to find your SMTP login and generate an
   SMTP key (this is not your Brevo account password).
3. In `backend/.env`, set:
   ```
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=your-brevo-login@example.com
   SMTP_PASS=your-brevo-smtp-key
   EMAIL_FROM="College Admissions <no-reply@yourdomain.com>"
   ```
   `EMAIL_FROM` must be an address (or on a domain) verified as a sender in
   Brevo, or sends will be rejected.
4. Restart the backend. On startup it logs whether the SMTP connection
   verified successfully. Without these variables set, email sending is
   skipped and every email is logged to the console/`backend/logs` instead —
   the app keeps working, you just won't receive real emails.

Brevo's free tier includes 300 emails/day, which is fine for development and
small deployments but not high-volume
production sending.

- **Student** — complete profile, browse programs, apply (draft → submit),
  upload/replace/delete documents (four **mandatory** uploads — Aadhaar
  card, 10th marksheet, 12th marksheet, transfer certificate — plus
  optional passport photo, community/income certificate, signature;
  submission is blocked server-side until all four mandatory documents are
  present), track status on a visual timeline, withdraw an application, and
  see faculty messages and correction requests.
- **Faculty** — a personal "Assigned Reviews" queue (plus an "Unassigned"
  tab to self-claim applications), applicant profile + document review,
  document verification (verify/reject with remarks), a formal
  recommend-approve/recommend-reject **Review**, internal reviewer notes,
  direct messages to the student, and correction requests.
- **Admin** — dashboard analytics (students/faculty/applications/programs/
  approved/rejected/pending/documents), full program CRUD, user management
  (activate/deactivate/reassign roles), faculty account provisioning,
  application assignment to faculty and final admission decisions, a
  cross-application document view, and notification broadcast (to
  everyone, a role, or one named student).

### Application status flow

`DRAFT → SUBMITTED → UNDER_REVIEW → DOCUMENTS_PENDING (optional) →
FACULTY_APPROVED / FACULTY_REJECTED → ADMIN_APPROVED / ADMIN_REJECTED →
ADMISSION_CONFIRMED`, with `WITHDRAWN` reachable by the student from any
pre-decision state. Every transition is appended to `statusHistory` (actor +
note) and notifies the student in-app and by email.

Faculty can only set faculty-tier statuses (`UNDER_REVIEW`,
`DOCUMENTS_PENDING`, `FACULTY_APPROVED`, `FACULTY_REJECTED`) on
applications assigned to them; Admin can set any status on any application.

## API overview

| Area | Base path | Notes |
|---|---|---|
| Auth | `/api/v1/auth` | Register (student-only), login, refresh, logout, me |
| Student profile | `/api/v1/students` | Self profile; `/students/:userId/profile` for staff |
| Programs | `/api/v1/programs` | Public browse; Admin create/update/deactivate |
| Applications | `/api/v1/applications` | Draft/submit/withdraw/list/get/delete |
| Documents | `/api/v1/documents` | Upload/replace/list/delete |
| Notifications | `/api/v1/notifications` | List, mark read, mark all read |
| Faculty | `/api/v1/faculty` | Queue, claim, status, review, notes, message, document verification, profile |
| Admin | `/api/v1/admin` | Users, faculty accounts, analytics, program listing, application assignment/decisions, documents, broadcast |
| Health | `/api/v1/health` | Liveness/readiness probe |

Full request/response shapes are in the Zod validators under
`backend/src/validations/`.

## Data model

Reused and extended existing collections rather than duplicating them:

- **User** — role is now `STUDENT | FACULTY | ADMIN`.
- **StudentProfile** — unchanged.
- **FacultyProfile** *(new)* — employee ID, department, designation, phone.
- **Program** — unchanged.
- **Application** — extended with `assignedFaculty` and the new status enum;
  `statusHistory` (embedded) continues to serve as the audit timeline.
- **Review** *(new)* — a faculty member's formal recommendation
  (`RECOMMEND_APPROVE` / `RECOMMEND_REJECT` + comments), separate from the
  existing freeform internal notes.
- **DocumentFile** — extended with `verifiedBy`, `verificationDate`,
  `remarks`, and an expanded `type` enum matching the required upload list.
- **Notification** — unchanged; broadcast now also supports a single named
  student as the target.
- **AuditLog** — unchanged; records every admin/faculty mutating action.

## Security & production hardening

JWT access + rotating refresh tokens, `helmet`, `mongo-sanitize`, `hpp`,
`compression`, tiered rate limiting, centralized error handling, structured
Winston logging, and audit logging — all carried over from the existing
foundation and extended to cover the new endpoints.

## Deployment

`backend/render.yaml` and `frontend/vercel.json` are included and unchanged
by this update.

## Verified

- `backend`: `npx tsc --noEmit` passes with zero errors; `ts-node` dev-mode
  startup (the actual `npm run dev` path) confirmed free of type errors.
- `frontend`: `npx tsc -b` and `npx vite build` both complete successfully.
