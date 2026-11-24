import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { srovi } from '../content';
import { usePageTitle } from '../usePageTitle';
import './Srovi.css';

export default function Srovi() {
  usePageTitle('Srovi');
  return (
    <div className="srovi">
      <section className="srovi__hero">
        <div className="container">
          <span className="eyebrow">{srovi.eyebrow}</span>
          <h1 className="display">{srovi.title}</h1>
          <p className="srovi__tagline">{srovi.tagline}</p>
          <p className="lead">{srovi.lead}</p>
          <p className="srovi__clients">
            <span className="eyebrow">{srovi.clientsLabel}</span>
            {srovi.clients.join(' · ')}
          </p>
        </div>
      </section>

      <section className="section srovi__problem" aria-labelledby="srovi-problem">
        <div className="container">
          <h2 id="srovi-problem" className="headline">
            {srovi.problemTitle}
          </h2>
          <div className="srovi__problems">
            {srovi.problems.map((p) => (
              <div key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="srovi-journey">
        <div className="container srovi__split">
          <div>
            <h2 id="srovi-journey" className="headline">
              {srovi.journeyTitle}
            </h2>
            <ol className="srovi__journey">
              {srovi.journey.map((j) => (
                <li key={j.title}>
                  <Icon name={j.icon} />
                  <div>
                    <h3>{j.title}</h3>
                    <p>{j.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="srovi__principles">{srovi.principles.join(' · ')}</p>
          </div>

          <figure className="srovi__passport" aria-label={srovi.passport.caption}>
            <div className="srovi__passport-head">
              <span className="eyebrow">{srovi.passport.label}</span>
              <Icon name="qr" size={32} />
            </div>
            <dl>
              {srovi.passport.rows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <p className="srovi__badge">
              <Icon name="check" size={20} />
              {srovi.passport.badge}
            </p>
            <figcaption>{srovi.passport.caption}</figcaption>
          </figure>
        </div>
      </section>

      <section className="section srovi__value" aria-labelledby="srovi-value">
        <div className="container">
          <h2 id="srovi-value" className="headline">
            {srovi.valueTitle}
          </h2>
          <div className="srovi__pools">
            {srovi.value.map((v) => (
              <div key={v.pool} className="srovi__pool">
                <h3>{v.pool}</h3>
                {v.items.map(([outcome, when]) => (
                  <p key={outcome}>
                    {outcome}
                    <span>{when}</span>
                  </p>
                ))}
              </div>
            ))}
          </div>
          <p className="srovi__note">{srovi.valueNote}</p>
        </div>
      </section>

      <section className="section" aria-label={srovi.builtTitle}>
        <div className="container srovi__lists">
          <div>
            <h2>{srovi.builtTitle}</h2>
            <ul>
              {srovi.built.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{srovi.proofTitle}</h2>
            <ul>
              {srovi.proof.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{srovi.useCasesTitle}</h2>
            <ul className="srovi__chips">
              {srovi.useCases.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section srovi__ask" aria-labelledby="srovi-ask">
        <div className="container">
          <span className="eyebrow">{srovi.pathTitle}</span>
          <ol className="srovi__path">
            {srovi.path.map((p) => (
              <li key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.when}</p>
              </li>
            ))}
          </ol>
          <h2 id="srovi-ask" className="headline">
            {srovi.askTitle}
          </h2>
          <p className="lead">{srovi.askText}</p>
          <Link to="/contact" className="btn btn--primary">
            {srovi.askAction}
          </Link>
        </div>
      </section>
    </div>
  );
}
