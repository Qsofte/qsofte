---
name: ui-change
description: The design guardrails for the Qsofte website and how to prove a change keeps them. Use for ANY change that touches what the site looks like or says (a .css, .tsx, content.ts or image under src/), including small tweaks, new pages, restyles and copy edits. Read it before editing, and run its check before pushing.
---

# Changing the site without breaking the design

The site follows `docs/design.md`: simplicity, clarity, deference (Jony Ive inspired).
Read it first. These are the rules the guards enforce.

## The rules

1. **Every value is a token.** Colours, spacing, type, radii and motion come from
   `src/styles/tokens.css`. Need a new value? Add a token there, with a comment saying what it is for.
   Never a hex, `rgb()`, a named colour or a raw `px`/`rem` in margin, padding, gap or type.
2. **Flat.** No `box-shadow`, `text-shadow` or gradients. Separate things with `var(--border)`
   or a quiet surface (`--surface-2`).
3. **Scoped stylesheets.** `Foo.tsx` imports `./Foo.css`; every selector in it starts with the
   component's root class (`.home …`, `.site-header …`). Shared classes (`.btn`, `.container`,
   `.section`, `.eyebrow`, `.display`, `.headline`, `.lead`, `.muted`, `.link-more`) are defined
   only in `styles/base.css`. A page may *lay out* a button (`.contact-page .btn { justify-self: start }`)
   but not restyle it.
4. **Two buttons.** `btn btn--primary` (at most one visible per view: the main action) and
   `btn btn--secondary`. For quieter actions use `link-more`.
5. **Copy lives in `src/content.ts`.** Components render it; no hardcoded text in JSX.
6. **Icons are drawn** in `components/Icon.tsx`: 24px grid, `strokeWidth={1.5}`, round caps,
   `currentColor`, `aria-hidden`. No emoji, no raster icons, no clip art.
7. **Images** are WebP or SVG, ≤150 KB, used, with `alt` (`alt=""` if decorative).
8. **Clients stay.** Westpac, Chilli Masala, Adyopant Legal and Atmabodh remain on the home page.
9. **Phone floors.** No sideways scroll at 390px, tap targets ≥ `var(--tap)` (44px), inputs ≥ 16px.
10. **Old URLs keep working.** Renaming a route? Add a `<Navigate>` from the old path in `App.tsx`.

## Prove it

```bash
.claude/scripts/ui-check.sh      # design guard, unit tests, build, browser guardrails (desktop + phone)
```

A PostToolUse hook runs the design guard after every edit under `src/` and hands any failure
back to you. Fix the code; never loosen a guard to make a change pass. If a guard is genuinely
wrong, change it in its own commit and say why.

To look at the result: `npm run build && npm run preview`, then open http://localhost:4173
at 390px and 1366px wide.
