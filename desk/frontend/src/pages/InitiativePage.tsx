import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import FeedList from '../components/FeedList';
import NoteList from '../components/NoteList';
import { copy, guideLevels, initiativeKinds, initiativeStatus, regions } from '../content';
import { useLoad, usePageTitle } from '../useLoad';
import './InitiativePage.css';

export default function InitiativePage() {
  const { slug = '' } = useParams();
  const { data: i, error } = useLoad(() => api.initiative(slug), [slug]);
  const t = copy.initiative;
  usePageTitle(i?.name ?? copy.landscape.title);
  if (error) return <p className="page error">{error}</p>;
  if (!i) return null;

  return (
    <div className="page initiative-page">
      <header className="page-head">
        <Link to={`/landscape?kind=${i.kind}`} className="eyebrow crumb">
          {t.back} / {initiativeKinds[i.kind].label}
        </Link>
        <div className="page-head__row">
          <h1 className="headline">{i.name}</h1>
          <Link to={`/landscape/${i.slug}/edit`} className="btn btn--secondary">
            {t.edit}
          </Link>
        </div>
        <p className="lead">{i.summary}</p>
      </header>

      <dl className="initiative-page__facts">
        <div>
          <dt>{t.status}</dt>
          <dd>
            <span className={`tag${i.status === 'live' ? ' tag--mark' : ''}`}>{initiativeStatus[i.status]}</span>
          </dd>
        </div>
        <div>
          <dt>{t.domain}</dt>
          <dd>
            <Link to={`/domains/${i.domain_slug}`}>
              {i.domain_code} {i.domain_name}
            </Link>
          </dd>
        </div>
        {i.started && (
          <div>
            <dt>{t.started}</dt>
            <dd>{i.started}</dd>
          </div>
        )}
        {i.regions.length > 0 && (
          <div>
            <dt>{t.regions}</dt>
            <dd>{i.regions.map((r) => regions[r]).join(', ')}</dd>
          </div>
        )}
        {i.lead && (
          <div className="initiative-page__wide">
            <dt>{t.lead}</dt>
            <dd>{i.lead}</dd>
          </div>
        )}
        {i.participants && (
          <div className="initiative-page__wide">
            <dt>{t.participants}</dt>
            <dd>{i.participants}</dd>
          </div>
        )}
        {i.url && (
          <div className="initiative-page__wide">
            <dt>{t.link}</dt>
            <dd>
              <a href={i.url} target="_blank" rel="noreferrer" className="initiative-page__link">
                {new URL(i.url).hostname}
              </a>
            </dd>
          </div>
        )}
      </dl>

      {i.guides.length > 0 && (
        <section className="block" aria-labelledby="i-guides">
          <h2 id="i-guides" className="title">
            {t.guides}
          </h2>
          <ul className="initiative-page__guides">
            {i.guides.map((g) => (
              <li key={g.slug}>
                <Link to={`/library/${g.slug}`} className="initiative-page__guide">
                  <span className="mono">{guideLevels[g.level]}</span>
                  <strong>{g.title}</strong>
                  <span className="muted small">{g.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="block" aria-labelledby="i-notes">
        <div className="page-head__row">
          <h2 id="i-notes" className="title">
            {t.notes}
          </h2>
          <Link to={`/notes/new?domain=${i.domain_slug}&initiative=${i.slug}`} className="btn btn--primary">
            {t.addNote}
          </Link>
        </div>
        {i.notes.length ? <NoteList notes={i.notes} /> : <p className="empty">{t.noNotes}</p>}
      </section>

      <section className="block" aria-labelledby="i-news">
        <h2 id="i-news" className="title">
          {t.news}
        </h2>
        {i.feed_items.length ? <FeedList items={i.feed_items} names={{ [i.slug]: i.name }} compact /> : <p className="empty">{t.noNews}</p>}
      </section>
    </div>
  );
}
