import { Link } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import Clients from '../components/Clients';
import Icon from '../components/Icon';
import ProductMark from '../components/ProductMark';
import StatusTag from '../components/StatusTag';
import { aiPrinciples, arms, capabilities, hero, home, products } from '../content';
import { usePageMeta } from '../usePageMeta';
import './Home.css';

export default function Home() {
  usePageMeta('/');
  return (
    <div className="home">
      <section className="home__hero">
        <div className="container">
          <h1 className="visually-hidden">{hero.title}</h1>
          <div className="home__split">
            {arms.map((a) => (
              <div key={a.to} className="home__half">
                <span className="eyebrow">{a.eyebrow}</span>
                <p className="display" aria-hidden="true">
                  {a.title}
                </p>
                <p className="home__tagline">{a.tagline}</p>
                <Link to={a.to} className="link-more">
                  {a.action}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Clients />

      <section className="section" aria-labelledby="products-heading">
        <div className="container">
          <header className="home__head">
            <span className="eyebrow">{home.productsEyebrow}</span>
            <h2 id="products-heading" className="headline">
              {home.productsTitle}
            </h2>
          </header>
          <div className="home__products">
            {products.map((p) => (
              <article key={p.slug} className="home__product">
                <div className="home__product-top">
                  <h3>
                    <ProductMark name={p.name} logo={p.logo} />
                  </h3>
                  <StatusTag status={p.status} />
                </div>
                <span className="eyebrow">{p.sector}</span>
                <p className="home__product-tagline">{p.tagline}</p>
                <p>{p.problem}</p>
                <Link to={p.to} className="link-more">
                  {p.action}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section home__engineering" aria-labelledby="engineering-heading">
        <div className="container">
          <header className="home__head">
            <span className="eyebrow">{home.engineeringEyebrow}</span>
            <h2 id="engineering-heading" className="headline">
              {home.engineeringTitle}
            </h2>
          </header>
          <ul className="home__capabilities">
            {capabilities.map((c) => (
              <li key={c.slug}>
                <Icon name={c.icon} />
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/engineering" className="link-more">
            {home.engineeringMore}
          </Link>
        </div>
      </section>

      <section className="section" aria-labelledby="approach-heading">
        <div className="container">
          <header className="home__head">
            <span className="eyebrow">{home.approachEyebrow}</span>
            <h2 id="approach-heading" className="headline">
              {home.approachTitle}
            </h2>
            <p className="lead">{home.approachLead}</p>
          </header>
          <ol className="home__principles">
            {aiPrinciples.map((p) => (
              <li key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
          <Link to="/about" className="link-more">
            {home.approachMore}
          </Link>
        </div>
      </section>

      <CallToAction />
    </div>
  );
}
