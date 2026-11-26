import { useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, type Feed, type FeedInput, type FeedItem } from '../api';
import Choices from '../components/Choices';
import FeedList from '../components/FeedList';
import { copy, feedKinds, type FeedKind } from '../content';
import { ago } from '../format';
import { useLoad, usePageTitle } from '../useLoad';
import './Feeds.css';

const TABS = { new: copy.feeds.inbox, starred: copy.feeds.starred, all: copy.feeds.all } as const;
type Tab = keyof typeof TABS;

export default function Feeds() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab) || 'new';
  const domain = params.get('domain') ?? '';
  const feedId = params.get('feed') ?? '';
  const key = `${tab}|${domain}|${feedId}`;
  const items = useLoad(
    () => api.feedItems({ state: tab === 'all' ? undefined : tab, domain: domain || undefined, feed_id: feedId || undefined, limit: '150' }),
    [key],
  );
  const feeds = useLoad(api.feeds, []);
  const initiatives = useLoad(api.initiatives, []).data ?? [];
  const names = useMemo(() => Object.fromEntries(initiatives.map((i) => [i.slug, i.name])), [initiatives]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const t = copy.feeds;
  usePageTitle(t.title);

  function set(name: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    setParams(next, { replace: true });
  }

  async function changeState(item: FeedItem, state: 'new' | 'starred' | 'dismissed') {
    const updated = await api.setFeedItemState(item.id, state);
    items.setData((list) => {
      if (!list) return list;
      const keep = tab === 'all' ? state !== 'dismissed' : state === tab;
      return keep ? list.map((x) => (x.id === item.id ? updated : x)) : list.filter((x) => x.id !== item.id);
    });
  }

  async function refresh() {
    setBusy(true);
    setMessage(null);
    try {
      const r = await api.refreshFeeds();
      setMessage(t.refreshed(r.added, r.failed));
      await Promise.all([items.reload(), feeds.reload()]);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page feeds">
      <header className="page-head">
        <div className="page-head__row">
          <h1 className="headline">{t.title}</h1>
          <button type="button" className="btn btn--secondary" onClick={refresh} disabled={busy}>
            {busy ? t.refreshing : t.refresh}
          </button>
        </div>
        <p className="lead">{t.lead}</p>
        {message && (
          <p className="muted small" role="status">
            {message}
          </p>
        )}
      </header>

      <div className="feeds__filters">
        <div className="chips" role="group" aria-label={t.inbox}>
          {(Object.keys(TABS) as Tab[]).map((k) => (
            <button key={k} type="button" className="chip" aria-pressed={tab === k} onClick={() => set('tab', k === 'new' ? '' : k)}>
              {TABS[k]}
            </button>
          ))}
        </div>
        <div className="feeds__selects">
          <label className="field">
            <span className="field__label">{copy.note.domain}</span>
            <select id="f-domain" className="input" value={domain} onChange={(e) => set('domain', e.target.value)}>
              <option value="">{t.allDomains}</option>
              {['D1', 'D2', 'D3', 'D4', 'D5', 'D6'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">{t.sources}</span>
            <select id="f-feed" className="input" value={feedId} onChange={(e) => set('feed', e.target.value)}>
              <option value="">{t.allSources}</option>
              {(feeds.data ?? []).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {items.error && <p className="error">{items.error}</p>}
      {items.data &&
        (items.data.length ? (
          <FeedList items={items.data} names={names} onState={changeState} />
        ) : (
          <p className="empty">{t.none}</p>
        ))}

      <Sources feeds={feeds.data ?? []} onChange={feeds.reload} />
    </div>
  );
}

function Sources({ feeds, onChange }: { feeds: Feed[]; onChange: () => void }) {
  const t = copy.feeds;
  const [form, setForm] = useState<FeedInput>({ name: '', url: '', kind: 'industry', active: true, relevant_only: false });
  const [error, setError] = useState<string | null>(null);

  async function add(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.addFeed({ ...form, url: form.url.trim() });
      setForm({ name: '', url: '', kind: 'industry', active: true, relevant_only: false });
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function update(f: Feed, patch: Partial<FeedInput>) {
    try {
      await api.updateFeed(f.id, { name: f.name, url: f.url, kind: f.kind, active: f.active, relevant_only: f.relevant_only, ...patch });
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <section className="block" aria-labelledby="f-sources">
      <h2 id="f-sources" className="title">
        {t.sources}
      </h2>
      <p className="muted small">{t.sourcesLead}</p>
      <ul className="feeds__sources">
        {feeds.map((f) => (
          <li key={f.id} className={`feeds__source${f.active ? '' : ' feeds__source--off'}`}>
            <div className="feeds__source-main">
              <strong>{f.name}</strong>
              <span className="mono feeds__url">{f.url}</span>
              <span className="small muted">
                {feedKinds[f.kind]} · {f.last_fetched_at ? t.lastRead(ago(f.last_fetched_at)) : t.never} · {t.items(f.item_count)}
                {f.relevant_only && <> · {t.relevantOnly}</>}
              </span>
              {f.last_error && <span className="error">{f.last_error}</span>}
            </div>
            <div className="actions">
              <button type="button" className="link-more small" onClick={() => update(f, { active: !f.active })}>
                {f.active ? t.pause : t.resume}
              </button>
              <button
                type="button"
                className="link-more small"
                onClick={() => api.deleteFeed(f.id).then(onChange, (e: unknown) => setError(e instanceof Error ? e.message : String(e)))}
              >
                {t.remove}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <form className="form feeds__add" onSubmit={add}>
        <h3>{t.addSource}</h3>
        <div className="form__row">
          <label className="field">
            <span className="field__label">{t.name}</span>
            <input id="feed-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="field">
            <span className="field__label">{t.url}</span>
            <input id="feed-url" className="input" type="url" placeholder="https://" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </label>
        </div>
        <Choices<FeedKind> legend={t.kind} options={feedKinds} value={form.kind} onChange={(kind) => setForm({ ...form, kind })} />
        <label className="feeds__check">
          <input
            id="feed-relevant"
            type="checkbox"
            checked={form.relevant_only}
            onChange={(e) => setForm({ ...form, relevant_only: e.target.checked })}
          />
          <span>{t.relevantOnly}</span>
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <button type="submit" className="btn btn--secondary" disabled={!form.name.trim() || !form.url.trim()}>
            {t.add}
          </button>
        </div>
      </form>
    </section>
  );
}
