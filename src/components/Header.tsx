import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/qsofte-logo.webp';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__logo" aria-label="Qsofte home">
          <img src={logo} alt="Qsofte" width={177} height={34} />
        </Link>
        <button
          className="menu-toggle"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav id="site-nav" className={`site-nav${open ? ' is-open' : ''}`} aria-label="Main">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <Link to="/contact" className="btn btn--dark">
            Let&rsquo;s talk
          </Link>
        </nav>
      </div>
    </header>
  );
}
