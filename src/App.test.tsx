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
      'AI-native product development',
      'Technology consultancy',
      'Point of sale',
      'Web and app development',
      'OpenEMR for healthcare',
      'Quality engineering',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name: title })).toBeTruthy();
    }
  });

  it('srovi page tells the first-mile story and asks for a diagnostic', () => {
    renderAt('/srovi');
    expect(screen.getByRole('heading', { level: 1, name: 'Trust at the first mile.' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Book a diagnostic' })).toBeTruthy();
  });

  it('industries page lists banking and every speciality', () => {
    renderAt('/industries');
    for (const title of ['Banking', 'Payments & Cards', 'Public Sector', 'AgriTech', 'Legal']) {
      expect(screen.getByRole('heading', { level: 2, name: title })).toBeTruthy();
    }
  });

  it('home explains AI-native delivery with Srovi as the example', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 2, name: 'AI-native, from the first line.' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Srovi is built this way.' })).toBeTruthy();
  });

  it('home does not lead with a location', () => {
    renderAt('/');
    expect(document.querySelector('.home__hero')?.textContent).not.toMatch(/Porirua/);
  });

  it('home shows both arms and the Chilli Masala POS work', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 3, name: 'Srovi' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Point of sale for a large restaurant chain' })).toBeTruthy();
  });

  it('old /Connect link lands on the contact form', () => {
    renderAt('/Connect');
    expect(screen.getByRole('form', { name: 'Contact form' })).toBeTruthy();
  });

  it('unknown pages show a 404', () => {
    renderAt('/nope');
    expect(screen.getByText(/doesn.t exist/)).toBeTruthy();
  });
});
