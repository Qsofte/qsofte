/**
 * The design system holds.
 *
 * docs/design.md sets the rules: simplicity, clarity, deference. Every value
 * comes from src/styles/tokens.css, buttons are the shared .btn classes, and
 * each page or component stylesheet only styles inside its own root class.
 *
 * This site started clean, so every check is zero-tolerance: there is no
 * baseline to ratchet. Fix the code, never the test.
 *
 * Runs in CI (npm test) and after every edit to src/ (.claude/hooks/ui-guard.sh).
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { basename, dirname, join, relative } from 'path';
import { describe, expect, it } from 'vitest';

const SRC = join(__dirname, '..');
const TOKENS = 'styles/tokens.css';
const GLOBAL_SHEETS = new Set([TOKENS, 'styles/base.css']);

const walk = (dir: string, out: string[] = []): string[] => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '__tests__') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};

const stripComments = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const all = walk(SRC).map((path) => ({ path, name: relative(SRC, path).split('\\').join('/') }));
const code = all
  .filter((f) => /\.(css|tsx?)$/.test(f.name) && !/\.test\.tsx?$/.test(f.name) && !f.name.endsWith('.d.ts'))
  .map((f) => ({ ...f, text: stripComments(readFileSync(f.path, 'utf8')) }));
const css = code.filter((f) => f.name.endsWith('.css'));
const tsx = code.filter((f) => f.name.endsWith('.tsx'));
const styled = code.filter((f) => f.name !== TOKENS);
const cssText = css.map((f) => f.text).join('\n');

/** Declarations as [file, property, value]. */
const declarations = (files: typeof css) =>
  files.flatMap((f) =>
    [...f.text.matchAll(/(?:^|[;{\s])([a-z-]+)\s*:\s*([^;{}]+);/g)].map((m) => ({
      file: f.name,
      prop: m[1],
      value: m[2].trim(),
    })),
  );

/** Selectors as [file, selector], with @media wrappers unwrapped. */
const selectors = (f: { name: string; text: string }) =>
  [...f.text.replace(/@[a-z-]+[^{;]*\{/g, '').matchAll(/([^{}@;]+)\{/g)]
    .map((m) => m[1].trim())
    .filter((s) => s && !s.startsWith('@') && !/^(from|to|\d+%)$/.test(s) && !s.startsWith('('))
    .flatMap((s) => s.split(',').map((p) => p.trim()));

const COLOUR_LITERAL =
  /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(|\b(?:white|black|red|green|blue|gray|grey|navy|orange|yellow|purple|pink|silver)\b/;
const NON_COLOUR_PROPS = /^(content|grid-template-areas|font-family)$/;

describe('values come from tokens', () => {
  it('every var(--x) names a token that exists', () => {
    const defined = new Set([...cssText.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
    const broken = code.flatMap((f) =>
      [...f.text.matchAll(/var\((--[a-z0-9-]+)/g)]
        .filter((m) => !defined.has(m[1]))
        .map((m) => `${f.name}: ${m[0]}`),
    );
    expect(broken, 'An undefined token renders as nothing. Add it to tokens.css or use an existing one.').toEqual([]);
  });

  it('no colour is written outside tokens.css', () => {
    const found = [
      ...declarations(css.filter((f) => f.name !== TOKENS))
        .filter((d) => !NON_COLOUR_PROPS.test(d.prop) && COLOUR_LITERAL.test(d.value))
        .map((d) => `${d.file}: ${d.prop}: ${d.value}`),
      ...code
        .filter((f) => !f.name.endsWith('.css'))
        .flatMap((f) => [...f.text.matchAll(/#[0-9a-fA-F]{6}\b|rgba?\(/g)].map((m) => `${f.name}: ${m[0]}`)),
    ];
    expect(found, 'Use a colour token (var(--ink), var(--surface-2)…).').toEqual([]);
  });

  it('spacing uses the 8px scale', () => {
    const found = declarations(css.filter((f) => f.name !== TOKENS))
      .filter((d) => /^(margin|padding|gap|row-gap|column-gap)(-[a-z]+)?$/.test(d.prop))
      .filter((d) => /\d(px|rem|em)\b/.test(d.value.replace(/var\([^)]*\)/g, '')))
      .map((d) => `${d.file}: ${d.prop}: ${d.value}`);
    expect(found, 'Use --space-1…10, --section or --gutter.').toEqual([]);
  });

  it('type uses the type scale and the one font', () => {
    const found = declarations(css.filter((f) => f.name !== TOKENS))
      .filter((d) => /^(font-size|font-weight|font-family|letter-spacing|line-height)$/.test(d.prop))
      .filter((d) => !/^(var\(--[a-z0-9-]+\)|inherit)$/.test(d.value))
      .map((d) => `${d.file}: ${d.prop}: ${d.value}`);
    expect(found, 'Use --text-*, --weight-*, --tracking-*, --leading-* and --font.').toEqual([]);
  });

  it('surfaces are flat: no shadows, no gradients', () => {
    const found = declarations(styled.filter((f) => f.name.endsWith('.css')))
      .filter((d) => /^(box-shadow|text-shadow)$/.test(d.prop) || /gradient\(/.test(d.value))
      .map((d) => `${d.file}: ${d.prop}: ${d.value}`);
    expect(found, 'Separate with a hairline (var(--border)) or a quiet surface, not a shadow.').toEqual([]);
  });
});

describe('stylesheets stay in their lane', () => {
  const pageSheets = css.filter((f) => !GLOBAL_SHEETS.has(f.name));

  it('each page/component stylesheet only styles inside its own root class', () => {
    const leaks = pageSheets.flatMap((f) => {
      const sels = selectors(f);
      const root = sels[0]?.match(/^\.[a-z][a-z0-9-]*/)?.[0];
      return sels
        .filter((s) => !root || !(s === root || s.startsWith(`${root} `) || s.startsWith(`${root}:`) || s.startsWith(`${root}.`)))
        .map((s) => `${f.name}: "${s}" (root ${root})`);
    });
    expect(leaks, 'Every stylesheet is bundled into one; prefix rules with the file’s root class.').toEqual([]);
  });

  it('no page/component stylesheet defines the shared classes', () => {
    const SHARED = /\.(btn|container|section|eyebrow|display|headline|lead|muted|link-more|skip-link)(?![\w-])/;
    const found = pageSheets.flatMap((f) =>
      selectors(f)
        .filter((s) => SHARED.test(s.split(/\s+/)[0]))
        .map((s) => `${f.name}: ${s}`),
    );
    expect(found, 'Shared classes live in styles/base.css.').toEqual([]);
  });

  it('every stylesheet is imported by the component of the same name', () => {
    const orphans = pageSheets.filter((f) => {
      const tsxPath = join(SRC, dirname(f.name), `${basename(f.name, '.css')}.tsx`);
      try {
        return !readFileSync(tsxPath, 'utf8').includes(`'./${basename(f.name)}'`);
      } catch {
        return true;
      }
    });
    expect(orphans.map((f) => f.name), 'Pair Foo.css with Foo.tsx and import it there.').toEqual([]);
  });

  it('every btn class used in markup exists, and there are only two', () => {
    const used = new Set(tsx.flatMap((f) => [...f.text.matchAll(/\bbtn--[a-z-]+/g)].map((m) => m[0])));
    const bad = [...used].filter((c) => !['btn--primary', 'btn--secondary'].includes(c) || !cssText.includes(`.${c}`));
    expect(bad, 'Use btn--primary (once per view) or btn--secondary.').toEqual([]);
  });
});

describe('markup', () => {
  it('copy lives in content.ts, not in components', () => {
    const found = tsx.flatMap((f) =>
      [...f.text.matchAll(/>([^<>{}]*[A-Za-z]{2,}[^<>{}]*)</g)]
        .filter((m) => !/[=;()]/.test(m[1])) // skip TypeScript generics, which also use < >
        .map((m) => `${f.name}: "${m[1].trim()}"`),
    );
    expect(found, 'Move the text into src/content.ts and render it.').toEqual([]);
  });

  it('no emoji; icons are the Icon component', () => {
    const found = code.filter((f) => /\p{Extended_Pictographic}/u.test(f.text)).map((f) => f.name);
    expect(found, 'Draw it in components/Icon.tsx (24px grid, 1.5 stroke, currentColor).').toEqual([]);
  });

  it('every image has alt text', () => {
    const found = tsx.flatMap((f) =>
      [...f.text.matchAll(/<img\b[^>]*>/g)].filter((m) => !/\balt=/.test(m[0])).map((m) => `${f.name}: ${m[0]}`),
    );
    expect(found, 'Add alt (alt="" for purely decorative images).').toEqual([]);
  });
});

describe('images', () => {
  const assets = all.filter((f) => f.name.startsWith('assets/'));

  it('are WebP or SVG and under 150 KB', () => {
    const bad = assets
      .filter((f) => !/\.(webp|svg)$/.test(f.name) || statSync(f.path).size > 150 * 1024)
      .map((f) => `${f.name} (${Math.round(statSync(f.path).size / 1024)} KB)`);
    expect(bad, 'Convert to WebP and resize before adding (see docs/design.md).').toEqual([]);
  });

  it('are all used somewhere', () => {
    const source = code.map((f) => f.text).join('\n');
    const unused = assets.filter((f) => !source.includes(basename(f.name))).map((f) => f.name);
    expect(unused, 'Delete images nothing uses.').toEqual([]);
  });
});
