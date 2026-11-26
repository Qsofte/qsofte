import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { copy, horizons, noteTypes, regions, stances } from '../content';
import { day } from '../format';
import { useLoad, usePageTitle } from '../useLoad';
import './NoteView.css';

export default function NoteView() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const { data: n, error } = useLoad(() => api.note(id), [id]);
  const event = useLoad(() => (n?.event_id ? api.event(n.event_id) : Promise.resolve(null)), [n?.event_id]).data;
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  usePageTitle(n?.title ?? copy.notes.title);
  const t = copy.note;

  if (error) return <p className="page error">{error}</p>;
  if (!n) return null;

  async function remove() {
    try {
      await api.deleteNote(id);
      navigate('/notes', { replace: true });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <article className="page note-view container--narrow">
      <header className="page-head">
        <Link to="/notes" className="eyebrow crumb">
          {t.back}
        </Link>
        <div className="tags">
          <span className="tag">{noteTypes[n.type].label}</span>
          <Link to={`/domains/${n.domain_slug}`} className="tag note-view__tag-link">
            {n.domain_code} {n.domain_name}
          </Link>
          {n.regions.map((r) => (
            <span key={r} className="tag">
              {regions[r]}
            </span>
          ))}
        </div>
        <h1 className="headline">{n.title}</h1>
        <p className="mono">
          {day(n.occurred_on)} · {horizons[n.horizon]} · {stances[n.stance]}
        </p>
      </header>

      <section className="note-view__sowhat">
        <span className="eyebrow">{t.soWhat}</span>
        <p className="prose">{n.so_what}</p>
      </section>

      {n.body && (
        <section className="block">
          <span className="eyebrow">{t.body}</span>
          <p className="prose">{n.body}</p>
        </section>
      )}

      <dl className="note-view__facts">
        {n.source_url && (
          <div>
            <dt>{t.source}</dt>
            <dd>
              <a href={n.source_url} target="_blank" rel="noreferrer">
                {new URL(n.source_url).hostname}
              </a>
            </dd>
          </div>
        )}
        {n.initiatives.length > 0 && (
          <div>
            <dt>{t.initiatives}</dt>
            <dd className="tags">
              {n.initiatives.map((i) => (
                <Link key={i.slug} to={`/notes?initiative=${i.slug}`} className="tag note-view__tag-link">
                  {i.name}
                </Link>
              ))}
            </dd>
          </div>
        )}
        {event && (
          <div>
            <dt>{t.event}</dt>
            <dd>{event.name}</dd>
          </div>
        )}
        {n.review_on && (
          <div>
            <dt>{t.reviewOn}</dt>
            <dd>{day(n.review_on)}</dd>
          </div>
        )}
      </dl>

      <p className="mono">{t.by(n.created_by, day(n.created_at))}</p>

      <div className="actions">
        <Link to={`/notes/${id}/edit`} className="btn btn--primary">
          {t.edit}
        </Link>
        {confirming ? (
          <>
            <span className="muted small">{t.confirmDelete}</span>
            <button type="button" className="btn btn--secondary note-view__danger" onClick={remove}>
              {t.confirmYes}
            </button>
            <button type="button" className="link-more" onClick={() => setConfirming(false)}>
              {t.cancel}
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--secondary" onClick={() => setConfirming(true)}>
            {t.delete}
          </button>
        )}
      </div>
      {deleteError && <p className="error">{deleteError}</p>}
    </article>
  );
}
