import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/qsofte-logo.webp';
import { nav } from '../content';
import './Header.css';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__logo" aria-label="Qsofte home">
          <img src={logo} alt="Qsofte" width={146} height={28} />
        </Link>
        <button
          className="site-header__toggle"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
        <nav
          id="site-nav"
          className={`site-header__nav${open ? ' site-header__nav--open' : ''}`}
          aria-label="Main"
        >
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
