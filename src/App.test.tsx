import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { pages } from './content';

// jsdom has no scrolling
window.scrollTo = () => {};

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe('brand architecture', () => {
  it('main navigation is Products, Engineering, About, Contact', () => {
    renderAt('/');
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getAllByRole('link').map((l) => l.textContent)).toEqual([
      'Products',
      'Engineering',
      'About',
      'Contact',
    ]);
  });

  it('home leads with both lines of business and both products', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1, name: 'Products that solve. Expertise that delivers.' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Srovi' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Samewe' })).toBeTruthy();
    expect(document.querySelector('.home__hero .lead')).toBeNull();
  });

  it('every page names the products Srovi and Samewe, never the internal name RAM', () => {
    for (const path of Object.keys(pages)) {
      const { container, unmount } = renderAt(path === '/404' ? '/missing' : path);
      expect(container.textContent).not.toMatch(/\bRAM\b/);
      unmount();
    }
  });

  it('about page sets out the four brands', () => {
    renderAt('/about');
    for (const name of ['Qsofte', 'Srovi', 'Samewe', 'Qsofte Engineering']) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
  });
});

describe('products are presented accurately', () => {
  it('products page lists Srovi (in use) and Samewe (in development)', () => {
    renderAt('/products');
    const srovi = screen.getByRole('heading', { level: 2, name: 'Srovi' }).closest('article')!;
    const samewe = screen.getByRole('heading', { level: 2, name: 'Samewe' }).closest('article')!;
    expect(within(srovi as HTMLElement).getByText('In use')).toBeTruthy();
    expect(within(samewe as HTMLElement).getByText('In development')).toBeTruthy();
    expect(screen.getByAltText('Srovi')).toBeTruthy();
  });

  it('samewe page shows module status and offers interest, not availability', () => {
    renderAt('/samewe');
    expect(screen.getByText('Sign-in, roles and permissions')).toBeTruthy();
    expect(screen.getAllByText('Planned').length).toBeGreaterThan(0);
    const link = screen.getByRole('link', { name: 'Register interest' });
    expect(link.getAttribute('href')).toBe('/contact?topic=samewe');
    expect(document.body.textContent).not.toMatch(/request a demo|available now|sign up/i);
  });

  it('srovi page tells the first-mile story and asks for a diagnostic', () => {
    renderAt('/srovi');
    expect(screen.getByRole('heading', { level: 1, name: 'Trust at the first mile.' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Book a diagnostic' })).toBeTruthy();
    expect(screen.getByText('In use')).toBeTruthy();
  });
});

describe('Qsofte Engineering', () => {
  it('lists its capabilities with payments first', () => {
    renderAt('/engineering');
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles.slice(0, 5)).toEqual([
      'Payments and cards',
      'Agentic contact centre as a service',
      'AI-native product engineering',
      'Point of sale',
      'Software testing',
    ]);
  });

  it('old /services and /industries links land on Engineering', () => {
    for (const path of ['/services', '/industries']) {
      const { unmount } = renderAt(path);
      expect(screen.getByRole('heading', { level: 1, name: 'Qsofte Engineering' })).toBeTruthy();
      unmount();
    }
  });
});

describe('contact', () => {
  it('home shows every client logo', () => {
    renderAt('/');
    for (const name of ['Westpac', 'Chilli Masala', 'Adyopant Legal', 'Atmabodh']) {
      expect(screen.getByAltText(name)).toBeTruthy();
    }
  });

  it('old /Connect link lands on the contact form', () => {
    renderAt('/Connect');
    expect(screen.getByRole('form', { name: 'Contact form' })).toBeTruthy();
  });

  it('?topic=samewe preselects Samewe', () => {
    renderAt('/contact?topic=samewe');
    expect((screen.getByLabelText('What is it about?') as HTMLSelectElement).value).toBe('samewe');
  });

  it('has a spam trap that people and keyboards never reach, and links the privacy notice', () => {
    renderAt('/contact');
    const trap = document.querySelector('input[name="_gotcha"]') as HTMLInputElement;
    expect(trap.tabIndex).toBe(-1);
    expect(trap.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByRole('link', { name: 'How we handle your information' }).getAttribute('href')).toBe('/privacy');
  });

  it('privacy notice says what is collected and that nothing is tracked', () => {
    renderAt('/privacy');
    expect(screen.getByRole('heading', { level: 2, name: 'What we collect' })).toBeTruthy();
    expect(screen.getByText(/does not use cookies, analytics or advertising trackers/)).toBeTruthy();
  });

  it('unknown pages show a 404', () => {
    renderAt('/nope');
    expect(screen.getByText(/doesn.t exist/)).toBeTruthy();
  });
});
