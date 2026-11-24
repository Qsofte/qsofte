import { Link } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import Clients from '../components/Clients';
import Icon from '../components/Icon';
import { hero, home, process, services, values } from '../content';
import { usePageTitle } from '../usePageTitle';
import './Home.css';

export default function Home() {
  usePageTitle();
  return (
    <div className="home">
      <section className="home__hero">
        <div className="container">
          <span className="eyebrow">{hero.eyebrow}</span>
          <h1 className="display">{hero.title}</h1>
          <p className="lead">{hero.lead}</p>
          <div className="home__actions">
            <Link to="/contact" className="btn btn--secondary">
              {hero.primary}
            </Link>
            <Link to="/services" className="link-more">
              {hero.secondary}
            </Link>
          </div>
        </div>
      </section>

      <Clients />

      <section className="section" aria-labelledby="services-heading">
        <div className="container">
          <header className="home__head">
            <span className="eyebrow">{home.servicesEyebrow}</span>
            <h2 id="services-heading" className="headline">
              {home.servicesTitle}
            </h2>
          </header>
          <div className="home__tiles">
            {services.map((s) => (
              <Link key={s.slug} to={`/services#${s.slug}`} className="home__tile">
                <Icon name={s.icon} />
                <h3>{s.title}</h3>
                <p>{s.summary}</p>
                <span className="link-more">{home.more}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section home__values" aria-labelledby="values-heading">
        <div className="container">
          <header className="home__head">
            <span className="eyebrow">{home.valuesEyebrow}</span>
            <h2 id="values-heading" className="headline">
              {home.valuesTitle}
            </h2>
          </header>
          <div className="home__columns">
            {values.map((v) => (
              <div key={v.title}>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="process-heading">
        <div className="container">
          <header className="home__head">
            <span className="eyebrow">{home.processEyebrow}</span>
            <h2 id="process-heading" className="headline">
              {home.processTitle}
            </h2>
          </header>
          <ol className="home__steps">
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
    </div>
  );
}
