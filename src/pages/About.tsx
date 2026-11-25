import { Link } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import { about, aiPrinciples, values } from '../content';
import { usePageMeta } from '../usePageMeta';
import './About.css';

export default function About() {
  usePageMeta('/about');
  return (
    <div className="about">
      <section className="about__hero">
        <div className="container">
          <h1 className="display">{about.title}</h1>
          <p className="lead">{about.lead}</p>
        </div>
      </section>

      <section className="section about__brands" aria-labelledby="brands-heading">
        <div className="container">
          <h2 id="brands-heading" className="headline">
            {about.brandsTitle}
          </h2>
          <dl>
            {about.brands.map((b) => (
              <div key={b.name}>
                <dt>
                  {b.to ? <Link to={b.to}>{b.name}</Link> : b.name}
                  <span>{b.role}</span>
                </dt>
                <dd>{b.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section about__approach" aria-labelledby="approach-heading">
        <div className="container">
          <h2 id="approach-heading" className="headline">
            {about.approachTitle}
          </h2>
          <ol className="about__list">
            {aiPrinciples.map((p) => (
              <li key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="values-heading">
        <div className="container">
          <h2 id="values-heading" className="headline">
            {about.valuesTitle}
          </h2>
          <ul className="about__list about__list--plain">
            {values.map((v) => (
              <li key={v.title}>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </li>
            ))}
          </ul>
          <h2 className="about__where">{about.whereTitle}</h2>
          <p className="lead">{about.whereText}</p>
        </div>
      </section>

      <CallToAction />
    </div>
  );
}
