import CallToAction from '../components/CallToAction';
import Icon from '../components/Icon';
import { capabilities, domains, engineering as copy, process } from '../content';
import { usePageMeta } from '../usePageMeta';
import './Engineering.css';

export default function Engineering() {
  usePageMeta('/engineering');
  return (
    <div className="engineering">
      <section className="engineering__hero">
        <div className="container">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 className="display">{copy.title}</h1>
          <p className="lead">{copy.lead}</p>
        </div>
      </section>

      <section className="engineering__capabilities" aria-labelledby="capabilities-heading">
        <div className="container">
          <h2 id="capabilities-heading" className="visually-hidden">
            {copy.capabilitiesTitle}
          </h2>
          {capabilities.map((c) => (
            <article key={c.slug} id={c.slug} className="engineering__item">
              <Icon name={c.icon} size={32} />
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section engineering__domains" aria-labelledby="domains-heading">
        <div className="container">
          <h2 id="domains-heading" className="headline">
            {copy.domainsTitle}
          </h2>
          <p className="lead">{copy.domainsLead}</p>
          <ul>
            {domains.map((d) => (
              <li key={d.name}>
                <span>{d.name}</span>
                {d.note && <span className="engineering__note">{d.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="process-heading">
        <div className="container">
          <h2 id="process-heading" className="headline">
            {copy.approachTitle}
          </h2>
          <ol className="engineering__steps">
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
