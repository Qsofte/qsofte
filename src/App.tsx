import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import { a11y } from './content';
import About from './pages/About';
import Contact from './pages/Contact';
import Engineering from './pages/Engineering';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Privacy from './pages/Privacy';
import Products from './pages/Products';
import Samewe from './pages/Samewe';
import Srovi from './pages/Srovi';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        {a11y.skipToContent}
      </a>
      <ScrollToTop />
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/srovi" element={<Srovi />} />
          <Route path="/samewe" element={<Samewe />} />
          <Route path="/engineering" element={<Engineering />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          {/* Retired URLs. nginx answers these with a 301; these cover client-side links. */}
          <Route path="/services" element={<Navigate to="/engineering" replace />} />
          <Route path="/industries" element={<Navigate to="/engineering" replace />} />
          <Route path="/Connect" element={<Navigate to="/contact" replace />} />
          <Route path="/connect" element={<Navigate to="/contact" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
