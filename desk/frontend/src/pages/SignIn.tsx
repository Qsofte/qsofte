import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth';
import { brand, copy } from '../content';
import { usePageTitle } from '../useLoad';
import './SignIn.css';

export default function SignIn() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  usePageTitle(copy.signIn.title);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <main className="sign-in">
      <form className="sign-in__card form" onSubmit={submit} noValidate>
        <div className="page-head">
          <span className="eyebrow">
            {brand.by} · {brand.name}
          </span>
          <h1 className="headline">{copy.signIn.title}</h1>
          <p className="muted">{copy.signIn.lead}</p>
        </div>
        <label className="field">
          <span className="field__label">{copy.signIn.email}</span>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field__label">{copy.signIn.password}</span>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn--primary" type="submit" disabled={busy || !email || !password}>
          {busy ? copy.signIn.working : copy.signIn.submit}
        </button>
      </form>
    </main>
  );
}
