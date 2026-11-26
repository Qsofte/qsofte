import { Link } from 'react-router-dom';
import { copy } from '../content';
import { usePageTitle } from '../useLoad';

export default function NotFound() {
  usePageTitle(copy.notFound.title);
  return (
    <div className="page container--narrow">
      <header className="page-head">
        <h1 className="headline">{copy.notFound.title}</h1>
        <p className="lead">{copy.notFound.lead}</p>
      </header>
      <Link to="/" className="link-more">
        {copy.notFound.home}
      </Link>
    </div>
  );
}
