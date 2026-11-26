import { Link } from 'react-router-dom';
import { api } from '../api';
import NoteList from '../components/NoteList';
import { copy, showUp } from '../content';
import { day } from '../format';
import { useLoad, usePageTitle } from '../useLoad';
import EventWhen from './EventWhen';
import './Today.css';

export default function TodayPage() {
  const { data, error } = useLoad(api.today, []);
  usePageTitle(data?.week ?? 'Today');

  return (
    <div className="page today container--narrow">
      <header className="page-head">
        <span className="eyebrow">{copy.today.eyebrow}</span>
        <div className="page-head__row">
          <h1 className="headline">{data?.week ?? ' '}</h1>
          <Link to="/notes/new" className="btn btn--primary">
            {copy.today.add}
          </Link>
        </div>
        <p className="lead">{copy.today.lead}</p>
      </header>
      {error && <p className="error">{error}</p>}
      {data && (
        <>
          <section className="block" aria-labelledby="t-signals">
            <h2 id="t-signals" className="title">
              {copy.today.signals}
            </h2>
            {data.signals.length ? (
              <NoteList notes={data.signals} />
            ) : (
              <p className="empty">{copy.today.noSignals}</p>
            )}
          </section>

          <section className="block" aria-labelledby="t-events">
            <h2 id="t-events" className="title">
              {copy.today.upcoming}
            </h2>
            {data.upcoming.length ? (
              <ul className="today__events">
                {data.upcoming.map((e) => (
                  <li key={e.id} className="today__event">
                    <span className="mono">
                      <EventWhen event={e} />
                    </span>
                    <span className="today__event-name">{e.name}</span>
                    <span className={`tag${e.level === 'speak' || e.level === 'host' ? ' tag--mark' : ''}`}>
                      {showUp[e.level].label}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty">{copy.today.noUpcoming}</p>
            )}
            <Link to="/events" className="link-more">
              {copy.events.title}
            </Link>
          </section>

          <section className="block" aria-labelledby="t-due">
            <h2 id="t-due" className="title">
              {copy.today.due}
            </h2>
            {!data.due_positions.length && !data.due_theses.length && (
              <p className="empty">{copy.today.nothingDue}</p>
            )}
            {data.due_positions.length > 0 && (
              <div className="today__due">
                <p className="muted small">{copy.today.positionsDue(data.due_positions.length)}</p>
                <div className="tags">
                  {data.due_positions.map((d) => (
                    <Link key={d.slug} to={`/domains/${d.slug}`} className="tag tag--due today__due-link">
                      {d.code} {d.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {data.due_theses.length > 0 && (
              <div className="today__due">
                <p className="muted small">{copy.today.thesesDue}</p>
                <ul className="today__events">
                  {data.due_theses.map((n) => (
                    <li key={n.id} className="today__event">
                      <span className="mono">{n.review_on ? day(n.review_on) : ''}</span>
                      <Link to={`/notes/${n.id}`} className="today__event-name">
                        {n.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

