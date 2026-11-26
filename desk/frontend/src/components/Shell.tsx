import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import type { User } from '../api';
import { useAuth } from '../auth';
import { brand, copy, nav } from '../content';
import './Shell.css';

export default function Shell({ user, children }: { user: User; children: ReactNode }) {
  const { signOut } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const box = useRef<HTMLInputElement>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // "/" jumps to search from anywhere except a text field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) && !el.isContentEditable) {
        e.preventDefault();
        box.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function search(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
    box.current?.blur();
  }

  return (
    <div className="shell">
      <a className="shell__skip" href="#main">
        {copy.shell.skip}
      </a>
      <header className="shell__header">
        <div className="container shell__bar">
          <Link to="/" className="shell__brand">
            <span className="shell__mark" aria-hidden="true" />
            <span>
              {brand.name} <span className="shell__by">{brand.by}</span>
            </span>
          </Link>
          <div className="shell__user">
            <Link to="/account" className="shell__account" title={user.email}>
              {copy.shell.account}
            </Link>
            <button type="button" className="shell__signout" onClick={signOut}>
              {copy.shell.signOut}
            </button>
          </div>
        </div>
        <div className="container shell__row">
          <nav className="shell__nav" aria-label="Desk">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <form className="shell__search" role="search" onSubmit={search}>
            <label htmlFor="shell-q" className="shell__sr">
              {copy.search.label}
            </label>
            <input
              id="shell-q"
              ref={box}
              className="input shell__input"
              type="search"
              placeholder={copy.search.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
        </div>
      </header>
      <main id="main" className="container">
        {children}
      </main>
    </div>
  );
}
