import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, type NoteInput } from '../api';
import Choices from '../components/Choices';
import { copy, horizons, noteTypes, regions, stances, type NoteType, type Region } from '../content';
import { todayIso } from '../format';
import { useLoad, usePageTitle } from '../useLoad';
import './NoteEdit.css';

function blank(params: URLSearchParams): NoteInput {
  const type = params.get('type');
  const event = params.get('event');
  return {
    type: type && type in noteTypes ? (type as NoteType) : 'signal',
    title: '',
    body: '',
    so_what: '',
    source_url: '',
    occurred_on: todayIso(),
    domain_slug: params.get('domain') ?? '',
    regions: [],
    horizon: '12m',
    stance: 'watch',
    initiative_slugs: [],
    event_id: event ? Number(event) : null,
    review_on: null,
  };
}

export default function NoteEdit() {
  const { id } = useParams();
  const editing = id !== undefined;
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<NoteInput>(() => blank(params));
  const [loaded, setLoaded] = useState(!editing);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const domains = useLoad(api.domains, []).data ?? [];
  const initiatives = useLoad(api.initiatives, []).data ?? [];
  const events = useLoad(api.events, []).data ?? [];
  const t = copy.note;
  usePageTitle(editing ? t.editTitle : t.newTitle);

  useEffect(() => {
    if (!editing) return;
    api
      .note(Number(id))
      .then((n) => {
        setForm({
          type: n.type,
          title: n.title,
          body: n.body,
          so_what: n.so_what,
          source_url: n.source_url,
          occurred_on: n.occurred_on,
          domain_slug: n.domain_slug,
          regions: n.regions,
          horizon: n.horizon,
          stance: n.stance,
          initiative_slugs: n.initiatives.map((i) => i.slug),
          event_id: n.event_id,
          review_on: n.review_on,
        });
        setLoaded(true);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, [editing, id]);

  const set = <K extends keyof NoteInput>(k: K, v: NoteInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = <T extends string>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = { ...form, review_on: form.type === 'thesis' ? form.review_on || null : null };
      const saved = editing ? await api.updateNote(Number(id), body) : await api.createNote(body);
      navigate(`/notes/${saved.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  if (!loaded) return error ? <p className="page error">{error}</p> : null;
  const domainInits = initiatives.filter((i) => i.domain_slug === form.domain_slug);
  const otherInits = initiatives.filter((i) => i.domain_slug !== form.domain_slug && form.initiative_slugs.includes(i.slug));

  return (
    <div className="page note-edit container--narrow">
      <header className="page-head">
        <h1 className="headline">{editing ? t.editTitle : t.newTitle}</h1>
      </header>
      <form className="form" onSubmit={submit}>
        <Choices
          legend={t.type}
          options={Object.fromEntries(Object.entries(noteTypes).map(([k, v]) => [k, v.label])) as Record<NoteType, string>}
          value={form.type}
          onChange={(v) => set('type', v)}
          hint={noteTypes[form.type].hint}
        />
        <label className="field">
          <span className="field__label">{t.headline}</span>
          <input id="title" className="input" required maxLength={200} value={form.title} onChange={(e) => set('title', e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">{t.body}</span>
          <textarea id="body" className="input" rows={5} value={form.body} onChange={(e) => set('body', e.target.value)} />
          <span className="field__hint">{t.bodyHint}</span>
        </label>
        <label className="field note-edit__sowhat">
          <span className="field__label">{t.soWhat}</span>
          <textarea id="so_what" className="input" rows={3} required value={form.so_what} onChange={(e) => set('so_what', e.target.value)} />
          <span className="field__hint">{t.soWhatHint}</span>
        </label>
        <div className="form__row">
          <label className="field">
            <span className="field__label">{t.date}</span>
            <input id="occurred_on" className="input" type="date" required value={form.occurred_on} onChange={(e) => set('occurred_on', e.target.value)} />
          </label>
          <label className="field">
            <span className="field__label">{t.source}</span>
            <input id="source_url" className="input" type="url" placeholder="https://" value={form.source_url} onChange={(e) => set('source_url', e.target.value)} />
          </label>
        </div>
        <label className="field">
          <span className="field__label">{t.domain}</span>
          <select id="domain" className="input" required value={form.domain_slug} onChange={(e) => set('domain_slug', e.target.value)}>
            <option value="" disabled>
              —
            </option>
            {domains.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.code} {d.name}
              </option>
            ))}
          </select>
        </label>
        {(domainInits.length > 0 || otherInits.length > 0) && (
          <Choices
            legend={t.initiatives}
            options={[...domainInits, ...otherInits].map((i) => [i.slug, i.name] as [string, string])}
            value={form.initiative_slugs}
            onChange={(v) => set('initiative_slugs', toggle(form.initiative_slugs, v))}
          />
        )}
        <Choices<Region>
          legend={t.regions}
          options={regions}
          value={form.regions}
          onChange={(v) => set('regions', toggle(form.regions, v))}
        />
        <div className="form__row">
          <Choices legend={t.horizon} options={horizons} value={form.horizon} onChange={(v) => set('horizon', v)} />
          <Choices legend={t.stance} options={stances} value={form.stance} onChange={(v) => set('stance', v)} />
        </div>
        {form.type === 'thesis' && (
          <label className="field">
            <span className="field__label">{t.reviewOn}</span>
            <input id="review_on" className="input" type="date" value={form.review_on ?? ''} onChange={(e) => set('review_on', e.target.value || null)} />
            <span className="field__hint">{t.reviewHint}</span>
          </label>
        )}
        {(form.type === 'debrief' || form.event_id !== null) && (
          <label className="field">
            <span className="field__label">{t.event}</span>
            <select
              id="event"
              className="input"
              value={form.event_id ?? ''}
              onChange={(e) => set('event_id', e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">{t.noEvent}</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <button type="submit" className="btn btn--primary" disabled={busy || !form.title.trim() || !form.so_what.trim() || !form.domain_slug}>
            {busy ? t.saving : t.save}
          </button>
          <Link to={editing ? `/notes/${id}` : '/notes'} className="btn btn--secondary">
            {t.cancel}
          </Link>
        </div>
      </form>
    </div>
  );
}
