# Influencer Affiliate Storefront

A production-ready Next.js (App Router) affiliate marketing storefront with a
secure admin dashboard, Neon PostgreSQL + Prisma, Auth.js, S3-compatible image
storage, affiliate redirect tracking, and an analytics dashboard.

## Tech stack

- Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4
- Neon Serverless PostgreSQL · Prisma ORM 7
- Auth.js v5 (credentials, JWT, Argon2id)
- React Hook Form + Zod
- S3-compatible storage (Cloudflare R2 / AWS S3 / MinIO) with a local dev driver
- Vitest (unit) · Playwright (e2e)

## Local setup

### 1. Install

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Fill in `.env`:

- `DATABASE_URL` — Neon **pooled** connection string
- `DIRECT_URL` — Neon **direct/unpooled** connection string (used for migrations)
- `AUTH_SECRET` — generate with `npx auth secret`
- `NEXT_PUBLIC_SITE_URL` — e.g. `http://localhost:3000`
- `STORAGE_DRIVER` — `local` for development (default), `s3` for production

### 3. Database

```bash
npm run db:generate
npm run db:migrate      # creates tables
npm run db:seed         # optional demo data
```

### 4. Create the first admin (no public registration endpoint exists)

```bash
npm run create-admin -- --email you@example.com --password "YourPass123!" --name "Your Name"
```

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000 (storefront) and http://localhost:3000/login (admin).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run migrations (dev) |
| `npm run db:deploy` | Apply migrations (prod) |
| `npm run db:seed` | Seed demo data |
| `npm run create-admin` | Bootstrap an admin user |
| `npm run test` | Unit tests |
| `npm run test:e2e` | Playwright e2e tests |
| `npm run verify` | lint + typecheck + test + build |

## Neon setup

1. Create a project at https://neon.tech
2. Copy the **pooled** connection string → `DATABASE_URL`
3. Copy the **direct** (unpooled) connection string → `DIRECT_URL`
4. Both must include `?sslmode=require`

## Vercel deployment

1. Push the repo to GitHub.
2. Import into Vercel.
3. Set environment variables in Vercel (same as `.env`, with production values):
   - `DATABASE_URL`, `DIRECT_URL`
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (your production URL)
   - `STORAGE_DRIVER=s3` plus `S3_*` vars
4. Build command: `npm run build` (default). Install command: `npm install`.
5. After first deploy, run migrations against production:
   ```bash
   DIRECT_URL="..." npx prisma migrate deploy
   ```
6. Bootstrap the production admin:
   ```bash
   DIRECT_URL="..." DATABASE_URL="..." npm run create-admin -- --email ... --password ...
   ```

## Production migration instructions

```bash
# Apply pending migrations (non-destructive)
npm run db:deploy

# Regenerate client after schema changes
npm run db:generate
```

Always back up the database before running migrations in production.

## Image storage

- Development: `STORAGE_DRIVER=local` writes to `public/uploads` (gitignored).
- Production: set `STORAGE_DRIVER=s3` and provide `S3_ENDPOINT`, `S3_REGION`,
  `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`.
  Works with Cloudflare R2, AWS S3, MinIO, Supabase Storage, etc.
  Uploads are authorized server-side and use short-lived presigned URLs; storage
  credentials never reach the browser.

## Architecture notes

- Public storefront lives under `app/(public)`, admin under `app/admin`.
- All product/category data comes from PostgreSQL via Prisma — never hardcoded.
- Admin mutations are protected by server-side `requireStaff`/`requireAdmin`
  checks in every server action and the admin layout.
- Website content (branding, homepage sections, nav, social, SEO, affiliate
  disclosure, general settings) is stored in `SiteSetting` and editable from
  `/admin/settings` without redeployment. Changes invalidate the `settings`
  cache tag via `updateTag`.
- Affiliate redirects go through `/go/[offerId]`: the offer and its product are
  re-validated, the destination is checked against the approved-domain policy,
  a click is recorded, and the visitor is 307-redirected to the exact stored URL.
- Clicks are recorded with best-effort source attribution (referrer / UTM) and
  bot classification; clicks are not sales or commissions.

## Testing

```bash
npm run test        # Vitest unit tests
npm run test:e2e    # Playwright (requires a running dev server + DB)
npm run verify      # lint + typecheck + test + build
```

## Troubleshooting

- **"Can't reach database server"** during build: the build prerenders pages that
  query the DB. Make sure `DATABASE_URL` points to a reachable Neon instance, or
  the queries are wrapped to return empty results (they are, for lists). For a
  fully working site, provide a real Neon URL.
- **Prisma client not found**: run `npm run db:generate`.
- **Migrations fail on Neon**: use the direct (unpooled) URL for `DIRECT_URL`,
  not the pooled one.
- **Login loop / 401**: ensure `AUTH_SECRET` is set and the admin user exists
  (`npm run create-admin`).
- **Uploads fail in production**: verify `STORAGE_DRIVER=s3` and all `S3_*`
  variables; check CORS on the bucket for PUT from your origin.
- **Stale storefront after settings change**: settings use `updateTag("settings")`
  for read-your-own-writes; if a CDN caches HTML, purge or lower cache TTL.

## Security

- No public admin registration endpoint.
- First admin is created via the protected `create-admin` script.
- Passwords hashed with Argon2id.
- Sessions are JWT in HTTP-only, Secure (prod), SameSite=lax cookies.
- Server-side authorization on every admin page and mutation.
- Affiliate destinations are validated against an approved-domain allowlist;
  arbitrary redirects from query params are never accepted.
- No raw IP addresses are stored (only a daily-salted hash).
- Secrets are never exposed via `NEXT_PUBLIC_*`.
