import React, { useEffect, useState, useRef } from 'react';
import MailItem from '../../components/MailItem';

function Inbox() {
  const [mails, setMails] = useState([]);
  const [error, setError] = useState("");
  const prevMailCount = useRef(0);

  const fetchInbox = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("/api/inbox", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to fetch inbox");

      const data = await response.json();

      prevMailCount.current = data.mails.length;
      setMails(data.mails);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 5000);
    return () => clearInterval(interval);
  }, []);

  if (error) return <p className="text-danger">{error}</p>;
  if (!mails.length) return <p>No mails found.</p>;

  return (
    <div className="inbox-wrapper">
      <h2>Inbox</h2>
      <div className="inbox-scroll-container">
        {mails.map(mail => (
          <MailItem key={mail.id} mail={mail} />
        ))}
      </div>
    </div>
  );
}

export default Inbox;