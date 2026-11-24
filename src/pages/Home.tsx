import { Link } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import Clients from '../components/Clients';
import Icon from '../components/Icon';
import { arms, domains, hero, home, values, work } from '../content';
import { usePageTitle } from '../usePageTitle';
import './Home.css';

export default function Home() {
  usePageTitle();
  const [key, ...specialities] = domains;
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

      <section className="section" aria-labelledby="arms-heading">
        <div className="container">
          <header className="home__head">
            <span className="eyebrow">{home.armsEyebrow}</span>
            <h2 id="arms-heading" className="headline">
              {home.armsTitle}
            </h2>
          </header>
          <div className="home__arms">
            {arms.map((a) => (
              <Link key={a.to} to={a.to} className="home__arm">
                <span className="eyebrow">{a.eyebrow}</span>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
                <span className="link-more">{a.action}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section home__domains" aria-labelledby="domains-heading">
        <div className="container">
          <header className="home__head">
            <span className="eyebrow">{home.domainsEyebrow}</span>
            <h2 id="domains-heading" className="headline">
              {home.domainsTitle}
            </h2>
          </header>
          <Link to={`/industries#${key.slug}`} className="home__key">
            <Icon name={key.icon} size={36} />
            <div>
              <h3>{key.title}</h3>
              <p>{key.summary}</p>
            </div>
          </Link>
          <ul className="home__specialities">
            {specialities.map((d) => (
              <li key={d.slug}>
                <Link to={`/industries#${d.slug}`}>
                  <Icon name={d.icon} />
                  <span>{d.title}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/industries" className="link-more">
            {home.domainsMore}
          </Link>
        </div>
      </section>

      <section className="section" aria-labelledby="work-heading">
        <div className="container">
          <header className="home__head">
            <span className="eyebrow">{home.workEyebrow}</span>
            <h2 id="work-heading" className="headline">
              {home.workTitle}
            </h2>
          </header>
          <div className="home__work">
            {work.map((w) => (
              <article key={w.client} className="home__case">
                <span className="eyebrow">{w.client}</span>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
                <ul>
                  {w.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <Link to={w.to} className="link-more">
                  {w.action}
                </Link>
              </article>
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

      <CallToAction />
    </div>
  );
}
