// The Desk follows the public site's design rules (docs/design.md). Zero tolerance: fix the code, not this test.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(__dirname, '..');
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? (f === '__tests__' ? [] : files(p)) : [p];
  });
const all = files(SRC);
const css = all.filter((f) => f.endsWith('.css'));
const tsx = all.filter((f) => f.endsWith('.tsx'));
const TOKENS = join(SRC, 'styles', 'tokens.css');
const BASE = join(SRC, 'styles', 'base.css');
const read = (f: string) => readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rel = (f: string) => relative(SRC, f);

describe('design system holds', () => {
  it('writes colours only in tokens.css', () => {
    const bad = css
      .filter((f) => f !== TOKENS)
      .flatMap((f) => (read(f).match(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/gi) ?? []).map((m) => `${rel(f)}: ${m}`));
    expect(bad).toEqual([]);
  });

  it('uses only tokens that exist', () => {
    const defined = new Set([...read(TOKENS).matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
    const missing = [...css, ...tsx].flatMap((f) =>
      [...read(f).matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]).filter((v) => !defined.has(v)).map((v) => `${rel(f)}: ${v}`),
    );
    expect(missing).toEqual([]);
  });

  it('stays flat: no shadows or gradients', () => {
    const bad = css.filter((f) => /box-shadow|text-shadow|gradient\(/.test(read(f))).map(rel);
    expect(bad).toEqual([]);
  });

  it('scopes every stylesheet to its root class', () => {
    const bad: string[] = [];
    for (const f of css.filter((x) => x !== TOKENS && x !== BASE)) {
      // Foo.css / NoteView.css -> .foo / .note-view, and Foo.tsx must use it.
      const name = f.split('/').pop()!.replace(/\.css$/, '');
      const root = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      if (!readFileSync(f.replace(/\.css$/, '.tsx'), 'utf8').includes(root)) bad.push(`${rel(f)}: .${root} unused`);
      const selectors = read(f)
        .replace(/@media[^{]+\{/g, '')
        .split('}')
        .map((block) => block.split('{')[0].trim())
        .filter((s) => s && !s.startsWith('@'))
        .flatMap((s) => s.split(',').map((x) => x.trim()));
      for (const s of selectors) if (!new RegExp(`^\\.${root}(?![a-z])`).test(s)) bad.push(`${rel(f)}: ${s} (root .${root})`);
    }
    expect(bad).toEqual([]);
  });

  it('keeps inline styles out of components (the CSP blocks them)', () => {
    expect(tsx.filter((f) => /style=\{/.test(readFileSync(f, 'utf8'))).map(rel)).toEqual([]);
  });

  it('has at most one primary button per page', () => {
    const bad = tsx
      .filter((f) => f.includes('/pages/'))
      .map((f) => [rel(f), (readFileSync(f, 'utf8').match(/btn--primary/g) ?? []).length] as const)
      .filter(([f, n]) => n > 1 && !ALLOWED_TWO.has(f));
    expect(bad).toEqual([]);
  });

  it('uses no emoji', () => {
    const bad = [...tsx, join(SRC, 'content.ts')].filter((f) => /\p{Extended_Pictographic}/u.test(readFileSync(f, 'utf8')));
    expect(bad.map(rel)).toEqual([]);
  });
});

// Pages that show one of two primaries depending on mode (never both at once).
const ALLOWED_TWO = new Set(['pages/Domain.tsx']);
