import CallToAction from '../components/CallToAction';
import Icon from '../components/Icon';
import { domains, industriesPage as copy } from '../content';
import { usePageTitle } from '../usePageTitle';
import './Industries.css';

export default function Industries() {
  usePageTitle(copy.title);
  return (
    <div className="industries">
      <section className="industries__hero">
        <div className="container">
          <h1 className="display">{copy.title}</h1>
          <p className="lead">{copy.lead}</p>
        </div>
      </section>

      <section className="industries__list">
        <div className="container">
          {domains.map((d, i) => (
            <article key={d.slug} id={d.slug} className="industries__item">
              <div className="industries__title">
                <Icon name={d.icon} size={32} />
                <span className="eyebrow">{i === 0 ? copy.keyLabel : copy.specialityLabel}</span>
                <h2>{d.title}</h2>
                {d.proof && <p className="industries__proof">{d.proof}</p>}
              </div>
              <div>
                <p className="industries__summary">{d.summary}</p>
                <ul>
                  {d.points.map((p) => (
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
