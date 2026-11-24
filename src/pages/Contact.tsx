import { FormEvent, useState } from 'react';
import { company } from '../content';
import { usePageTitle } from '../usePageTitle';

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
    <>
      <section className="hero hero--page">
        <div className="container">
          <span className="eyebrow">Contact</span>
          <h1>Let&rsquo;s build something great together</h1>
          <p className="hero__lead">
            Tell us a little about your project or challenge and we&rsquo;ll get back to you.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <dl className="contact-details">
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                <a href={company.phoneHref}>{company.phone}</a>
              </dd>
            </div>
            <div>
              <dt>Office</dt>
              <dd>
                {company.address.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </dd>
            </div>
          </dl>

          {status === 'sent' ? (
            <div className="form form-success" role="status">
              <h2>Thanks, message received!</h2>
              <p>We&rsquo;ll be in touch soon.</p>
            </div>
          ) : (
            <form
              className="form"
              action={company.formEndpoint}
              method="POST"
              onSubmit={onSubmit}
              aria-label="Contact form"
            >
              <div className="form__row">
                <div className="field">
                  <label htmlFor="name">Name</label>
                  <input id="name" name="name" autoComplete="name" required />
                </div>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" autoComplete="email" required />
                </div>
              </div>
              <div className="form__row">
                <div className="field">
                  <label htmlFor="phone">Phone (optional)</label>
                  <input id="phone" name="phone" type="tel" autoComplete="tel" />
                </div>
                <div className="field">
                  <label htmlFor="company">Company (optional)</label>
                  <input id="company" name="company" autoComplete="organization" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="message">How can we help?</label>
                <textarea id="message" name="message" required />
              </div>
              {status === 'error' && (
                <p className="form__status form__status--error" role="alert">
                  Sorry, something went wrong. Please email us at {company.email}.
                </p>
              )}
              <div>
                <button className="btn btn--dark" type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
