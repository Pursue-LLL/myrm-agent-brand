# Dual Marketing Pages — Local (OSS) vs Cloud (SaaS)

> **Status (2026-06):** Two distinct pages on `myrmagent.ai`.

| Route | Audience | Linked from `/`? |
|-------|----------|------------------|
| **`/`** | Open-source / self-host | Yes (homepage) |
| **`/cloud`** | Cloud-hosted SaaS | **No** until launch (~1 month) |

---

## Architecture

### Open-source page `/`

- **Component:** `LandingEditorial.tsx`
- **i18n:** `marketing.*` in `locales/en.json`, `locales/zh.json`
- **Deploy paths:** `localWebui` + `tauri` only (`lib/deploy-paths.ts`)
- **Tone:** GitHub, BYOK, Docker, desktop download, highlights carousel
- **No:** cloud login, WU pricing, SaaS CTAs

### Cloud SaaS page `/cloud`

- **Component:** `cloud/LandingCloud.tsx` + `cloud/CloudShell.tsx`
- **Preview:** `landing/WorkspacePreview.tsx` with `messagesNamespace="cloud"` and `shell="shell"`
- **i18n:** `cloud.*` namespace (separate from `marketing`)
- **URLs:** `lib/cloud-paths.ts` (login/register/billing → `app.myrmagent.ai` with `utm_campaign=cloud`)
- **Tone:** zero ops, sandbox, Work Units, Stripe billing
- **Block order:** Hero → WorkspacePreview → How it works → Pricing → FAQ → Final CTA
- **SEO:** `robots: noindex` until public launch
- **Footer:** link back to `/` for self-host; Privacy · Terms · Refund (cloud only — OSS `/` footer omits Refund)

### Legal pages (`/privacy`, `/terms`, `/refund`)

- **i18n:** `marketing.legal.*` — covers website, self-hosted local/desktop, and MyrmAgent Cloud
- Cloud page footer links to the same legal routes as the OSS site

### Redirects

- `/pricing` → `/download` (302 via `public/_redirects`) until cloud launch; restore to `/cloud` when promoting SaaS

---

## Launch checklist (when promoting cloud)

1. Remove `robots: { index: false }` from `src/app/cloud/page.tsx`
2. Add `/cloud` to `src/app/sitemap.ts`
3. Optional: add footer link on `/` → `/cloud` (or nav entry)
4. Update `cloud.*` copy if pricing tiers changed
5. Run `bun run validate:locales && bun run build`

---

## File map

```
src/app/page.tsx              → LandingEditorial (OSS)
src/app/cloud/page.tsx        → LandingCloud (SaaS)
src/lib/deploy-paths.ts       → local + desktop paths only
src/lib/cloud-paths.ts        → SaaS app URLs + UTM
src/lib/cloud-marketing-nav.ts
src/components/marketing/cloud/
  LandingCloud.tsx
  CloudShell.tsx
  cloud-marketing-keys.ts
src/components/marketing/landing/
  WorkspacePreview.tsx   → OSS `/` (editorial) + `/cloud` (shell)
locales/*.json
  marketing.*   → OSS page
  cloud.*       → SaaS page
```

---

## Restoring full SaaS on homepage (not recommended)

If you ever merge back to a single landing (not advised — causes “四不像”):

1. Re-add `saas` to `DEPLOY_PATH_IDS`
2. Merge `cloud.*` keys into `marketing.*`
3. Delete `/cloud` route

Prefer keeping dual pages.
