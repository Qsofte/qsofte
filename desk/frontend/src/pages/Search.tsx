import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, type Answer, type SearchHit } from '../api';
import Markdown from '../components/Markdown';
import { copy, hitKinds } from '../content';
import { day } from '../format';
import { useLoad, usePageTitle } from '../useLoad';
import './Search.css';

function HitTitle({ hit }: { hit: SearchHit }) {
  return hit.href.startsWith('/') ? (
    <Link to={hit.href} className="search__title">
      {hit.title}
    </Link>
  ) : (
    <a href={hit.href} target="_blank" rel="noreferrer" className="search__title">
      {hit.title}
    </a>
  );
}

// The server marks matching words between \u0002 and \u0003.
export function Highlighted({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\u0002[^\u0003]*\u0003)/).map((part, i) =>
        part.startsWith('\u0002') ? <mark key={i}>{part.slice(1, -1)}</mark> : part,
      )}
    </>
  );
}

function Hits({ hits, numbered = false }: { hits: SearchHit[]; numbered?: boolean }) {
  return (
    <ol className={`search__hits${numbered ? ' search__hits--numbered' : ''}`}>
      {hits.map((h, n) => (
        <li key={`${h.kind}-${h.id}`} id={numbered ? `source-${n + 1}` : undefined} className="search__hit">
          <div className="search__meta">
            {numbered && <span className="search__num">{n + 1}</span>}
            <span className="tag">{hitKinds[h.kind]}</span>
            {h.date && <span className="mono">{day(h.date)}</span>}
          </div>
          <HitTitle hit={h} />
          <p className="search__snippet">
            <Highlighted text={h.snippet} />
          </p>
        </li>
      ))}
    </ol>
  );
}

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const wantsAnswer = params.get('ask') === '1';
  const [text, setText] = useState(q);
  const results = useLoad(() => (q.trim() ? api.search(q) : Promise.resolve(null)), [q]);
  const askOn = useLoad(api.askStatus, []).data?.enabled ?? false;
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const t = copy.search;
  usePageTitle(q ? `${q} · ${t.title}` : t.title);

  useEffect(() => setText(q), [q]);

  useEffect(() => {
    if (!wantsAnswer || !q.trim() || !askOn) return;
    let live = true;
    setAsking(true);
    setAnswer(null);
    setAskError(null);
    api
      .ask(q)
      .then((a) => live && setAnswer(a))
      .catch((e: unknown) => live && setAskError(e instanceof Error ? e.message : String(e)))
      .finally(() => live && setAsking(false));
    return () => {
      live = false;
    };
  }, [q, wantsAnswer, askOn]);

  function go(e: FormEvent, ask: boolean) {
    e.preventDefault();
    const next = new URLSearchParams();
    if (text.trim()) next.set('q', text.trim());
    if (ask) next.set('ask', '1');
    setParams(next);
  }

  return (
    <div className="page search container--narrow">
      <header className="page-head">
        <h1 className="headline">{t.title}</h1>
        <p className="lead">{t.lead}</p>
      </header>
      <form className="search__form" onSubmit={(e) => go(e, false)} role="search">
        <label className="field search__field">
          <span className="field__label">{t.label}</span>
          <input id="search-q" className="input" type="search" value={text} placeholder={t.placeholder} onChange={(e) => setText(e.target.value)} />
        </label>
        <div className="actions">
          <button type="submit" className="btn btn--secondary" disabled={!text.trim()}>
            {t.search}
          </button>
          {askOn && (
            <button type="button" className="btn btn--primary" disabled={!text.trim() || asking} onClick={(e) => go(e, true)}>
              {asking ? t.asking : t.ask}
            </button>
          )}
        </div>
        <p className="field__hint">{askOn ? t.askLead : t.askOff}</p>
      </form>

      {(asking || answer || askError) && (
        <section className="search__answer" aria-live="polite" aria-labelledby="s-answer">
          <h2 id="s-answer" className="title">
            {t.answerTitle}
          </h2>
          {asking && <p className="muted">{t.asking}</p>}
          {askError && <p className="error">{askError}</p>}
          {answer && (
            <>
              <Markdown source={answer.answer} citeHref={(n) => `#source-${n}`} />
              {answer.model && <p className="mono">{t.from(answer.model)}</p>}
              {answer.sources.length > 0 && (
                <div className="block">
                  <h3>{t.sources}</h3>
                  <Hits hits={answer.sources} numbered />
                </div>
              )}
            </>
          )}
        </section>
      )}

      {results.error && <p className="error">{results.error}</p>}
      {results.data && !answer && (
        <section className="block" aria-label={t.results(results.data.hits.length)}>
          {results.data.corrected && (
            <p className="search__note">
              {t.corrected} <strong>{results.data.corrected}</strong>
            </p>
          )}
          {results.data.fuzzy && <p className="search__note">{t.fuzzy}</p>}
          <p className="mono">{t.results(results.data.hits.length)}</p>
          {results.data.hits.length ? <Hits hits={results.data.hits} /> : <p className="empty">{t.none}</p>}
        </section>
      )}
    </div>
  );
}
