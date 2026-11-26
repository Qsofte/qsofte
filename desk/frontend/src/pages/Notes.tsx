import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import NoteList from '../components/NoteList';
import { copy, noteTypes, regions } from '../content';
import { useLoad, usePageTitle } from '../useLoad';
import './Notes.css';

const FILTERS = ['type', 'domain', 'region', 'initiative', 'q'] as const;

export default function Notes() {
  const [params, setParams] = useSearchParams();
  const filters = Object.fromEntries(FILTERS.map((k) => [k, params.get(k) ?? undefined]));
  const key = FILTERS.map((k) => params.get(k) ?? '').join('|');
  const { data, error } = useLoad(() => api.notes(filters), [key]);
  const domains = useLoad(api.domains, []).data ?? [];
  const [search, setSearch] = useState(params.get('q') ?? '');
  usePageTitle(copy.notes.title);

  function set(name: string, value: string | undefined) {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    setParams(next, { replace: true });
  }

  // Search as you type, a moment after typing stops.
  useEffect(() => {
    const id = setTimeout(() => {
      if ((params.get('q') ?? '') !== search.trim()) set('q', search.trim() || undefined);
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const type = params.get('type');

  return (
    <div className="page notes">
      <header className="page-head">
        <div className="page-head__row">
          <h1 className="headline">{copy.notes.title}</h1>
          <Link to={`/notes/new${type ? `?type=${type}` : ''}`} className="btn btn--primary">
            {copy.notes.add}
          </Link>
        </div>
        <p className="lead">{copy.notes.lead}</p>
      </header>

      <div className="notes__filters">
        <div className="chips" role="group" aria-label={copy.note.type}>
          <button type="button" className="chip" aria-pressed={!type} onClick={() => set('type', undefined)}>
            {copy.notes.allTypes}
          </button>
          {Object.entries(noteTypes).map(([k, v]) => (
            <button key={k} type="button" className="chip" aria-pressed={type === k} onClick={() => set('type', k)}>
              {v.label}
            </button>
          ))}
        </div>
        <div className="notes__selects">
          <label className="field">
            <span className="field__label">{copy.note.domain}</span>
            <select
              id="filter-domain"
              className="input"
              value={params.get('domain') ?? ''}
              onChange={(e) => set('domain', e.target.value || undefined)}
            >
              <option value="">{copy.notes.allDomains}</option>
              {domains.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.code} {d.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">{copy.note.regions}</span>
            <select
              id="filter-region"
              className="input"
              value={params.get('region') ?? ''}
              onChange={(e) => set('region', e.target.value || undefined)}
            >
              <option value="">{copy.notes.allRegions}</option>
              {Object.entries(regions).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="field notes__search">
            <span className="field__label">{copy.notes.search}</span>
            <input id="filter-q" className="input" type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
        </div>
        {params.get('initiative') && (
          <div className="tags">
            <button type="button" className="chip" aria-pressed="true" onClick={() => set('initiative', undefined)}>
              {params.get('initiative')} ×
            </button>
          </div>
        )}
      </div>

      {error && <p className="error">{error}</p>}
      {data && (data.length ? <NoteList notes={data} /> : <p className="empty">{copy.notes.none}</p>)}
    </div>
  );
}
