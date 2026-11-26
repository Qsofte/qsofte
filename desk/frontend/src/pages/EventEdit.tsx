import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, type EventInput } from '../api';
import Choices from '../components/Choices';
import { copy, eventStatus, months, showUp, type ShowUp } from '../content';
import { useLoad, usePageTitle } from '../useLoad';

const BLANK: EventInput = {
  name: '',
  organiser: '',
  city: '',
  starts_on: null,
  ends_on: null,
  typical_month: null,
  level: 'attend',
  status: 'considering',
  goal: '',
  why: '',
  url: '',
  domain_codes: [],
};

export default function EventEdit() {
  const { id } = useParams();
  const editing = id !== undefined;
  const navigate = useNavigate();
  const [form, setForm] = useState<EventInput>(BLANK);
  const [loaded, setLoaded] = useState(!editing);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const domains = useLoad(api.domains, []).data ?? [];
  const t = copy.event;
  usePageTitle(editing ? t.editTitle : t.newTitle);

  useEffect(() => {
    if (!editing) return;
    api
      .event(Number(id))
      .then(({ id: _id, next_on: _n, debrief_count: _d, ...rest }) => {
        setForm(rest);
        setLoaded(true);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, [editing, id]);

  const set = <K extends keyof EventInput>(k: K, v: EventInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editing) await api.updateEvent(Number(id), form);
      else await api.createEvent(form);
      navigate('/events', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function remove() {
    try {
      await api.deleteEvent(Number(id));
      navigate('/events', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  if (!loaded) return error ? <p className="page error">{error}</p> : null;

  return (
    <div className="page container--narrow">
      <header className="page-head">
        <h1 className="headline">{editing ? t.editTitle : t.newTitle}</h1>
      </header>
      <form className="form" onSubmit={submit}>
        <label className="field">
          <span className="field__label">{t.name}</span>
          <input id="ev-name" className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
        </label>
        <div className="form__row">
          <label className="field">
            <span className="field__label">{t.organiser}</span>
            <input id="ev-org" className="input" value={form.organiser} onChange={(e) => set('organiser', e.target.value)} />
          </label>
          <label className="field">
            <span className="field__label">{t.city}</span>
            <input id="ev-city" className="input" value={form.city} onChange={(e) => set('city', e.target.value)} />
          </label>
        </div>
        <div className="form__row">
          <label className="field">
            <span className="field__label">{t.startsOn}</span>
            <input id="ev-start" className="input" type="date" value={form.starts_on ?? ''} onChange={(e) => set('starts_on', e.target.value || null)} />
          </label>
          <label className="field">
            <span className="field__label">{t.endsOn}</span>
            <input id="ev-end" className="input" type="date" value={form.ends_on ?? ''} onChange={(e) => set('ends_on', e.target.value || null)} />
          </label>
          <label className="field">
            <span className="field__label">{t.month}</span>
            <select
              id="ev-month"
              className="input"
              value={form.typical_month ?? ''}
              onChange={(e) => set('typical_month', e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">{t.noMonth}</option>
              {months.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <span className="field__hint">{t.monthHint}</span>
          </label>
        </div>
        <Choices<ShowUp>
          legend={t.level}
          options={Object.fromEntries(Object.entries(showUp).map(([k, v]) => [k, v.label])) as Record<ShowUp, string>}
          value={form.level}
          onChange={(v) => set('level', v)}
          hint={showUp[form.level].hint}
        />
        <Choices legend={t.status} options={eventStatus} value={form.status} onChange={(v) => set('status', v)} />
        <Choices
          legend={t.domains}
          options={domains.map((d) => [d.code, `${d.code} ${d.name}`] as [string, string])}
          value={form.domain_codes}
          onChange={(c) =>
            set('domain_codes', form.domain_codes.includes(c) ? form.domain_codes.filter((x) => x !== c) : [...form.domain_codes, c].sort())
          }
        />
        <label className="field">
          <span className="field__label">{t.why}</span>
          <textarea id="ev-why" className="input" rows={2} value={form.why} onChange={(e) => set('why', e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">{t.goal}</span>
          <textarea id="ev-goal" className="input" rows={2} value={form.goal} onChange={(e) => set('goal', e.target.value)} />
          <span className="field__hint">{t.goalHint}</span>
        </label>
        <label className="field">
          <span className="field__label">{t.url}</span>
          <input id="ev-url" className="input" type="url" placeholder="https://" value={form.url} onChange={(e) => set('url', e.target.value)} />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <button type="submit" className="btn btn--primary" disabled={!form.name.trim()}>
            {t.save}
          </button>
          <Link to="/events" className="btn btn--secondary">
            {t.cancel}
          </Link>
          {editing &&
            (confirming ? (
              <>
                <span className="muted small">{t.confirmDelete}</span>
                <button type="button" className="link-more" onClick={remove}>
                  {t.confirmYes}
                </button>
              </>
            ) : (
              <button type="button" className="link-more" onClick={() => setConfirming(true)}>
                {t.delete}
              </button>
            ))}
        </div>
      </form>
    </div>
  );
}
