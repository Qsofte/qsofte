import { expect, test } from '@playwright/test';

const pages = ['/', '/products', '/srovi', '/services', '/industries', '/contact'];

for (const path of pages) {
  test(`${path} renders without horizontal scroll`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('main h1')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('home shows client logos', async ({ page }) => {
  await page.goto('/');
  for (const name of ['Westpac', 'Chilli Masala', 'Adyopant Legal', 'Atmabodh']) {
    await expect(page.getByAltText(name)).toBeVisible();
  }
});

test('navigation reaches contact form', async ({ page, isMobile }) => {
  await page.goto('/');
  if (isMobile) await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Contact' }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByLabel('Email')).toBeVisible();
});

test('deep link to a route is served (SPA fallback)', async ({ page }) => {
  const res = await page.goto('/services');
  expect(res?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'OpenEMR for healthcare' })).toBeVisible();
});
