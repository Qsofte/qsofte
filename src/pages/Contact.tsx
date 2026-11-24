import { FormEvent, useState } from 'react';
import { company, contactPage as copy } from '../content';
import { usePageTitle } from '../usePageTitle';
import './Contact.css';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function Contact() {
  usePageTitle('Contact');
  const [status, setStatus] = useState<Status>('idle');

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
            {status === 'error' && (
              <p className="contact-page__error" role="alert">
                {copy.error} {company.email}.
              </p>
            )}
            <button className="btn btn--primary" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? copy.sending : copy.submit}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
