import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => (
  <nav className="flex gap-4 p-4 bg-gray-100">
    <Link to="/" className="text-blue-600 font-bold">URL Shortener</Link>
    <Link to="/stats" className="text-blue-600 font-bold">Statistics</Link>
  </nav>
);

export default Navigation;
