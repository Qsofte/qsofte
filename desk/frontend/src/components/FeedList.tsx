// Articles from the feeds, with the actions that turn news into Desk knowledge.
import { Link } from 'react-router-dom';
import type { FeedItem } from '../api';
import { copy } from '../content';
import { day } from '../format';
import './FeedList.css';

interface Props {
  items: FeedItem[];
  names?: Record<string, string>; // initiative slug -> name
  onState?: (item: FeedItem, state: 'new' | 'starred' | 'dismissed') => void;
  compact?: boolean;
}

export default function FeedList({ items, names = {}, onState, compact = false }: Props) {
  const t = copy.feeds;
  return (
    <ul className="feed-list">
      {items.map((i) => (
        <li key={i.id} className="feed-list__item">
          <div className="feed-list__meta">
            <span className="mono">{day(i.published_at)}</span>
            <span className="mono">{i.feed_name}</span>
            {i.domain_codes.map((c) => (
              <span key={c} className="tag">
                {c}
              </span>
            ))}
            {i.initiative_slugs.map((s) => (
              <Link key={s} to={`/landscape/${s}`} className="tag feed-list__tag-link">
                {names[s] ?? s}
              </Link>
            ))}
          </div>
          {i.link ? (
            <a href={i.link} target="_blank" rel="noreferrer" className="feed-list__title">
              {i.title}
            </a>
          ) : (
            <span className="feed-list__title">{i.title}</span>
          )}
          {!compact && i.summary && <p className="feed-list__summary">{i.summary}</p>}
          {onState && (
            <div className="actions">
              {i.note_id ? (
                <Link to={`/notes/${i.note_id}`} className="link-more small">
                  {t.noted}
                </Link>
              ) : (
                <Link to={`/notes/new?item=${i.id}`} className="link-more small">
                  {t.note}
                </Link>
              )}
              <button
                type="button"
                className="link-more small feed-list__plain"
                onClick={() => onState(i, i.state === 'starred' ? 'new' : 'starred')}
              >
                {i.state === 'starred' ? t.unstar : t.star}
              </button>
              {i.state !== 'dismissed' && !i.note_id && (
                <button type="button" className="link-more small feed-list__plain" onClick={() => onState(i, 'dismissed')}>
                  {t.dismiss}
                </button>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
