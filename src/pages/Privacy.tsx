import { company, privacy } from '../content';
import { usePageMeta } from '../usePageMeta';
import './Privacy.css';

export default function Privacy() {
  usePageMeta('/privacy');
  return (
    <div className="privacy">
      <div className="container">
        <h1 className="headline">{privacy.title}</h1>
        <p className="privacy__updated">{privacy.updated}</p>
        {privacy.sections.map((s) => {
          const id = `privacy-${s.heading.toLowerCase().replace(/[^a-z]+/g, '-')}`;
          return (
            <section key={s.heading} aria-labelledby={id}>
              <h2 id={id}>{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          );
        })}
        <p className="privacy__contact">
          {privacy.contactLabel} <a href={`mailto:${company.email}`}>{company.email}</a>
        </p>
      </div>
    </div>
  );
}
