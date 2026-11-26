import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Domain } from '../api';
import { capabilityLevels, copy } from '../content';
import { useLoad, usePageTitle } from '../useLoad';
import './Capabilities.css';

export default function Capabilities() {
  const { data, error, setData } = useLoad(api.domains, []);
  usePageTitle(copy.capabilities.title);
  const replace = (d: Domain) => setData((list) => list?.map((x) => (x.slug === d.slug ? { ...x, ...d } : x)) ?? null);

  return (
    <div className="page capabilities">
      <header className="page-head">
        <h1 className="headline">{copy.capabilities.title}</h1>
        <p className="lead">{copy.capabilities.lead}</p>
      </header>
      {error && <p className="error">{error}</p>}
      {data && (
        <>
          <div className="capabilities__wrap">
            <table className="capabilities__matrix">
              <thead>
                <tr>
                  <th scope="col">{copy.domains.title}</th>
                  {capabilityLevels.map((l) => (
                    <th key={l.label} scope="col" title={l.hint}>
                      {l.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.slug}>
                    <th scope="row">
                      <Link to={`/domains/${d.slug}`}>
                        <span className="mono">{d.code}</span> {d.name}
                      </Link>
                    </th>
                    {capabilityLevels.map((l, i) => (
                      <td key={l.label}>
                        <button
                          type="button"
                          className={`capabilities__cell${i <= d.capability_level ? ' capabilities__cell--on' : ''}`}
                          aria-pressed={i === d.capability_level}
                          aria-label={`${d.name}: ${l.label}`}
                          onClick={() => api.updateDomain(d.slug, { capability_level: i }).then(replace)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="capabilities__legend">
            {capabilityLevels.map((l) => (
              <li key={l.label}>
                <strong>{l.label}</strong> <span className="muted">{l.hint}</span>
              </li>
            ))}
          </ul>
          <section className="block">
            <h2 className="title">{copy.capabilities.evidence}</h2>
            <ul className="capabilities__evidence">
              {data.map((d) => (
                <Evidence key={d.slug} domain={d} onSaved={replace} />
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function Evidence({ domain, onSaved }: { domain: Domain; onSaved: (d: Domain) => void }) {
  const [text, setText] = useState(domain.capability_evidence);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | string>('idle');
  const dirty = text.trim() !== domain.capability_evidence;
  return (
    <li className="capabilities__row">
      <label className="field">
        <span className="field__label">
          {domain.code} {domain.name} · {capabilityLevels[domain.capability_level].label}
        </span>
        <textarea
          id={`evidence-${domain.slug}`}
          className="input"
          rows={2}
          placeholder={copy.capabilities.evidenceHint}
          value={text}
          onChange={(e) => (setText(e.target.value), setState('idle'))}
        />
      </label>
      <div className="actions">
        <button
          type="button"
          className="btn btn--secondary"
          disabled={!dirty || state === 'saving'}
          onClick={() => {
            setState('saving');
            api
              .updateDomain(domain.slug, { capability_evidence: text })
              .then((d) => (onSaved(d), setState('saved')))
              .catch((e: unknown) => setState(e instanceof Error ? e.message : String(e)));
          }}
        >
          {copy.capabilities.save}
        </button>
        {state === 'saved' && <span className="muted small">{copy.domain.saved}</span>}
        {state !== 'idle' && state !== 'saved' && state !== 'saving' && <span className="error">{state}</span>}
      </div>
    </li>
  );
}
