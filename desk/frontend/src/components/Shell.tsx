import { useEffect, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import type { User } from '../api';
import { useAuth } from '../auth';
import { brand, copy, nav } from '../content';
import './Shell.css';

export default function Shell({ user, children }: { user: User; children: ReactNode }) {
  const { signOut } = useAuth();
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
        <nav className="container shell__nav" aria-label="Desk">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="main" className="container">
        {children}
      </main>
    </div>
  );
}
