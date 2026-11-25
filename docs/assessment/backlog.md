# Improvement backlog

Priority: **P0** critical security, functionality or production issue · **P1** high
impact · **P2** important optimisation · **P3** optional. Effort: S (< 2 h),
M (half a day), L (days). Status reflects this branch; "Owner" means it needs a
person outside the codebase.

## P0

### P0-1 Rotate the Azure client secret exposed in git history — Owner
- **Current state:** an Azure AD client ID, tenant ID and secret are in public history (`qsofte-backend/app.js`, before #21).
- **Evidence:** `git log --all -- qsofte-backend/app.js`; the file at `df0a6bf^` contains the secret.
- **Change:** rotate the secret in Azure (Entra ID → App registrations → Certificates & secrets). Optionally rewrite history afterwards; that is destructive and needs approval.
- **Benefit:** closes a live credential leak. **Effort:** S. **Dependencies:** Azure admin access.
- **Acceptance:** the old secret is revoked in Azure.

## P1

### P1-1 Prerender every page to static HTML with its own metadata — Done
- **Current state:** every URL returns the same empty shell; same title, description and canonical (`/`).
- **Change:** build-time prerender with React's server renderer (no new runtime dependency). Each page gets its own `<title>`, description, canonical, Open Graph data and full HTML.
- **Benefit:** correct indexing of product pages; link previews work. **Effort:** M.
- **Acceptance:** raw HTML for each route contains its `<h1>` and unique title, description and canonical (e2e `seo.spec.ts`).

### P1-2 Real 404s and 301s for retired URLs — Done
- **Current state:** unknown paths return 200 (soft 404).
- **Change:** nginx serves `404.html` with status 404. `/services`, `/industries` → `/engineering`; `/Connect`, `/connect` → `/contact`, all 301.
- **Acceptance:** the CI image smoke test asserts the status codes.

### P1-3 Fix colour contrast — Done
- **Current state:** `--ink-3` (#7a8399) fails 4.5:1 on every page (axe, serious).
- **Change:** darken the token; verify with axe.
- **Acceptance:** zero axe violations at WCAG 2.2 AA on every route (e2e `a11y.spec.ts`).

### P1-4 Adopt the approved brand architecture — Done
- **Change:**
  - Navigation: Products (Srovi, Samewe), Engineering, About, Contact.
  - RAM renamed Samewe.
  - Services and Industries merged into **Qsofte Engineering**.
  - Footer reflects the parent brand and its products.
- **Acceptance:** each brand has one canonical page; unit tests cover the nav and pages.

### P1-5 Remove unsupported claims; evidence-backed copy — Done
- **Change:**
  - Replace the invented RAM copy with Samewe's verified scope.
  - Drop the unsupported domain capability lists.
  - Attach an evidence source to every engineering capability (`decisions.md`).
- **Acceptance:** every factual claim maps to a row in `README.md` *Product evidence* or to an owner statement logged in `decisions.md`.

### P1-6 Samewe page with honest status and an early-interest path — Done
- **Change:** `/samewe` with problem, audience, module status (done / in progress / planned) and "Register interest" through the real contact form, with the topic preselected.
- **Acceptance:** no claim of availability; the form submits with topic `Samewe`.

### P1-7 Privacy notice for the contact form — Done (legal review: Owner)
- **Change:** `/privacy` states what the form collects, why, the processor (Formspree), retention, rights and contact. Linked from the form and the footer.
- **Acceptance:** linked from every page; no tracking claims that are false.

### P1-8 Patch react-router-dom (high-severity advisories) — Done
- **Change:** 6.28 → latest 6.30.x (non-breaking).
- **Acceptance:** `npm audit --omit=dev` reports 0 vulnerabilities.

## P2

### P2-1 Content-Security-Policy and Permissions-Policy — Done
- **Change:** a strict CSP (`default-src 'self'`; `form-action` and `connect-src` include formspree.io; `frame-ancestors 'self'`) and a restrictive Permissions-Policy, in both nginx templates.
- **Acceptance:** headers present; no CSP violations in the browser (e2e against nginx).

### P2-2 Spam protection — Done
- **Change:** Formspree honeypot field (`_gotcha`), hidden from people and from assistive technology.
- **Acceptance:** the field is present, not focusable, and has no visible label.

### P2-3 Structured data — Done
- **Change:** `Organization` JSON-LD on the home page; `SoftwareApplication` on the Srovi page. Samewe gets none, since it is not released.

### P2-4 Tablet viewport and automated accessibility in CI — Done
- **Change:** a Playwright tablet project (768 px); `@axe-core/playwright` test on every route.

### P2-5 Size client logos to avoid layout work — Done
- **Change:** explicit width and height on logo images (Lighthouse `unsized-images`).

### P2-6 Dev-only advisories (esbuild via Vite 5, Vitest) — Open
- **Change:** move to Vite 6 or 7 and Vitest 3 in a separate PR. A major-version bump; dev server only.

### P2-7 Key-based deploy SSH — Open (Owner)
- **Change:** replace `sshpass` password auth with an SSH deploy key held as a GitHub secret.

## P3

- **P3-1 Real product screenshots** for Srovi and Samewe, supplied by the owner. Open.
- **P3-2 Linter** (ESLint) — TypeScript strict and the design guard cover most of its value today. Open.
- **P3-3 `www.qsofte.com`** — add a DNS record and a 301 to the apex, if wanted. Open (Owner).
- **P3-4 Conversion measurement** — privacy-friendly analytics only if the owner wants it. Open (Owner).
- **P3-5 Case studies** — only once there are written, approved case studies to publish. Open.
