import { clients, home } from '../content';
import './Clients.css';

export default function Clients() {
  return (
    <section className="clients" aria-labelledby="clients-label">
      <div className="container">
        <p id="clients-label" className="eyebrow clients__label">
          {home.clientsLabel}
        </p>
        <ul className="clients__list">
          {clients.map((c) => (
            <li key={c.name}>
              <img src={c.logo} alt={c.name} width={c.width} height={c.height} loading="lazy" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
