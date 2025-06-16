import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MailItem from '../../components/MailItem';
import './SearchPage.css';  // see CSS below

export default function SearchPage() {
  let [params] = useSearchParams();
  const q = params.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    fetch(`/api/search?query=${encodeURIComponent(q)}`)
      .then(r => {
        if (!r.ok) throw new Error('Search failed');
        return r.json();
      })
      .then(data => {
        setResults(data.mails || []);
        setError('');
      })
      .catch(e => {
        setError(e.message);
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="folder-wrapper">
      <div className="folder-card">
        {error && <p className="text-danger">{error}</p>}

        <h2 className="folder-title">
          Search Results for “{q}”
        </h2>

        {!loading && results.length === 0 && (
          <p className="no-mails">No mails found.</p>
        )}

        <div className="folder-scroll-container">
          {loading
            ? <p style={{ padding: '1rem' }}>Searching…</p>
            : results.map(m => (
              <MailItem
                key={m.id}
                mail={m}
                folder={m.folder}   /* if your API returns folder */
              />
            ))
          }
        </div>
      </div>
    </div>
  );
}
