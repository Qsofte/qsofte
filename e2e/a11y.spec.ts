import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { routes } from './routes';

// Automated checks catch a subset of WCAG issues; they do not prove conformance.
// See docs/assessment/README.md for what was and was not tested by hand.
for (const route of [...routes, '/not-a-page']) {
  test(`no WCAG 2.2 AA violations axe can detect on ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}

test('keyboard: the skip link is the first stop and moves focus to the content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});
