import { Link } from 'react-router-dom';
import { callToAction } from '../content';
import './CallToAction.css';

export default function CallToAction() {
  return (
    <section className="cta">
      <div className="container cta__inner">
        <h2 className="headline">{callToAction.title}</h2>
        <p className="lead">{callToAction.text}</p>
        <Link to="/contact" className="btn btn--primary">
          {callToAction.action}
        </Link>
      </div>
    </section>
  );
}
