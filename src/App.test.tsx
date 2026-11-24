import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

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

describe('site', () => {
  it('home shows every client logo', () => {
    renderAt('/');
    for (const name of ['Westpac', 'Chilli Masala', 'Adyopant Legal', 'Atmabodh']) {
      expect(screen.getByAltText(name)).toBeTruthy();
    }
  });

  it('services page lists all services', () => {
    renderAt('/services');
    for (const title of [
      'Technology Consultancy',
      'Retail POS Solutions',
      'Website & App Development',
      'OpenEMR Solutions',
      'Software Testing & QA',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name: title })).toBeTruthy();
    }
  });

  it('old /Connect link lands on the contact form', () => {
    renderAt('/Connect');
    expect(screen.getByRole('form', { name: 'Contact form' })).toBeTruthy();
  });

  it('unknown pages show a 404', () => {
    renderAt('/nope');
    expect(screen.getByText(/couldn.t find that page/)).toBeTruthy();
  });
});
