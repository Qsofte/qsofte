import { clients } from '../content';

export default function Clients() {
  return (
    <section className="clients" aria-labelledby="clients-label">
      <div className="container">
        <p id="clients-label" className="clients__label">
          Trusted by businesses we&rsquo;re proud to work with
        </p>
        <ul className="clients__list">
          {clients.map((c) => (
            <li key={c.name}>
              <img src={c.logo} alt={c.name} loading="lazy" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
