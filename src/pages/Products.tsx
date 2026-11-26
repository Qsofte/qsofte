import { Link } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import ProductMark from '../components/ProductMark';
import StatusTag from '../components/StatusTag';
import { products, productsPage as copy } from '../content';
import { usePageMeta } from '../usePageMeta';
import './Products.css';

export default function Products() {
  usePageMeta('/products');
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
                <h2>
                  <ProductMark name={p.name} logo={p.logo} />
                </h2>
                <p className="products__byline">
                  {copy.byline} · {p.sector}
                </p>
                <StatusTag status={p.status} />
              </div>
              <div className="products__body">
                <p className="products__tagline">{p.tagline}</p>
                <dl>
                  <div>
                    <dt>{copy.problemLabel}</dt>
                    <dd>{p.problem}</dd>
                  </div>
                  <div>
                    <dt>{copy.audienceLabel}</dt>
                    <dd>{p.audience}</dd>
                  </div>
                </dl>
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
