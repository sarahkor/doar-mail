import React, { useState, useEffect } from 'react';
import './ComposeDialog.css';
import trashIcon from '../assets/icons/trash.svg';
import attachmentIcon from '../assets/icons/attachment.svg';

function sanitizeDraft(draft, to) {
  return {
    to: draft?.to || to || '',
    subject: draft?.subject === '(no subject)' ? '' : (draft?.subject || ''),
    bodyPreview: draft?.bodyPreview === 'No content.' ? '' : (draft?.bodyPreview || '')
  };
}

function ComposeDialog({ onClose, refreshInbox, to = '', draft = null }) {
  const [form, setForm] = useState(draft ? sanitizeDraft(draft, to) : {
    to: to || '',
    subject: '',
    bodyPreview: ''
  });

  const [file, setFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState({ to: '' });
  const [existingAttachments, setExistingAttachments] = useState(draft?.attachments || []);

  useEffect(() => {
    if (draft) {
      setForm(sanitizeDraft(draft, to));
      setExistingAttachments(draft.attachments || []);
    }
  }, [draft, to]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    const isDraft = draft?.status === 'draft';
    const cleanTo = form.to.trim();

    // ✅ Reject send if no recipient
    if (!cleanTo) {
      setError({ to: "Please enter a recipient email address." });
      return;
    }

    setIsSending(true);

    try {
      let response, data;
      if (draft && draft.id) {
        const payload = {
          subject: form.subject,
          bodyPreview: form.bodyPreview,
          status: 'sent',
          to: cleanTo
        };

        response = await fetch(`/api/mails/${draft.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });

        data = response.status !== 204 ? await response.json() : {};
      } else {
        const formData = new FormData();
        formData.append('to', cleanTo);
        formData.append('subject', form.subject);
        formData.append('bodyPreview', form.bodyPreview);
        formData.append('status', 'sent');
        if (file) formData.append('attachments', file);

        response = await fetch('/api/mails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
          },
          body: formData
        });

        data = await response.json();
      }

      if (!response.ok) {
        const message = (data?.error || '').toLowerCase();

        if (message.includes("recipient")) {
          setError({ to: message.includes("exist") ? "Recipient does not exist." : "Recipient required." });
        } else if (message.includes("@doar.com")) {
          setError({ to: "Recipient must be a Doar user (e.g., user@doar.com)." });
        } else {
          alert(data?.error || "Failed to send mail.");
        }
        return;
      }

      refreshInbox?.();
      onClose();
    } catch (err) {
      alert("Network error: failed to send mail.");
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = async () => {
    const isTrulyEmpty = !form.to.trim() && !form.subject.trim() && !form.bodyPreview.trim() && !file;
    if (isTrulyEmpty) return onClose(); // nothing to save

    try {
      if (draft?.id) {
        const payload = {
          subject: form.subject,
          bodyPreview: form.bodyPreview,
          status: 'draft',
          to: form.to || '' // ✅ Always include 'to', even if empty
        };

        await fetch(`/api/mails/${draft.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        const formData = new FormData();
        formData.append('to', form.to || ''); // ✅ Always include 'to'
        formData.append('subject', form.subject);
        formData.append('bodyPreview', form.bodyPreview);
        formData.append('status', 'draft');
        if (file) formData.append('attachments', file);

        await fetch('/api/mails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
          },
          body: formData
        });
      }
    } catch (err) {
      console.warn("Failed to save draft:", err);
    } finally {
      refreshInbox?.();
      onClose();
    }
  };

  return (
    <div className="compose-overlay">
      <div className="compose-dialog">
        <h3 className="compose-title">{draft ? "Edit Draft" : "New Mail"}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          encType="multipart/form-data"
          noValidate
        >
          <label htmlFor="to" className="visually-hidden">To</label>
          <input
            id="to"
            type="email"
            name="to"
            placeholder="To"
            value={form.to}
            onChange={(e) => {
              if (!to) {
                handleChange(e);
                setError({ to: "" });
              }
            }}
            className={`compose-input ${error.to ? "is-invalid" : ""}`}
            aria-invalid={!!error.to}
            aria-describedby="to-error"
            readOnly={!!to}
          />
          {error.to && <div id="to-error" className="input-error">{error.to}</div>}

          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={handleChange}
            className="compose-input"
          />

          <textarea
            name="bodyPreview"
            placeholder="Body"
            value={form.bodyPreview}
            onChange={handleChange}
            rows={6}
            className="compose-textarea"
          />

          <div className="compose-actions">
            <div className="action-buttons">
              <button type="submit" className="action-button send-button" disabled={isSending}>
                {isSending ? 'Sending...' : 'Send'}
              </button>
              <button type="button" onClick={handleCancel} className="action-button cancel-button">
                Cancel
              </button>
            </div>

            <div className="attachment-section">
              {file && (
                <a
                  className="attached-filename"
                  href={URL.createObjectURL(file)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {file.name}
                </a>
              )}
              {existingAttachments.length > 0 && (
                <div className="existing-attachments">
                  {existingAttachments.map((att, idx) => (
                    <a
                      key={idx}
                      className="attached-filename"
                      href={`data:${att.mimetype};base64,${att.buffer}`}
                      download={att.originalName}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {att.originalName}
                    </a>
                  ))}
                </div>
              )}
              <label htmlFor="file-input" title="Attach a file">
                <img src={attachmentIcon} alt="Attach" className="attachment-icon" />
              </label>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                className="file-input-hidden"
              />
              <img
                src={trashIcon}
                alt="Discard"
                className="discard-icon"
                title="Discard and close"
                onClick={onClose}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComposeDialog;
