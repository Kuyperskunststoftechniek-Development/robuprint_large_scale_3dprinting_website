# RoBuPRINT website

Bilingual (NL/EN) Nuxt 3 marketing site. Forms POST to a separately-hosted FastAPI backend.

## Local dev

```bash
pnpm install
cp .env.example .env
# Fill in NUXT_PUBLIC_API_BASE (e.g. http://localhost:8000 for local backend)
pnpm dev
```

## Tests

```bash
pnpm test
```

## Build / preview

```bash
pnpm build
```

## Deploy (Vercel)

1. Connect the repo on Vercel.
2. Set environment variables: `NUXT_PUBLIC_API_BASE`, `NUXT_PUBLIC_TURNSTILE_SITE_KEY`, `NUXT_PUBLIC_SITE_URL`, `NUXT_TURNSTILE_SECRET_KEY`.
3. Push to `main` — Vercel auto-deploys.

## DNS (Cloudflare)

- `robuprint.nl` and `www.robuprint.nl` → Vercel (per Vercel docs)
- `api.robuprint.nl` → user's FastAPI server (Cloudflare proxied)
