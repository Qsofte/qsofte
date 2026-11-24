import { Link } from 'react-router-dom';
import { company, services } from '../content';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div>
            <div className="site-footer__brand">{company.name}</div>
            <p>{company.tagline}, based in Porirua, New Zealand.</p>
            <p>
              <a href={`mailto:${company.email}`}>{company.email}</a>
              <br />
              <a href={company.phoneHref}>{company.phone}</a>
            </p>
          </div>
          <div>
            <h3>Services</h3>
            <ul>
              {services.map((s) => (
                <li key={s.slug}>
                  <Link to={`/services#${s.slug}`}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Company</h3>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/services">Services</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="site-footer__bottom">
          &copy; {new Date().getFullYear()} {company.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
