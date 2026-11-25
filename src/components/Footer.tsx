import { Link } from 'react-router-dom';
import { company, domains, footer, nav, products, services } from '../content';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div>
            <p className="site-footer__brand">{company.name}</p>
            <p>{footer.blurb}</p>
            <p>
              <a href={`mailto:${company.email}`}>{company.email}</a>
              <br />
              <a href={company.phoneHref}>{company.phone}</a>
            </p>
          </div>
          <div>
            <h2>{footer.productHeading}</h2>
            <ul>
              {products.map((p) => (
                <li key={p.slug}>
                  <Link to={`/products#${p.slug}`}>{p.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{footer.servicesHeading}</h2>
            <ul>
              {services.map((s) => (
                <li key={s.slug}>
                  <Link to={`/services#${s.slug}`}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{footer.industriesHeading}</h2>
            <ul>
              {domains.map((d) => (
                <li key={d.slug}>
                  <Link to={`/industries#${d.slug}`}>{d.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{footer.companyHeading}</h2>
            <ul>
              {nav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="site-footer__legal">
          &copy; {new Date().getFullYear()} {company.name}. {footer.rights}
        </p>
      </div>
    </footer>
  );
}
