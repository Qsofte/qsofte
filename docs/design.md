# Design

Inspired by Jony Ive's work at Apple: **simplicity, clarity, deference.**
The content is the interface; the design steps back so it can be read.

## Principles

1. **Type does the work.** Large, tightly tracked headlines; one system font
   (SF Pro on Apple devices). Hierarchy comes from size and weight, not colour or boxes.
2. **Space is a material.** Generous section spacing (`--section`), an 8px grid
   (`--space-1…10`), and a readable line length (`--measure`).
3. **Ink on white, one quiet accent.** Navy ink (`--ink`, `--ink-2`, `--ink-3`) on
   white and soft greys (`--surface-2/3`). Mint (`--accent`) only for focus rings and small marks.
4. **Flat and precise.** Hairlines (`--border`) and quiet surfaces separate things.
   No shadows, no gradients.
5. **One thing to do.** At most one primary button (`btn--primary`) per view;
   everything else is `btn--secondary` or a `link-more` text link.
6. **Drawn, not decorated.** Icons come from `components/Icon.tsx`: one family, 24px
   grid, 1.5 stroke, round caps, `currentColor`. No emoji, no clip art, no stock illustration.
7. **Clients shown quietly.** Logos in one muted tone; colour appears on hover.
8. **Phone first.** Nothing scrolls sideways, tap targets are at least 44px
   (`--tap`), and inputs are 16px or larger.

## Images

- Only WebP or SVG, each under 150 KB, in `src/assets/`. Every image has `alt`.
- Photography or illustration must be consistent in style and must show the real thing.
  The previous AI line-art set was retired because of fake text ("SME", "Open EMR"),
  mixed stroke weights, visual noise, and a testing image that showed a payment terminal.

## Where things live

| What | Where |
| --- | --- |
| Every colour, size, font, radius and motion value | `src/styles/tokens.css` |
| Reset, type classes, `.container`, `.section`, `.btn`, `.link-more` | `src/styles/base.css` |
| A page or component's styles, scoped to its root class | `Foo.css` next to `Foo.tsx` |
| All copy | `src/content.ts` |

## How it is enforced

| Guard | Checks | Runs |
| --- | --- | --- |
| `src/__tests__/designSystemHolds.test.ts` | tokens only (colour, spacing, type), no shadows/gradients, stylesheets scoped to their root, shared classes only in base.css, only two button variants, copy in content.ts, no emoji, images WebP/SVG ≤150 KB, all used, all with alt | `npm test`, CI, and after every edit (`.claude/hooks/ui-guard.sh`) |
| `e2e/guardrails.spec.ts` | in a real browser on desktop and phone: no sideways scroll, 44px taps, 16px inputs, ≤1 primary button per view, every colour on screen is a token, images load | `npm run test:e2e`, CI, and against the live site after each deploy |
| `src/App.test.tsx`, `e2e/site.spec.ts` | clients preserved, services listed, old URLs redirect | `npm test` / `npm run test:e2e` |

Run everything with `.claude/scripts/ui-check.sh`. The checks are zero-tolerance: fix the code, never the test.
