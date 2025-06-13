import React, { useEffect, useState } from 'react';
import MailItem from '../../components/MailItem';

function MailFolder({ endpoint, title, folder }) {
  const [mails, setMails] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMails = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch mails");
        const data = await response.json();
        setMails(data.mails);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchMails();
    const interval = setInterval(fetchMails, 5000);
    return () => clearInterval(interval);
  }, [endpoint]); // endpoint is enough!

  if (error) return <p className="text-danger">{error}</p>;
  if (!mails.length) return <p>No mails found.</p>;

  return (
    <div className="inbox-wrapper">
      <h2>{title}</h2>
      <div className="inbox-scroll-container">
        {mails.map(mail => (
          <MailItem key={mail.id} mail={mail} folder={folder} />
        ))}
      </div>
    </div>
  );
}

export default MailFolder;
