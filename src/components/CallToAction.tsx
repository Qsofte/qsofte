import { Link } from 'react-router-dom';

export default function CallToAction() {
  return (
    <section className="section section--cta">
      <div className="container">
        <div className="cta">
          <div>
            <h2>Have a project in mind?</h2>
            <p>Tell us what you&rsquo;re trying to achieve. We&rsquo;ll come back to you with ideas and next steps.</p>
          </div>
          <Link to="/contact" className="btn btn--primary">
            Start a conversation
          </Link>
        </div>
      </div>
    </section>
  );
}
