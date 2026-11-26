import { Link } from 'react-router-dom';
import { api } from '../api';
import { copy, guideLevels, guideStatus } from '../content';
import { useLoad, usePageTitle } from '../useLoad';
import './Library.css';

export default function Library() {
  const { data, error } = useLoad(api.guides, []);
  const t = copy.library;
  usePageTitle(t.title);
  return (
    <div className="page library">
      <header className="page-head">
        <div className="page-head__row">
          <h1 className="headline">{t.title}</h1>
          <Link to="/library/new" className="btn btn--primary">
            {t.add}
          </Link>
        </div>
        <p className="lead">{t.lead}</p>
      </header>
      {error && <p className="error">{error}</p>}
      {data &&
        (data.length ? (
          <ul className="library__list">
            {data.map((g) => (
              <li key={g.slug} className="library__item">
                <div className="tags">
                  <span className="tag">{guideLevels[g.level]}</span>
                  {g.domain_code && <span className="tag">{g.domain_code}</span>}
                  {g.status === 'draft' && <span className="tag tag--due">{guideStatus.draft}</span>}
                </div>
                <Link to={`/library/${g.slug}`} className="library__title">
                  {g.title}
                </Link>
                <p className="muted small">{g.summary}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">{t.none}</p>
        ))}
    </div>
  );
}
