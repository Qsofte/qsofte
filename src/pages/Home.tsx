import { Link } from 'react-router-dom';
import Clients from '../components/Clients';
import CallToAction from '../components/CallToAction';
import { hero, process, services, values } from '../content';
import { usePageTitle } from '../usePageTitle';

export default function Home() {
  usePageTitle();
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="eyebrow">{hero.eyebrow}</span>
          <h1>{hero.title}</h1>
          <p className="hero__lead">{hero.lead}</p>
          <div className="hero__actions">
            <Link to="/contact" className="btn btn--primary">
              Start a conversation
            </Link>
            <Link to="/services" className="btn btn--ghost">
              Explore services
            </Link>
          </div>
        </div>
      </section>

      <Clients />

      <section className="section" aria-labelledby="services-heading">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">What we do</span>
            <h2 id="services-heading">End-to-end technology, under one roof</h2>
            <p>
              From advice to delivery to support, we cover the whole lifecycle so you have one
              partner accountable for the result.
            </p>
          </div>
          <div className="card-grid">
            {services.map((s) => (
              <Link key={s.slug} to={`/services#${s.slug}`} className="service-card">
                <div className="service-card__media">
                  <img src={s.image} alt="" loading="lazy" />
                </div>
                <div className="service-card__body">
                  <h3>{s.title}</h3>
                  <p>{s.summary}</p>
                  <span className="service-card__more">Learn more &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="why-heading">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Why Qsofte</span>
            <h2 id="why-heading">A partner, not just a supplier</h2>
          </div>
          <div className="values">
            {values.map((v) => (
              <div key={v.title} className="value">
                <div className="value__mark" />
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="process-heading">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How we work</span>
            <h2 id="process-heading">Simple, transparent delivery</h2>
          </div>
          <ol className="steps">
            {process.map((p) => (
              <li key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CallToAction />
    </>
  );
}
