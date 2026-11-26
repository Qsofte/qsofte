import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, type InitiativeInput } from '../api';
import Choices from '../components/Choices';
import { copy, initiativeKinds, initiativeStatus, regions, type InitiativeKind, type InitiativeStatus, type Region } from '../content';
import { useLoad, usePageTitle } from '../useLoad';

export default function InitiativeEdit() {
  const { slug } = useParams();
  const editing = slug !== undefined;
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<InitiativeInput>({
    name: '',
    domain_slug: params.get('domain') ?? '',
    summary: '',
    status: 'research',
    url: '',
    kind: 'central-bank',
    regions: [],
    lead: '',
    participants: '',
    started: null,
    aliases: '',
  });
  const [loaded, setLoaded] = useState(!editing);
  const [error, setError] = useState<string | null>(null);
  const domains = useLoad(api.domains, []).data ?? [];
  const t = copy.initiative;
  usePageTitle(editing ? t.editTitle : t.newTitle);

  useEffect(() => {
    if (!editing) return;
    api
      .initiative(slug)
      .then((i) => {
        setForm({
          name: i.name,
          domain_slug: i.domain_slug,
          summary: i.summary,
          status: i.status,
          url: i.url,
          kind: i.kind,
          regions: i.regions,
          lead: i.lead,
          participants: i.participants,
          started: i.started,
          aliases: i.aliases,
        });
        setLoaded(true);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, [editing, slug]);

  const set = <K extends keyof InitiativeInput>(k: K, v: InitiativeInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const saved = editing ? await api.updateInitiative(slug, form) : await api.createInitiative(form);
      navigate(`/landscape/${saved.slug}`, { replace: true });
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
          <input id="i-name" className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
        </label>
        <Choices<InitiativeKind>
          legend={t.kind}
          options={Object.fromEntries(Object.entries(initiativeKinds).map(([k, v]) => [k, v.label])) as Record<InitiativeKind, string>}
          value={form.kind}
          onChange={(v) => set('kind', v)}
          hint={initiativeKinds[form.kind].hint}
        />
        <div className="form__row">
          <label className="field">
            <span className="field__label">{t.domain}</span>
            <select id="i-domain" className="input" required value={form.domain_slug} onChange={(e) => set('domain_slug', e.target.value)}>
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
          <label className="field">
            <span className="field__label">{t.started}</span>
            <input
              id="i-started"
              className="input"
              type="number"
              inputMode="numeric"
              min={1950}
              max={2100}
              value={form.started ?? ''}
              onChange={(e) => set('started', e.target.value ? Number(e.target.value) : null)}
            />
          </label>
        </div>
        <Choices<InitiativeStatus> legend={t.status} options={initiativeStatus} value={form.status} onChange={(v) => set('status', v)} />
        <Choices<Region>
          legend={t.regions}
          options={regions}
          value={form.regions}
          onChange={(v) => set('regions', form.regions.includes(v) ? form.regions.filter((x) => x !== v) : [...form.regions, v])}
        />
        <label className="field">
          <span className="field__label">{t.summary}</span>
          <textarea id="i-summary" className="input" rows={3} value={form.summary} onChange={(e) => set('summary', e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">{t.lead}</span>
          <input id="i-lead" className="input" value={form.lead} onChange={(e) => set('lead', e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">{t.participants}</span>
          <textarea id="i-participants" className="input" rows={2} value={form.participants} onChange={(e) => set('participants', e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">{t.aliases}</span>
          <input id="i-aliases" className="input" value={form.aliases} onChange={(e) => set('aliases', e.target.value)} />
          <span className="field__hint">{t.aliasesHint}</span>
        </label>
        <label className="field">
          <span className="field__label">{t.link}</span>
          <input id="i-url" className="input" type="url" placeholder="https://" value={form.url} onChange={(e) => set('url', e.target.value)} />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <button type="submit" className="btn btn--primary" disabled={!form.name.trim() || !form.domain_slug}>
            {t.save}
          </button>
          <Link to={editing ? `/landscape/${slug}` : '/landscape'} className="btn btn--secondary">
            {t.cancel}
          </Link>
        </div>
      </form>
    </div>
  );
}
