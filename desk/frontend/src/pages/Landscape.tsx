import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, type Initiative } from '../api';
import { copy, initiativeKinds, initiativeStatus, regions, type InitiativeKind } from '../content';
import { fold } from '../format';
import { useLoad, usePageTitle } from '../useLoad';
import './Landscape.css';

export default function Landscape() {
  const { data, error } = useLoad(api.initiatives, []);
  const [params, setParams] = useSearchParams();
  const t = copy.landscape;
  usePageTitle(t.title);
  const kind = params.get('kind') ?? '';
  const region = params.get('region') ?? '';
  const status = params.get('status') ?? '';
  const text = params.get('q') ?? '';

  function set(name: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    setParams(next, { replace: true });
  }

  const groups = useMemo(() => {
    const words = fold(text).split(/\s+/).filter(Boolean);
    const shown = (data ?? []).filter(
      (i) =>
        (!kind || i.kind === kind) &&
        (!region || i.regions.includes(region as Initiative['regions'][number])) &&
        (!status || i.status === status) &&
        words.every((w) => fold(`${i.name} ${i.aliases} ${i.lead} ${i.summary}`).includes(w)),
    );
    return (Object.keys(initiativeKinds) as InitiativeKind[])
      .map((k) => ({ kind: k, items: shown.filter((i) => i.kind === k) }))
      .filter((g) => g.items.length);
  }, [data, kind, region, status, text]);

  return (
    <div className="page landscape">
      <header className="page-head">
        <div className="page-head__row">
          <h1 className="headline">{t.title}</h1>
          <Link to="/landscape/new" className="btn btn--primary">
            {t.add}
          </Link>
        </div>
        <p className="lead">{t.lead}</p>
      </header>

      <div className="landscape__filters">
        <div className="chips" role="group" aria-label={copy.initiative.kind}>
          <button type="button" className="chip" aria-pressed={!kind} onClick={() => set('kind', '')}>
            {t.allKinds}
          </button>
          {Object.entries(initiativeKinds).map(([k, v]) => (
            <button key={k} type="button" className="chip" aria-pressed={kind === k} onClick={() => set('kind', k)}>
              {v.label}
            </button>
          ))}
        </div>
        <div className="landscape__selects">
          <label className="field">
            <span className="field__label">{copy.initiative.regions}</span>
            <select id="l-region" className="input" value={region} onChange={(e) => set('region', e.target.value)}>
              <option value="">{t.allRegions}</option>
              {Object.entries(regions).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">{copy.initiative.status}</span>
            <select id="l-status" className="input" value={status} onChange={(e) => set('status', e.target.value)}>
              <option value="">{t.allStatus}</option>
              {Object.entries(initiativeStatus).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">{t.filter}</span>
            <input id="l-q" className="input" type="search" value={text} onChange={(e) => set('q', e.target.value)} />
          </label>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {data && !groups.length && <p className="empty">{t.none}</p>}
      {groups.map((g) => (
        <section key={g.kind} className="block" aria-labelledby={`k-${g.kind}`}>
          <div className="page-head__row">
            <h2 id={`k-${g.kind}`} className="title">
              {initiativeKinds[g.kind].label}
            </h2>
            <span className="mono">{g.items.length}</span>
          </div>
          <ul className="landscape__list">
            {g.items.map((i) => (
              <li key={i.slug} className="landscape__row">
                <div className="landscape__main">
                  <Link to={`/landscape/${i.slug}`} className="landscape__name">
                    {i.name}
                  </Link>
                  <p className="muted small landscape__summary">{i.summary}</p>
                </div>
                <div className="landscape__meta">
                  <span className={`tag${i.status === 'live' ? ' tag--mark' : ''}`}>{initiativeStatus[i.status]}</span>
                  {i.regions.slice(0, 3).map((r) => (
                    <span key={r} className="tag">
                      {regions[r]}
                    </span>
                  ))}
                  {i.started && <span className="mono">{t.since(i.started)}</span>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
