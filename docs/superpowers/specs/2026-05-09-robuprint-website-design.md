# RoBuPRINT website — design

**Date:** 2026-05-09
**Status:** Approved (brainstorming complete, ready for implementation planning)

## 1. Overview

RoBuPRINT is a side branch of Kuypers Kunststoftechniek that does large-scale robotic 3D printing in HDPE and PP, with hybrid additive + subtractive (post-milling) capability and in-house factory-fresh recycled feedstock. This document specifies the v1 marketing website: a bilingual (Dutch + English), industrial-but-modern, light-mode portfolio + lead-generation site with a self-service quote-request form including file upload.

## 2. Goals

- **Generate qualified leads** from architects/interior designers and industrial manufacturers
- **Showcase work** as projects accumulate (placeholder-ready at launch)
- **Position differentiators clearly**: 4×4×8 m envelope, HDPE/PP large-scale printing, hybrid print + mill, factory-fresh recyclaat
- **Bilingual reach** — Dutch (default) and English from day one
- **Self-service quote requests** including 3D file uploads (STL/STEP/OBJ etc.) up to ~1 GB per file

## 3. Non-goals (v1)

- No portfolio CMS — projects authored as markdown files, deployed via git push
- No e-commerce / instant pricing — quotes are reviewed manually before reply
- No customer login or account area
- No blog/news section (can be added later)
- No third-party transactional-email service — SMTP via existing Kuypers mail server
- No real-time chat
- No 3D model preview in the browser (post-MVP if requested)

## 4. Audience

**Primary:**
- Architects and interior designers — care about scale, finish, materials, sustainability story
- Industrial manufacturers — care about HDPE/PP properties, food-grade certification, tolerance, lead time

**Tone:** direct, technical-but-accessible, concrete specs over marketing language. Headline differentiator on every page is HDPE/PP at 4×4×8 m scale.

## 5. Sitemap & routing

```
/                       Home — hero, USPs, projects teaser, CTA
├── /wat-wij-doen       Capabilities — printing + post-milling on one page
├── /materialen         Materials — HDPE, PP, food-grade, factory-fresh recyclaat
├── /projecten          Projects index
│   └── /projecten/[slug]  Case study (markdown)
├── /over-ons           About — company, parent Kuypers, sustainability/circularity
├── /contact            Contact form
└── /offerte            Quote request with file upload

/en/                    English variant under @nuxtjs/i18n prefix routing
```

**Top nav:** RoBuPRINT (logo) · Wat wij doen · Materialen · Projecten · Over ons · Contact · **Offerte aanvragen** (CTA) · NL / EN switcher

**Footer:** sitemap links, newsletter signup, parent-company line ("Onderdeel van Kuypers Kunststoftechniek"), KvK/BTW/adres, LinkedIn link.

## 6. Visual direction

**Direction: Modern Tech-Industrial** (Hadrian / Formlabs vibe). Off-white backgrounds, bold sans-serif headlines, single blue accent, subtle gradient hero treatments, monospace for technical labels only. Soft shadows, 10–14 px border radius, generous whitespace. Pill / rounded buttons. Light mode only.

**Tokens:**
- `--bg`: `#FBFAF8` (warm off-white)
- `--surface`: `#FFFFFF`
- `--text`: `#0B0B0F`
- `--text-muted`: `#5B6470`
- `--border`: `#E5E2DA`
- `--accent`: `#1652F0` (blue)
- `--accent-soft`: `rgba(22, 82, 240, 0.08)`

**Typography:**
- Headings & body: **Inter Tight** (variable, weights 400/500/600/700)
- Technical labels / eyebrows / specs: **JetBrains Mono** (monospace, weight 400/500)

**Components style:**
- Buttons: dark fill (`--text`) for primary, blue (`--accent`) for high-conversion CTAs (e.g., quote submit), `border-radius: 10px`
- Cards: white surface, 1 px border, 10 px radius, subtle shadow on hover
- Inputs: 1 px border, 8 px radius, accent ring on focus
- Pills: 999 px radius for tags / radio-style selectors

## 7. Tech architecture

### 7.1 Frontend — Nuxt 3 on Vercel

- **Framework:** Nuxt 3 + Vue 3 + TypeScript
- **Content:** `@nuxt/content` for markdown-driven project pages and rich content blocks
- **i18n:** `@nuxtjs/i18n` with prefix routing — `/` Dutch (default), `/en/` English
- **Styling:** Tailwind CSS v4, design tokens defined in CSS `@theme`
- **Components:** custom-built atop `radix-vue` for accessible primitives (dialog, dropdown, tabs)
- **Images:** `@nuxt/image` for responsive sources
- **SEO:** `@nuxt/sitemap`, `@nuxtjs/robots`, JSON-LD via Nuxt route meta
- **Analytics:** Vercel Analytics (built-in, free tier)
- **Rendering:** static prerender (SSG) for all marketing pages; ISR optional for project pages later

### 7.2 Backend — FastAPI on user's own server

- **Framework:** FastAPI (Python 3.11+), running as ASGI app via Uvicorn behind a reverse proxy
- **Hosting:** user's own server (not Vercel)
- **Endpoints:**
  - `POST /contact` — receive contact form, validate, send notification email
  - `POST /quote/upload` — receive chunked file uploads, write to disk under `/uploads/<uuid>/<filename>`, return file references
  - `POST /quote/submit` — receive form data + file references, validate Turnstile + GDPR consent, send notification email with file links
  - `POST /newsletter` — capture email subscription
- **Mail:** SMTP via existing Kuypers mail server using `aiosmtplib` (async, stdlib-friendly). Notifications go to `info@robuprint.nl` (or chosen address).
- **Storage:** uploaded files on local disk under a configurable path. Retention: 90 days, then deleted by a scheduled cleanup job. Files referenced by UUID; never expose original filenames in URLs.
- **Newsletter (v1):** subscribers stored locally (append-only file or SQLite table) + notification email to `info@robuprint.nl` per signup. Forwarding to a list-service deferred until one is chosen.
- **Validation:** Pydantic models for all request bodies; reject unsupported file types (`.stl`, `.step`, `.stp`, `.obj`, `.3mf`, `.iges`, `.igs`, `.x_t`, `.x_b`).

### 7.3 Infrastructure & networking

- **DNS:** Cloudflare for `robuprint.nl`
  - Apex (`robuprint.nl`) → Vercel (DNS-only or proxied per Vercel guidance)
  - `api.robuprint.nl` → user's server (Cloudflare proxied, TLS terminated at Cloudflare)
- **TLS:** Cloudflare for the API; Vercel-issued cert for the frontend
- **Anti-spam:** Cloudflare Turnstile (invisible widget) on contact, newsletter, and quote forms; FastAPI verifies the token server-side
- **CORS:** FastAPI allows only `https://robuprint.nl` and `https://www.robuprint.nl`
- **Optional hardening:** Cloudflare Tunnel from the user's server, eliminating the need to open inbound ports

### 7.4 Cost outline (MVP)

- Vercel Hobby (frontend): free
- Cloudflare DNS + Turnstile + proxy: free
- User-owned server: existing
- SMTP via Kuypers mail: existing
- Domain: ~€10–15/year
- Vercel Analytics: free tier

## 8. Quote-upload UX

Single long-form page at `/offerte`. No multi-step wizard.

**Layout (top to bottom):**
1. Eyebrow + H1 + lead paragraph
2. **Drop zone** — drag/drop or click to select; states: empty, hovering, files added (with per-file progress + remove button); accepts up to 1 GB per file, multiple files
3. **Project section:**
   - Material preference (pill radios): HDPE / PP / Food-grade HDPE / Advies graag
   - Quantity (select): 1 (prototype) / 2–5 / 6–25 / 25+
   - Post-milling (pill radios): Nee / Ja / Onzeker
   - Target delivery date (free text)
   - Project description (textarea, optional)
4. **Contact section:** Name · Company · Email · Phone (optional)
5. **Submit row:** GDPR consent checkbox · Turnstile (invisible) · primary CTA "Verstuur aanvraag →"

**Upload mechanics:**
- Browser splits files into 5 MB chunks (using a small upload utility — `tus-js-client` or a hand-rolled XHR chunker)
- Each chunk POSTed to `api.robuprint.nl/quote/upload` with the upload UUID and chunk index
- FastAPI streams chunks to disk, returns 200 per chunk
- After all chunks for a file uploaded, frontend marks file complete
- Submit aggregates form data + list of upload UUIDs, posts to `/quote/submit`
- On success: show confirmation page ("Bedankt — we nemen binnen 2 werkdagen contact op"). On error: keep form state and show inline error.

**Server-side flow on `/quote/submit`:**
1. Verify Turnstile token
2. Verify GDPR consent flag is true
3. Validate Pydantic model (email format, required fields)
4. Compose email with form context + download links to each upload (token-protected URL served by FastAPI; expires with the 90-day retention)
5. Send via SMTP to `info@robuprint.nl`
6. Return 200 to frontend

**Cleanup:** scheduled job (cron or systemd timer) deletes uploads older than 90 days. Specifics in implementation plan.

## 9. Content strategy

**v1 ships scaffolded:** I write structural copy in NL + EN; user provides assets and case-study content as it becomes available.

**By page:**

| Page | Written at launch | Needed from user |
|---|---|---|
| Home | Hero, USPs, projects teaser, CTAs | Hero photo/video of robot |
| Wat wij doen | Print + post-milling explainers | Photos of robot, milled-finish examples |
| Materialen | HDPE/PP/food-grade/recyclaat narrative | Photos of granulate, finished pieces |
| Projecten (index) | Empty state + placeholders | 3–5 case-study briefs |
| Projecten/[slug] | Markdown template | One markdown file per project (title, client, goal, materials, photos, 150-word write-up) |
| Over ons | Company narrative, Kuypers link, sustainability story | Team / facility photos |
| Contact | Form + business-info placeholders | KvK / BTW / address / hours |
| Offerte | Functional form | n/a |

**Translations:** Dutch authored first; English derived as a per-key sibling. Translation files live in `i18n/locales/{nl,en}/{home,about,...}.json`. Project markdown files have `{slug}.nl.md` and `{slug}.en.md` siblings.

**SEO:**
- Meta + Open Graph per page (configured via Nuxt route meta)
- `sitemap.xml` and `robots.txt` via Nuxt modules
- JSON-LD: `Organization` site-wide; `Service` on capabilities; `BreadcrumbList` on case studies
- Target queries (NL): "HDPE 3D printen", "groot formaat 3D print", "robotachtig 3D printen", "food grade 3D printing"
- Target queries (EN): "large-scale HDPE 3D printing", "robotic 3D printing", "food-grade 3D printing service"

**Placeholder strategy:**
- Hero imagery: industrial-style stock photos with blue-tint overlay (NOT generic FDM-printer stock)
- Project cards: geometric SVG illustrations with "Coming soon — first project drop Q3 2026" labels
- Logo: text-only "RoBuPRINT" in Inter Tight 700 until SVG logo arrives

## 10. User-supplied content & secrets needed before launch

Priority-ordered:

1. **Logo** (SVG, optionally a wordmark variant) — until then we ship with text logo
2. **Domain** — confirm `robuprint.nl` available and registered; configure Cloudflare
3. **`info@robuprint.nl`** mailbox + **SMTP credentials** for the FastAPI backend
4. **Business details** for footer: KvK, BTW, address, opening hours
5. **3–5 hero photos** of robot/printer in action (replace stock placeholders)
6. **First case study** content + photos — can land post-launch
7. **LinkedIn URL** for footer

## 11. Open items deferred to implementation plan

- Choice of chunked-upload library (`tus-js-client` vs custom XHR chunker)
- Production process manager and reverse-proxy choice on the FastAPI host (systemd + Caddy / Docker / pm2 — user manages)
- Backup policy for the uploads directory
- Logging / monitoring approach for the FastAPI service
- Specific i18n folder structure within the Nuxt project
- Cleanup-job mechanism (cron entry vs systemd timer)
- Whether to use Cloudflare Tunnel vs origin certs for the API hop

## 12. Success criteria for v1

- Site reachable bilingually at `robuprint.nl` and `robuprint.nl/en`
- All seven primary routes render in both languages with structural copy in place
- Contact form delivers email to `info@robuprint.nl`
- `/offerte` accepts a 200 MB STL upload and successfully sends a submission email with a working file reference
- Lighthouse Performance ≥ 90 on Home and Materialen, Accessibility ≥ 95 across the site
- Site passes basic GDPR review (consent on forms, privacy page, cookie posture documented)
