import { Link } from 'react-router-dom';
import ProductMark from '../components/ProductMark';
import StatusTag from '../components/StatusTag';
import { samewe } from '../content';
import { usePageMeta } from '../usePageMeta';
import './Samewe.css';

export default function Samewe() {
  usePageMeta('/samewe');
  return (
    <div className="samewe">
      <section className="samewe__hero">
        <div className="container">
          <div className="samewe__brand">
            <span className="eyebrow">{samewe.byline}</span>
            <StatusTag status={samewe.status} />
          </div>
          <h1>
            <ProductMark name={samewe.title} size="lg" />
          </h1>
          <p className="samewe__tagline">{samewe.tagline}</p>
          <p className="lead">{samewe.lead}</p>
        </div>
      </section>

      <section className="section samewe__audience" aria-labelledby="samewe-audience">
        <div className="container">
          <h2 id="samewe-audience" className="headline">
            {samewe.audienceTitle}
          </h2>
          <div className="samewe__columns">
            {samewe.audience.map((a) => (
              <div key={a.title}>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="samewe-status">
        <div className="container samewe__split">
          <div>
            <h2 id="samewe-status" className="headline">
              {samewe.statusTitle}
            </h2>
            <p className="lead">{samewe.statusLead}</p>
          </div>
          <div>
            <ul className="samewe__modules">
              {samewe.modules.map((m) => (
                <li key={m.name}>
                  <span>{m.name}</span>
                  <StatusTag status={m.status} />
                </li>
              ))}
            </ul>
            <p className="samewe__note">{samewe.statusNote}</p>
          </div>
        </div>
      </section>

      <section className="section samewe__interest" aria-labelledby="samewe-interest">
        <div className="container">
          <h2 id="samewe-interest" className="headline">
            {samewe.interestTitle}
          </h2>
          <p className="lead">{samewe.interestText}</p>
          <Link to="/contact?topic=samewe" className="btn btn--primary">
            {samewe.interestAction}
          </Link>
        </div>
      </section>
    </div>
  );
}
