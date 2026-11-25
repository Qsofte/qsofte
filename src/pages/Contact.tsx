import { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { company, contactPage as copy, topics } from '../content';
import { usePageMeta } from '../usePageMeta';
import './Contact.css';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function Contact() {
  usePageMeta('/contact');
  const [status, setStatus] = useState<Status>('idle');
  const [params] = useSearchParams();
  const [topic, setTopic] = useState(topics[0].value);

  // The page is prerendered without a query string; apply ?topic= after hydration.
  useEffect(() => {
    const wanted = params.get('topic');
    if (wanted && topics.some((t) => t.value === wanted)) setTopic(wanted);
  }, [params]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(company.formEndpoint, {
        method: 'POST',
        body: new FormData(e.currentTarget),
        headers: { Accept: 'application/json' },
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="contact-page">
      <section className="container contact-page__grid">
        <div className="contact-page__intro">
          <h1 className="display">{copy.title}</h1>
          <p className="lead">{copy.lead}</p>
          <dl>
            <div>
              <dt>{copy.labels.email}</dt>
              <dd>
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </dd>
            </div>
            <div>
              <dt>{copy.labels.phone}</dt>
              <dd>
                <a href={company.phoneHref}>{company.phone}</a>
              </dd>
            </div>
            <div>
              <dt>{copy.labels.office}</dt>
              <dd>{company.address.join(', ')}</dd>
            </div>
          </dl>
        </div>

        {status === 'sent' ? (
          <div className="contact-page__sent" role="status">
            <h2 className="headline">{copy.sentTitle}</h2>
            <p className="lead">{copy.sentText}</p>
          </div>
        ) : (
          <form
            className="contact-page__form"
            action={company.formEndpoint}
            method="POST"
            onSubmit={onSubmit}
            aria-label={copy.formLabel}
          >
            <div className="contact-page__field">
              <label htmlFor="topic">{copy.fields.topic}</label>
              <select id="topic" name="topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
                {topics.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="contact-page__field">
              <label htmlFor="name">{copy.fields.name}</label>
              <input id="name" name="name" autoComplete="name" required />
            </div>
            <div className="contact-page__field">
              <label htmlFor="email">{copy.fields.email}</label>
              <input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="contact-page__row">
              <div className="contact-page__field">
                <label htmlFor="phone">{copy.fields.phone}</label>
                <input id="phone" name="phone" type="tel" autoComplete="tel" />
              </div>
              <div className="contact-page__field">
                <label htmlFor="company">{copy.fields.company}</label>
                <input id="company" name="company" autoComplete="organization" />
              </div>
            </div>
            <div className="contact-page__field">
              <label htmlFor="message">{copy.fields.message}</label>
              <textarea id="message" name="message" rows={5} required />
            </div>
            {/* Spam trap: hidden from people and assistive technology; bots fill it in. */}
            <div className="contact-page__trap" aria-hidden="true">
              <label htmlFor="gotcha">{copy.honeypot}</label>
              <input id="gotcha" name="_gotcha" tabIndex={-1} autoComplete="off" />
            </div>
            {status === 'error' && (
              <p className="contact-page__error" role="alert">
                {copy.error} <a href={`mailto:${company.email}`}>{company.email}</a>.
              </p>
            )}
            <button className="btn btn--primary" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? copy.sending : copy.submit}
            </button>
            <p className="contact-page__privacy">
              {copy.privacyNote} <Link to="/privacy">{copy.privacyLink}</Link>
            </p>
          </form>
        )}
      </section>
    </div>
  );
}
