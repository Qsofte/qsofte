import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import Markdown from '../components/Markdown';
import { copy, guideLevels } from '../content';
import { day } from '../format';
import { useLoad, usePageTitle } from '../useLoad';
import './Guide.css';

export default function GuidePage() {
  const { slug = '' } = useParams();
  const { data: g, error } = useLoad(() => api.guide(slug), [slug]);
  const initiatives = useLoad(api.initiatives, []).data ?? [];
  const t = copy.library;
  usePageTitle(g?.title ?? t.title);
  if (error) return <p className="page error">{error}</p>;
  if (!g) return null;
  const related = initiatives.filter((i) => g.initiative_slugs.includes(i.slug));

  return (
    <article className="page guide container--narrow">
      <header className="page-head">
        <Link to="/library" className="eyebrow crumb">
          {t.back}
        </Link>
        <div className="tags">
          <span className="tag">{guideLevels[g.level]}</span>
          {g.domain_slug && (
            <Link to={`/domains/${g.domain_slug}`} className="tag guide__tag-link">
              {g.domain_code}
            </Link>
          )}
        </div>
        <h1 className="headline">{g.title}</h1>
        <p className="lead">{g.summary}</p>
      </header>
      <p className={g.status === 'draft' ? 'guide__status guide__status--draft' : 'guide__status'}>
        {g.status === 'draft' ? t.draftNote : t.reviewedNote(g.updated_by, day(g.updated_at))}
      </p>
      <Markdown source={g.body} />
      {related.length > 0 && (
        <section className="block">
          <h2 className="title">{t.related}</h2>
          <div className="tags">
            {related.map((i) => (
              <Link key={i.slug} to={`/landscape/${i.slug}`} className="tag guide__tag-link">
                {i.name}
              </Link>
            ))}
          </div>
        </section>
      )}
      <div className="actions">
        <Link to={`/library/${g.slug}/edit`} className="btn btn--secondary">
          {t.edit}
        </Link>
      </div>
    </article>
  );
}
