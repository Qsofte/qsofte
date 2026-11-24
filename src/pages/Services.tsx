import CallToAction from '../components/CallToAction';
import { services } from '../content';
import { usePageTitle } from '../usePageTitle';

export default function Services() {
  usePageTitle('Services');
  return (
    <>
      <section className="hero hero--page">
        <div className="container">
          <span className="eyebrow">Services</span>
          <h1>Everything you need to plan, build and run great software</h1>
          <p className="hero__lead">
            Pick a single service or bring us in end to end. Either way, you get a senior team that
            cares about the outcome.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {services.map((s) => (
            <article key={s.slug} id={s.slug} className="service-detail">
              <div className="service-detail__media">
                <img src={s.image} alt="" loading="lazy" />
              </div>
              <div>
                <h2>{s.title}</h2>
                <p className="service-detail__summary">{s.summary}</p>
                <ul className="checklist">
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
    </>
  );
}
