import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, type GuideInput } from '../api';
import Choices from '../components/Choices';
import Markdown from '../components/Markdown';
import { copy, guideLevels, guideStatus, type GuideLevel, type GuideStatus } from '../content';
import { useLoad, usePageTitle } from '../useLoad';
import './GuideEdit.css';

const BLANK: GuideInput = {
  title: '',
  summary: '',
  body: '',
  level: 'primer',
  status: 'draft',
  domain_slug: null,
  initiative_slugs: [],
};

export default function GuideEdit() {
  const { slug } = useParams();
  const editing = slug !== undefined;
  const navigate = useNavigate();
  const [form, setForm] = useState<GuideInput>(BLANK);
  const [loaded, setLoaded] = useState(!editing);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const domains = useLoad(api.domains, []).data ?? [];
  const initiatives = useLoad(api.initiatives, []).data ?? [];
  const t = copy.library;
  usePageTitle(editing ? t.editTitle : t.newTitle);

  useEffect(() => {
    if (!editing) return;
    api
      .guide(slug)
      .then((g) => {
        setForm({
          title: g.title,
          summary: g.summary,
          body: g.body,
          level: g.level,
          status: g.status,
          domain_slug: g.domain_slug,
          initiative_slugs: g.initiative_slugs,
        });
        setLoaded(true);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, [editing, slug]);

  const set = <K extends keyof GuideInput>(k: K, v: GuideInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const saved = editing ? await api.updateGuide(slug, form) : await api.createGuide(form);
      navigate(`/library/${saved.slug}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function remove() {
    try {
      await api.deleteGuide(slug!);
      navigate('/library', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  if (!loaded) return error ? <p className="page error">{error}</p> : null;
  const domainInits = initiatives.filter((i) => !form.domain_slug || i.domain_slug === form.domain_slug || form.initiative_slugs.includes(i.slug));

  return (
    <div className="page guide-edit container--narrow">
      <header className="page-head">
        <h1 className="headline">{editing ? t.editTitle : t.newTitle}</h1>
      </header>
      <form className="form" onSubmit={submit}>
        <label className="field">
          <span className="field__label">{t.titleLabel}</span>
          <input id="g-title" className="input" required value={form.title} onChange={(e) => set('title', e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">{t.summary}</span>
          <textarea id="g-summary" className="input" rows={2} value={form.summary} onChange={(e) => set('summary', e.target.value)} />
        </label>
        <div className="form__row">
          <Choices<GuideLevel> legend={t.level} options={guideLevels} value={form.level} onChange={(v) => set('level', v)} />
          <Choices<GuideStatus> legend={t.status} options={guideStatus} value={form.status} onChange={(v) => set('status', v)} />
        </div>
        <label className="field">
          <span className="field__label">{t.domain}</span>
          <select id="g-domain" className="input" value={form.domain_slug ?? ''} onChange={(e) => set('domain_slug', e.target.value || null)}>
            <option value="">{t.noDomain}</option>
            {domains.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.code} {d.name}
              </option>
            ))}
          </select>
        </label>
        {domainInits.length > 0 && (
          <Choices
            legend={t.initiatives}
            options={domainInits.map((i) => [i.slug, i.name] as [string, string])}
            value={form.initiative_slugs}
            onChange={(v) =>
              set('initiative_slugs', form.initiative_slugs.includes(v) ? form.initiative_slugs.filter((x) => x !== v) : [...form.initiative_slugs, v])
            }
          />
        )}
        <div className="field">
          <div className="page-head__row">
            <span className="field__label">{t.body}</span>
            <div className="chips" role="group" aria-label={t.body}>
              <button type="button" className="chip" aria-pressed={!preview} onClick={() => setPreview(false)}>
                {t.write}
              </button>
              <button type="button" className="chip" aria-pressed={preview} onClick={() => setPreview(true)}>
                {t.preview}
              </button>
            </div>
          </div>
          {preview ? (
            <div className="guide-edit__preview">
              <Markdown source={form.body} />
            </div>
          ) : (
            <textarea id="g-body" className="input guide-edit__body" rows={18} value={form.body} onChange={(e) => set('body', e.target.value)} />
          )}
          <span className="field__hint">{t.bodyHint}</span>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <button type="submit" className="btn btn--primary" disabled={!form.title.trim()}>
            {t.save}
          </button>
          <Link to={editing ? `/library/${slug}` : '/library'} className="btn btn--secondary">
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
