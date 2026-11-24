import { Link } from 'react-router-dom';
import { usePageTitle } from '../usePageTitle';

export default function NotFound() {
  usePageTitle('Page not found');
  return (
    <section className="container not-found">
      <span className="eyebrow">404</span>
      <h1>We couldn&rsquo;t find that page</h1>
      <p>It may have moved. Try the home page instead.</p>
      <Link to="/" className="btn btn--dark">
        Back to home
      </Link>
    </section>
  );
}
