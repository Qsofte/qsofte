import CallToAction from '../components/CallToAction';
import Icon from '../components/Icon';
import { services, servicesPage } from '../content';
import { usePageTitle } from '../usePageTitle';
import './Services.css';

export default function Services() {
  usePageTitle(servicesPage.title);
  return (
    <div className="services-page">
      <section className="services-page__hero">
        <div className="container">
          <h1 className="display">{servicesPage.title}</h1>
          <p className="lead">{servicesPage.lead}</p>
        </div>
      </section>

      <section className="services-page__list">
        <div className="container">
          {services.map((s) => (
            <article key={s.slug} id={s.slug} className="services-page__item">
              <div className="services-page__title">
                <Icon name={s.icon} size={32} />
                <h2>{s.title}</h2>
              </div>
              <div>
                <p className="services-page__summary">{s.summary}</p>
                <ul>
                  {s.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CallToAction />
    </div>
  );
}
