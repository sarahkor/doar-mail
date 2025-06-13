import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function MailDetail({ onCompose }) {
  const { mailId } = useParams();
  const [mail, setMail] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMail = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(`/api/mails/${mailId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to load mail");
        const data = await res.json();
        setMail(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchMail();
  }, [mailId]);

  if (error) return <p className="text-danger">{error}</p>;
  if (!mail) return <p>Loading mail...</p>;

  const dateObj = new Date(mail.timestamp);
  const formattedDate = isNaN(dateObj)
    ? "Invalid Date"
    : `${dateObj.toLocaleDateString()} at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <div style={{ padding: '2rem', maxWidth: '700px' }}>
      <h2 style={{ marginBottom: '1rem' }}>{mail.subject || "(no subject)"}</h2>

      <div style={{ marginBottom: '1.5rem' }}>
        <div>
          <strong>From:</strong> {mail.fromName || "Unknown"}{" "}
          <span
            style={{ color: 'gray', cursor: 'pointer' }}
            onClick={() => onCompose(mail.from)}
          >
            &lt;{mail.from}&gt;
          </span>
        </div>
        <div>
          <strong>To:</strong> {mail.toName || "You"}{" "}
          <span
            style={{ color: 'gray', cursor: 'pointer' }}
            onClick={() => onCompose(mail.to)}
          >
            &lt;{mail.to}&gt;
          </span>
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <strong>Date:</strong> {formattedDate}
        </div>
      </div>

      <hr />

      <p style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
        {mail.bodyPreview?.trim() ? mail.bodyPreview : "No content."}
      </p>
    </div>
  );
}

export default MailDetail;
