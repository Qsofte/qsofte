import { useState, type FormEvent } from 'react';
import { api } from '../api';
import { useAuth } from '../auth';
import { copy } from '../content';
import { usePageTitle } from '../useLoad';

export default function Account() {
  const { state, signedOut } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const t = copy.account;
  usePageTitle(t.title);

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      await api.changePassword(current, next);
      setCurrent('');
      setNext('');
      setMessage({ ok: true, text: t.done });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : String(err) });
    }
  }

  return (
    <div className="page container--narrow">
      <header className="page-head">
        <h1 className="headline">{t.title}</h1>
        {state.status === 'signed-in' && (
          <p className="lead">
            {state.user.name} · {state.user.email}
          </p>
        )}
      </header>
      <form className="form" onSubmit={submit}>
        <h2 className="title">{t.change}</h2>
        <input type="text" autoComplete="username" hidden readOnly value={state.status === 'signed-in' ? state.user.email : ''} />
        <label className="field">
          <span className="field__label">{t.current}</span>
          <input id="current-password" className="input" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">{t.next}</span>
          <input id="new-password" className="input" type="password" autoComplete="new-password" minLength={12} value={next} onChange={(e) => setNext(e.target.value)} />
          <span className="field__hint">{t.nextHint}</span>
        </label>
        {message && <p className={message.ok ? 'muted' : 'error'} role="status">{message.text}</p>}
        <div className="actions">
          <button type="submit" className="btn btn--primary" disabled={!current || next.length < 12}>
            {t.save}
          </button>
        </div>
      </form>
      <hr className="rule" />
      <div className="actions">
        <button type="button" className="btn btn--secondary" onClick={() => api.logoutEverywhere().finally(signedOut)}>
          {t.everywhere}
        </button>
      </div>
    </div>
  );
}
