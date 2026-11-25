import { expect, test } from '@playwright/test';
import { routes } from './routes';

const site = 'https://qsofte.com';

// What a crawler or link preview sees: the raw HTML, without running JavaScript.
test.describe('prerendered HTML', () => {
  test('every page has its own title, description, canonical, Open Graph data and h1', async ({ request }) => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const path of routes) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      const html = await res.text();
      const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? '';
      const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? '';
      expect(title, path).not.toBe('');
      expect(description.length, path).toBeGreaterThan(50);
      titles.add(title);
      descriptions.add(description);
      expect(html, path).toContain(`<link rel="canonical" href="${site}${path === '/' ? '/' : path}" />`);
      expect(html, path).toContain(`<meta property="og:url" content="${site}${path === '/' ? '/' : path}" />`);
      expect((html.match(/<h1[\s>]/g) ?? []).length, `${path} has exactly one h1`).toBe(1);
    }
    expect(titles.size).toBe(routes.length);
    expect(descriptions.size).toBe(routes.length);
  });

  test('the sitemap lists every page and nothing else', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.sort()).toEqual(routes.map((r) => `${site}${r === '/' ? '/' : r}`).sort());
  });

  test('structured data: Organization on home, SoftwareApplication on Srovi, none on unreleased Samewe', async ({ request }) => {
    const ld = async (path: string) => {
      const m = (await (await request.get(path)).text()).match(/<script type="application\/ld\+json">([^<]+)<\/script>/);
      return m ? JSON.parse(m[1]) : null;
    };
    expect((await ld('/'))?.['@type']).toBe('Organization');
    expect((await ld('/srovi'))?.['@type']).toBe('SoftwareApplication');
    expect(await ld('/samewe')).toBeNull();
  });

  test('robots.txt allows crawling and points at the sitemap', async ({ request }) => {
    const txt = await (await request.get('/robots.txt')).text();
    expect(txt).toContain('Allow: /');
    expect(txt).toContain(`Sitemap: ${site}/sitemap.xml`);
  });
});
