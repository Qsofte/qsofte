import { expect, test } from '@playwright/test';
import { routes } from './routes';

for (const path of routes) {
  test(`${path} renders without horizontal scroll`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('main h1')).toBeAttached();
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

test('navigation reaches every top-level page', async ({ page }) => {
  for (const [label, url] of [
    ['Products', /\/products$/],
    ['Engineering', /\/engineering$/],
    ['About', /\/about$/],
    ['Contact', /\/contact$/],
  ] as const) {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Menu' });
    if (await toggle.isVisible()) await toggle.click();
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: label }).click();
    await expect(page).toHaveURL(url);
  }
});

test('product journey: home → Samewe → register interest preselects Samewe', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Discover Samewe' }).click();
  await expect(page).toHaveURL(/\/samewe$/);
  await page.getByRole('link', { name: 'Register interest' }).click();
  await expect(page).toHaveURL(/\/contact\?topic=samewe$/);
  await expect(page.getByLabel('What is it about?')).toHaveValue('samewe');
});

test('contact form: required fields are enforced before anything is sent', async ({ page }) => {
  let posted = false;
  await page.route('https://formspree.io/**', (route) => {
    posted = true;
    return route.abort();
  });
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Send message' }).click();
  expect(posted).toBe(false);
  expect(await page.getByLabel('Name').evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
});

test('contact form: success and failure are both reported honestly', async ({ page }) => {
  for (const [status, expected] of [
    [200, 'Thank you.'],
    [500, 'Something went wrong and your message was not sent.'],
  ] as const) {
    await page.route('https://formspree.io/**', (route) => route.fulfill({ status, body: '{}' }));
    await page.goto('/contact');
    await page.getByLabel('Name').fill('Test');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('How can we help?').fill('Hello');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByText(expected)).toBeVisible();
    await page.unroute('https://formspree.io/**');
  }
});

test('every internal link points at a page that exists', async ({ page, request }) => {
  const seen = new Set<string>();
  for (const path of routes) {
    await page.goto(path);
    for (const href of await page.$$eval('a[href^="/"]', (as) => as.map((a) => a.getAttribute('href')!))) {
      seen.add(href.split('#')[0].split('?')[0]);
    }
  }
  for (const href of seen) {
    const res = await request.get(href);
    expect(res.status(), href).toBe(200);
  }
});
