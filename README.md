# CodeCraft Studio Platform

An independent React + Express application with a local SQLite database. The frontend keeps the existing CodeCraft public pages, admin workspace, client portal, project conversations, deliverables, change requests, reviews, and project gallery while using a self-managed API.

## Requirements

- Node.js 20.18+ (Node.js 22 LTS recommended)
- npm 10+

## First-time setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env`.
3. Generate and set a unique `JWT_SECRET` (at least 32 random characters), then set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (at least 12 characters). For example, generate a secret with `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`.
4. Start the frontend and API together:
   ```bash
   npm run dev
   ```
5. Open the Vite URL shown in the terminal. Sign in at `/login` using the admin email and password from `.env`.

The first server start creates the initial administrator. SQLite creates `data/codecraft.sqlite` automatically. Uploaded files are stored in `uploads/`.

## Production

```bash
npm install
npm run build
npm start
```

Set `NODE_ENV=production`, use HTTPS behind a reverse proxy, set `TRUST_PROXY=true` only when the app is behind a trusted reverse proxy, set a strong `JWT_SECRET`, and keep the `data/` and `uploads/` directories on persistent storage. This is a single-server SQLite deployment; do not deploy to an ephemeral serverless filesystem. Back up the database and uploads regularly.

## Client accounts

Sign in as an administrator, open Admin Dashboard → Client Accounts, and create a client account. Assign a unique password of at least 12 characters and share it privately with that client. Then create the client's project under Client Projects using the same email address. Clients can only access records belonging to projects assigned to their account.

## Optional email delivery

Email notifications are recorded in SQLite by default. To deliver them, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` in `.env`. Without SMTP, the app does not claim an email was delivered.

## API and data

- `GET /api/health` — API health check
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` — session authentication
- `/api/ClientProject`, `/api/Deliverable`, `/api/ChangeRequest`, `/api/DeliverableReview`, `/api/ProjectMessage`, `/api/ProjectPhoto`, `/api/TeamMember` — entity records
- `POST /api/uploads` — authenticated administrator file uploads (100 MB limit)
- `POST /api/contact` — public contact form submissions

The API enforces role checks and project ownership on the server. Client access is not based on frontend-only filtering.

## Notes

- No hosted backend or third-party app platform is required.
- The database and uploaded files are intentionally excluded from Git.
- The project uses a warm linen, moss, clay, and brass palette instead of the former full-black neon treatment.
