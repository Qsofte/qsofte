import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type DomainDetail } from '../api';
import NoteList from '../components/NoteList';
import { capabilityLevels, copy, initiativeStatus } from '../content';
import { day } from '../format';
import { useLoad, usePageTitle } from '../useLoad';
import './Domain.css';

export default function DomainPage() {
  const { slug = '' } = useParams();
  const { data, error, setData } = useLoad(() => api.domain(slug), [slug]);
  const [editing, setEditing] = useState(false);
  usePageTitle(data?.name ?? copy.domains.title);

  if (error) return <p className="page error">{error}</p>;
  if (!data) return null;
  const t = copy.domain;

  return (
    <div className="page domain">
      <header className="page-head">
        <Link to="/domains" className="eyebrow crumb">
          {copy.domains.title} / {data.code}
        </Link>
        <h1 className="headline">{data.name}</h1>
        <p className="lead">{data.summary}</p>
      </header>

      <section className="domain__position block" aria-labelledby="d-position">
        <div className="page-head__row">
          <h2 id="d-position" className="title">
            {t.position}
          </h2>
          <span className={`tag${data.position_due ? ' tag--due' : ''}`}>
            {data.position_due && <>{t.due} · </>}
            {data.position_reviewed_at ? t.reviewed(day(data.position_reviewed_at)) : t.neverReviewed}
          </span>
        </div>
        {editing ? (
          <PositionForm domain={data} onDone={(d) => (setData(d), setEditing(false))} onCancel={() => setEditing(false)} />
        ) : (
          <>
            <p className="prose domain__statement">{data.position || copy.domains.noPosition}</p>
            <dl className="domain__facts">
              <div>
                <dt>{t.owner}</dt>
                <dd>{data.owner || '—'}</dd>
              </div>
              <div>
                <dt>{copy.capabilities.level}</dt>
                <dd>{capabilityLevels[data.capability_level].label}</dd>
              </div>
              <div className="domain__facts-wide">
                <dt>{t.questions}</dt>
                <dd className="prose">{data.open_questions || '—'}</dd>
              </div>
            </dl>
            <div className="actions">
              <button type="button" className="btn btn--secondary" onClick={() => setEditing(true)}>
                {t.edit}
              </button>
              {data.position && data.position_due && (
                <StillStands slug={slug} onDone={setData} />
              )}
            </div>
          </>
        )}
      </section>

      <section className="block" aria-labelledby="d-init">
        <h2 id="d-init" className="title">
          {t.initiatives}
        </h2>
        {data.initiatives.length ? (
          <ul className="domain__initiatives">
            {data.initiatives.map((i) => (
              <li key={i.slug} className="domain__initiative">
                <div className="domain__initiative-head">
                  <h3>{i.url ? <a href={i.url} target="_blank" rel="noreferrer">{i.name}</a> : i.name}</h3>
                  <span className="tag">{initiativeStatus[i.status as keyof typeof initiativeStatus] ?? i.status}</span>
                </div>
                <p className="muted small">{i.summary}</p>
                <Link to={`/notes?initiative=${i.slug}`} className="link-more small">
                  {copy.notes.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">{t.noInitiatives}</p>
        )}
        <AddInitiative slug={slug} onAdded={() => api.domain(slug).then(setData)} />
      </section>

      <section className="block" aria-labelledby="d-notes">
        <div className="page-head__row">
          <h2 id="d-notes" className="title">
            {t.notes}
          </h2>
          <Link to={`/notes/new?domain=${slug}`} className={`btn ${editing ? 'btn--secondary' : 'btn--primary'}`}>
            {t.addNote}
          </Link>
        </div>
        {data.notes.length ? <NoteList notes={data.notes} showDomain={false} /> : <p className="empty">{t.noNotes}</p>}
        {data.note_count > data.notes.length && (
          <Link to={`/notes?domain=${slug}`} className="link-more">
            {t.allNotes}
          </Link>
        )}
      </section>
    </div>
  );
}

function StillStands({ slug, onDone }: { slug: string; onDone: (d: DomainDetail) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="link-more"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        api.updateDomain(slug, { mark_reviewed: true }).then(onDone).finally(() => setBusy(false));
      }}
    >
      {copy.domain.stillStands}
    </button>
  );
}

function PositionForm({
  domain,
  onDone,
  onCancel,
}: {
  domain: DomainDetail;
  onDone: (d: DomainDetail) => void;
  onCancel: () => void;
}) {
  const [position, setPosition] = useState(domain.position);
  const [owner, setOwner] = useState(domain.owner);
  const [questions, setQuestions] = useState(domain.open_questions);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const t = copy.domain;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      onDone(await api.updateDomain(domain.slug, { position, owner, open_questions: questions }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <label className="field">
        <span className="field__label">{t.position}</span>
        <textarea id="position" className="input" rows={5} value={position} onChange={(e) => setPosition(e.target.value)} />
        <span className="field__hint">{t.positionHint}</span>
      </label>
      <label className="field">
        <span className="field__label">{t.owner}</span>
        <input id="owner" className="input" value={owner} onChange={(e) => setOwner(e.target.value)} />
      </label>
      <label className="field">
        <span className="field__label">{t.questions}</span>
        <textarea id="questions" className="input" rows={3} value={questions} onChange={(e) => setQuestions(e.target.value)} />
      </label>
      {error && <p className="error">{error}</p>}
      <div className="actions">
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {t.save}
        </button>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          {t.cancel}
        </button>
      </div>
    </form>
  );
}

function AddInitiative({ slug, onAdded }: { slug: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('research');
  const [error, setError] = useState<string | null>(null);
  const t = copy.domain;

  if (!open) {
    return (
      <button type="button" className="link-more" onClick={() => setOpen(true)}>
        {t.addInitiative}
      </button>
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      await api.createInitiative({ name, summary, url, status, domain_slug: slug });
      setOpen(false);
      setName('');
      setSummary('');
      setUrl('');
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <form className="form domain__add" onSubmit={submit}>
      <div className="form__row">
        <label className="field">
          <span className="field__label">{t.initiativeName}</span>
          <input id="init-name" className="input" required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">{t.initiativeStatus}</span>
          <select id="init-status" className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(initiativeStatus).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span className="field__label">{t.initiativeSummary}</span>
        <textarea id="init-summary" className="input" rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} />
      </label>
      <label className="field">
        <span className="field__label">{t.initiativeUrl}</span>
        <input id="init-url" className="input" type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
      </label>
      {error && <p className="error">{error}</p>}
      <div className="actions">
        <button type="submit" className="btn btn--secondary" disabled={!name.trim()}>
          {t.addInitiative}
        </button>
        <button type="button" className="link-more" onClick={() => setOpen(false)}>
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
