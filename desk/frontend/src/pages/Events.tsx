import { Link } from 'react-router-dom';
import { api, type DeskEvent } from '../api';
import { copy, eventStatus, showUp } from '../content';
import { monthSlot, nextTwelveMonths } from '../format';
import { useLoad, usePageTitle } from '../useLoad';
import EventWhen from './EventWhen';
import './Events.css';

const marked = (e: DeskEvent) => e.level === 'speak' || e.level === 'host';

export default function Events() {
  const { data, error } = useLoad(api.events, []);
  usePageTitle(copy.events.title);
  const slots = nextTwelveMonths();
  const t = copy.events;

  return (
    <div className="page events">
      <header className="page-head">
        <div className="page-head__row">
          <h1 className="headline">{t.title}</h1>
          <Link to="/events/new" className="btn btn--primary">
            {t.add}
          </Link>
        </div>
        <p className="lead">{t.lead}</p>
      </header>
      {error && <p className="error">{error}</p>}
      {data && (
        <>
          <section className="block" aria-labelledby="e-strip">
            <div className="page-head__row">
              <h2 id="e-strip" className="title">
                {t.strip}
              </h2>
              <span className="events__key">
                <span className="events__dot events__dot--mark" aria-hidden="true" /> {t.stripKey}
              </span>
            </div>
            <div className="events__strip-wrap">
              <ol className="events__strip">
                {slots.map((s, i) => {
                  const inMonth = data.filter((e) => e.level !== 'skip' && monthSlot(e.next_on) === i);
                  return (
                    <li key={`${s.year}-${s.month}`} className="events__month">
                      <span className="events__month-label">
                        {s.label}
                        {s.month === 1 || i === 0 ? <span className="events__year"> {s.year}</span> : null}
                      </span>
                      <span className="events__dots">
                        {inMonth.map((e) => (
                          <span
                            key={e.id}
                            className={`events__dot${marked(e) ? ' events__dot--mark' : ''}`}
                            title={e.name}
                          />
                        ))}
                      </span>
                      <span className="events__names">
                        {inMonth.map((e) => (
                          <span key={e.id}>{e.name}</span>
                        ))}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>

          {data.length ? (
            <ul className="events__list">
              {data.map((e) => (
                <li key={e.id} className="events__item">
                  <div className="events__when mono">
                    <EventWhen event={e} />
                    {e.city && <span> · {e.city}</span>}
                  </div>
                  <div className="events__body">
                    <div className="events__head">
                      <h3 className="events__name">
                        {e.url ? (
                          <a href={e.url} target="_blank" rel="noreferrer">
                            {e.name}
                          </a>
                        ) : (
                          e.name
                        )}
                      </h3>
                      <span className="tags">
                        <span className={`tag${marked(e) ? ' tag--mark' : ''}`}>{showUp[e.level].label}</span>
                        <span className="tag">{eventStatus[e.status]}</span>
                        {e.domain_codes.map((c) => (
                          <span key={c} className="tag">
                            {c}
                          </span>
                        ))}
                      </span>
                    </div>
                    {e.why && <p className="muted small">{e.why}</p>}
                    {e.goal && (
                      <p className="small">
                        <strong>{copy.event.goal}:</strong> {e.goal}
                      </p>
                    )}
                    <div className="actions">
                      <Link to={`/events/${e.id}/edit`} className="link-more small">
                        {t.edit}
                      </Link>
                      {e.debrief_count > 0 ? (
                        <Link to={`/notes?type=debrief`} className="link-more small">
                          {t.debriefs(e.debrief_count)}
                        </Link>
                      ) : (
                        <Link to={`/notes/new?type=debrief&event=${e.id}`} className="link-more small">
                          {t.writeDebrief}
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">{t.none}</p>
          )}
        </>
      )}
    </div>
  );
}
