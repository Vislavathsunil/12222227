import React from 'react';
import { Link } from 'react-router-dom';
import { getAllUrls } from '../services/urlShortenerService';

const Statistics = () => {
  const urls = getAllUrls();
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Shortened URLs Statistics</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2">Short URL</th>
            <th className="border px-2">Original URL</th>
            <th className="border px-2">Expiry</th>
            <th className="border px-2">Visits</th>
          </tr>
        </thead>
        <tbody>
          {urls.length === 0 && (
            <tr><td colSpan={4} className="text-center">No URLs shortened yet.</td></tr>
          )}
          {urls.map(u => (
            <tr key={u.shortcode}>
              <td className="border px-2">
                <Link to={`/${u.shortcode}`} className="text-blue-600 underline">{window.location.origin}/{u.shortcode}</Link>
              </td>
              <td className="border px-2">{u.longUrl}</td>
              <td className="border px-2">{new Date(u.expiryDate).toLocaleString()}</td>
              <td className="border px-2">{u.visits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Statistics;
