/**
 * Measures the rendered pages against the design guardrails (docs/design.md),
 * the way a visitor's browser sees them. Runs on desktop and on a phone.
 *
 *   - nothing scrolls sideways
 *   - tap targets are at least 44px tall on a touch screen
 *   - inputs are at least 16px (smaller makes iOS Safari zoom the page)
 *   - at most one primary button is visible per view
 *   - every colour on screen is a token from tokens.css
 *   - every image has loaded and has alt text
 */
import { expect, test } from '@playwright/test';
import { routes as pages } from './routes';

const routes = [...pages, '/not-a-page'];

for (const route of routes) {
  test(`guardrails hold on ${route}`, async ({ page }) => {
    // Console errors include Content-Security-Policy violations when served by nginx.
    const consoleErrors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
    page.on('pageerror', (e) => consoleErrors.push(e.message));
    await page.goto(route, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      // Load lazy images: scroll through the page, then back to the top.
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle');

    const findings = await page.evaluate(() => {
      const out: string[] = [];
      const coarse = matchMedia('(pointer: coarse)').matches;
      const doc = document.documentElement;

      if (doc.scrollWidth > doc.clientWidth) out.push(`horizontal scroll: ${doc.scrollWidth}px wide`);

      // Every colour a token can resolve to.
      const probe = document.createElement('div');
      document.body.appendChild(probe);
      const palette = new Set<string>();
      for (const sheet of Array.from(document.styleSheets)) {
        for (const rule of Array.from(sheet.cssRules)) {
          if (!(rule instanceof CSSStyleRule) || rule.selectorText !== ':root') continue;
          for (const prop of Array.from(rule.style)) {
            if (!prop.startsWith('--')) continue;
            probe.style.color = '';
            probe.style.color = `var(${prop})`;
            palette.add(getComputedStyle(probe).color);
          }
        }
      }
      probe.remove();
      const transparent = (c: string) => c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
      const label = (el: Element) =>
        `${el.tagName.toLowerCase()}${typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : ''}`;

      let primaries = 0;
      for (const el of Array.from(document.querySelectorAll<HTMLElement>('body *'))) {
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') continue;

        if (el.matches('.btn--primary')) primaries++;

        if (coarse && el.matches('a[href], button, input:not([type=hidden]), select, textarea') && rect.height < 43.5) {
          out.push(`tap target ${Math.round(rect.height)}px: ${label(el)} "${(el.textContent || '').trim().slice(0, 30)}"`);
        }
        if (el.matches('input, select, textarea') && parseFloat(cs.fontSize) < 16) {
          out.push(`input font ${cs.fontSize}: ${label(el)}`);
        }
        for (const [prop, value] of [
          ['color', cs.color],
          ['background', cs.backgroundColor],
          ['border', cs.borderTopWidth !== '0px' ? cs.borderTopColor : ''],
        ]) {
          if (value && !transparent(value) && !palette.has(value)) {
            out.push(`off-palette ${prop} ${value}: ${label(el)}`);
          }
        }
        if (el instanceof HTMLImageElement) {
          if (!el.complete || !el.naturalWidth) out.push(`image did not load: ${el.src}`);
          if (!el.hasAttribute('alt')) out.push(`image without alt: ${el.src}`);
        }
      }
      if (primaries > 1) out.push(`${primaries} primary buttons in one view (max 1)`);
      return [...new Set(out)];
    });

    expect(findings, 'See docs/design.md and .claude/skills/ui-change').toEqual([]);
    // A missing page returns 404 from nginx, which the browser logs; that is expected.
    expect(consoleErrors.filter((e) => !/status of 404/.test(e)), 'console errors').toEqual([]);
  });
}
