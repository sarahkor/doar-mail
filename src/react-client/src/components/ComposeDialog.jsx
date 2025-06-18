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

/**
 * ComposeDialog allows creating or editing a mail (draft or new).
 * It supports:
 * - Sending mail
 * - Saving drafts
 * - Uploading attachments
 * - Input validation
 */
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

  /**
   * Handle "Send" button:
   * - Sends new mail (POST) or updates draft (PATCH)
   * - Validates recipient
   * - Handles attachments
   */
  const handleSubmit = async () => {
    const cleanTo = form.to.trim();

    if (!cleanTo) {
      setError({ to: "Please enter a recipient email address." });
      return;
    }

    setIsSending(true);

    try {
      let response, data;
      // Update existing draft to 'sent'
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
        // Send new mail
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
        // validation messages
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

  /**
   * Handle "Cancel" button:
   * - Save mail as draft if partially filled
   * - Reject save if recipient is empty
   */
  const handleCancel = async () => {
    const cleanTo = form.to.trim();
    const hasAnyContent =
      !!cleanTo ||
      !!form.subject.trim() ||
      !!form.bodyPreview.trim() ||
      !!file;

    // If there’s absolutely nothing to save, just close
    if (!hasAnyContent) {
      return onClose();
    }

    // If some content exists but recipient is missing, show error
    if (!cleanTo) {
      setError({ to: "Please enter a recipient email address in order to save a draft. You can discard the email instead." });
      return;
    }

    setIsSending(true);
    try {
      let response, data = {};

      if (draft?.id) {
        // Update existing draft
        response = await fetch(`/api/mails/${draft.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            to: cleanTo,
            subject: form.subject,
            bodyPreview: form.bodyPreview,
            status: 'draft',
          }),
        });
        if (response.status !== 204) {
          data = await response.json();
        }
      } else {
        // Create new draft
        const formData = new FormData();
        formData.append('to', cleanTo);
        formData.append('subject', form.subject);
        formData.append('bodyPreview', form.bodyPreview);
        formData.append('status', 'draft');
        if (file) formData.append('attachments', file);

        response = await fetch('/api/mails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
          body: formData,
        });
        data = await response.json();
      }

      // Handle server-side validation errors
      if (!response.ok) {
        const message = (data.error || '').toLowerCase();
        if (message.includes('recipient')) {
          setError({ to: message.includes('exist') ? 'Recipient does not exist. you must enter an existing doar user in order to save a draft, You can discard the email instead.' : 'Recipient required.' });
        } else if (message.includes('@doar.com')) {
          setError({
            to:
              'Recipient must be an existing Doar user (e.g., user@doar.com) to save a draft. You can discard the email instead.',
          });
        } else {
          alert(data.error || 'Failed to save draft.');
        }
        return;
      }

      // Success
      refreshInbox?.();
      onClose();
    } catch (err) {
      console.warn('Failed to save draft:', err);
      alert('Something went wrong while trying to save the draft.');
    } finally {
      setIsSending(false);
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

              <div className="tooltip-container">
                <label htmlFor="file-input">
                  <img
                    src={attachmentIcon}
                    alt="Attach"
                    className="attachment-icon"
                  />
                </label>
                <div className="tooltip-text">Attach a file</div>
              </div>

              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                className="file-input-hidden"
              />
              <div className="tooltip-container">
                <img
                  src={trashIcon}
                  alt="Discard"
                  className="discard-icon"
                  title="Discard without saving"
                  onClick={onClose}
                />
                <div className="tooltip-text">Discard without saving</div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComposeDialog;
