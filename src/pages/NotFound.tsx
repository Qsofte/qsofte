import { Link } from 'react-router-dom';
import { notFound } from '../content';
import { usePageTitle } from '../usePageTitle';
import './NotFound.css';

export default function NotFound() {
  usePageTitle('Page not found');
  return (
    <section className="not-found">
      <div className="container">
        <h1 className="headline">{notFound.title}</h1>
        <p className="lead">{notFound.text}</p>
        <Link to="/" className="btn btn--primary">
          {notFound.action}
        </Link>
      </div>
    </section>
  );
}
