import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import starIcon from '../../assets/icons/star.svg';
import fullStarIcon from '../../assets/icons/fullStar.svg';


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

  const username = sessionStorage.getItem("username");

  const isToMe = mail.to === username;
  const isFromMe = mail.from === username;

  // fallback: use email prefix if name is missing
  const toFullName = isToMe ? "Me" : mail.toName || mail.to;
  const fromFullName = isFromMe ? "Me" : mail.fromName || mail.from;


  return (
    <div style={{ padding: '2rem', maxWidth: '700px' }}>
      <h2 style={{ marginBottom: '1rem', display: "flex", alignItems: "center" }}>
        <img
          src={mail.starred ? fullStarIcon : starIcon}
          alt={mail.starred ? "Starred" : "Not starred"}
          className="star-icon"
          style={{ cursor: "pointer", marginRight: 12 }}
          tabIndex={0}
          onClick={async (e) => {
            e.preventDefault();
            try {
              const token = sessionStorage.getItem("token");
              const res = await fetch(`/api/starred/${mail.id}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
              });
              if (res.ok) setMail(m => ({ ...m, starred: !m.starred }));
            } catch (err) {
              alert("Failed to toggle star.");
            }
          }}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              // copy the above onClick logic here or factor it out to a function if you prefer
              (async () => {
                try {
                  const token = sessionStorage.getItem("token");
                  const res = await fetch(`/api/starred/${mail.id}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  if (res.ok) setMail(m => ({ ...m, starred: !m.starred }));
                } catch (err) {
                  alert("Failed to toggle star.");
                }
              })();
            }
          }}
        />
        {mail.subject || "(no subject)"}
      </h2>


      <div style={{ marginBottom: '1.5rem' }}>
        {mail.status !== 'draft' && (
          <div>
            <strong>From:</strong> {fromFullName}{" "}
            <span
              style={{ color: 'gray', cursor: 'pointer' }}
              onClick={() => onCompose(mail.from)}
            >
              &lt;{mail.from}&gt;
            </span>
          </div>
        )}

        {mail.to && (
          <div>
            <strong>To:</strong> {toFullName}{" "}
            <span
              style={{ color: 'gray', cursor: 'pointer' }}
              onClick={() => onCompose(mail.to)}
            >
              &lt;{mail.to}&gt;
            </span>
          </div>
        )}

        <div style={{ marginTop: '0.5rem' }}>
          <strong>Date:</strong> {formattedDate}
        </div>
      </div>


      <hr />

      <p style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
        {mail.bodyPreview?.trim() ? mail.bodyPreview : "No content."}
      </p>
      {mail.attachments && mail.attachments.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <strong>Attachments:</strong>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {mail.attachments.map((att, i) => (
              <li key={i}>
                <a
                  href={`data:${att.mimetype};base64,${att.buffer}`}
                  download={att.originalName}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#1976d2", textDecoration: "underline" }}
                >
                  {att.originalName}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MailDetail;
