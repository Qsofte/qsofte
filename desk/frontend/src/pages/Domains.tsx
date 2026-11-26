import { Link } from 'react-router-dom';
import { api } from '../api';
import { capabilityLevels, copy } from '../content';
import { useLoad, usePageTitle } from '../useLoad';
import './Domains.css';

export default function Domains() {
  const { data, error } = useLoad(api.domains, []);
  usePageTitle(copy.domains.title);
  return (
    <div className="page domains">
      <header className="page-head">
        <h1 className="headline">{copy.domains.title}</h1>
        <p className="lead">{copy.domains.lead}</p>
      </header>
      {error && <p className="error">{error}</p>}
      <ul className="domains__grid">
        {data?.map((d) => (
          <li key={d.slug} className="domains__item">
            <Link to={`/domains/${d.slug}`} className="domains__link">
              <span className="mono">{d.code}</span>
              <h2 className="domains__name">{d.name}</h2>
              <p className="domains__position">{d.position || d.summary}</p>
              <span className="tags">
                <span className="tag">{capabilityLevels[d.capability_level].label}</span>
                <span className="tag">{copy.domains.notes(d.note_count)}</span>
                {d.position_due && <span className="tag tag--due">{copy.domain.due}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
