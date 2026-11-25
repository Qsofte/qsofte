import { Link } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import { products, productsPage as copy } from '../content';
import { usePageTitle } from '../usePageTitle';
import './Products.css';

export default function Products() {
  usePageTitle(copy.title);
  return (
    <div className="products">
      <section className="products__hero">
        <div className="container">
          <h1 className="display">{copy.title}</h1>
          <p className="lead">{copy.lead}</p>
        </div>
      </section>

      <section className="products__list">
        <div className="container">
          {products.map((p) => (
            <article key={p.slug} id={p.slug} className="products__item">
              <div className="products__name">
                <span className="eyebrow">{p.category}</span>
                <h2>
                  {p.logo ? (
                    <img src={p.logo} alt={p.name} className="products__logo" width={196} height={60} />
                  ) : (
                    p.name
                  )}
                </h2>
                {p.fullName && <p className="products__full">{p.fullName}</p>}
              </div>
              <div className="products__body">
                <p className="products__tagline">{p.tagline}</p>
                <span className="eyebrow">{copy.problemLabel}</span>
                <p>{p.problem}</p>
                <Link to={p.to} className="link-more">
                  {p.action}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CallToAction />
    </div>
  );
}
