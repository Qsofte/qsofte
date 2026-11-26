import { Link } from 'react-router-dom';
import type { Note } from '../api';
import { copy, noteTypes, regions } from '../content';
import { day } from '../format';
import './NoteList.css';

export default function NoteList({ notes, showDomain = true }: { notes: Note[]; showDomain?: boolean }) {
  return (
    <ul className="note-list">
      {notes.map((n) => (
        <li key={n.id} className="note-list__item">
          <div className="note-list__meta">
            <span className="mono">{day(n.occurred_on)}</span>
            <span className="tag">{noteTypes[n.type].label}</span>
            {showDomain && <span className="tag">{n.domain_code}</span>}
            {n.regions.map((r) => (
              <span key={r} className="tag">
                {regions[r]}
              </span>
            ))}
          </div>
          <Link to={`/notes/${n.id}`} className="note-list__title">
            {n.title}
          </Link>
          <p className="note-list__sowhat">
            <span className="note-list__label">{copy.notes.soWhat}: </span>
            {n.so_what}
          </p>
        </li>
      ))}
    </ul>
  );
}
