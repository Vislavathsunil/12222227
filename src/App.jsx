import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Navigation from './Frontend Task Submission/Navigation';
import URLShortener from './Frontend Task Submission/URLShortener';
import Statistics from './Frontend Task Submission/Statistics';
import { getShortenedUrl, incrementVisit } from './services/urlShortenerService';

function RedirectHandler() {
  const { shortcode } = useParams();
  const navigate = useNavigate();
  React.useEffect(() => {
    const urlObj = getShortenedUrl(shortcode);
    if (urlObj) {
      const now = new Date();
      const expiry = new Date(urlObj.expiryDate);
      if (now < expiry) {
        incrementVisit(shortcode);
        window.location.href = urlObj.longUrl;
      } else {
        navigate('/stats', { state: { expired: true, shortcode } });
      }
    } else {
      navigate('/stats', { state: { notfound: true, shortcode } });
    }
  }, [shortcode, navigate]);
  return <div className="p-4">Redirecting...</div>;
}

const App = () => {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<URLShortener />} />
        <Route path="/stats" element={<Statistics />} />
        <Route path=":shortcode" element={<RedirectHandler />} />
      </Routes>
    </Router>
  );
}

export default App;
