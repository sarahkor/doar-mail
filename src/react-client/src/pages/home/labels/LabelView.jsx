import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import MailItem from '../../components/MailItem';
import ComposeDialog from '../../components/ComposeDialog';
import './LabelView.css';
import labelIcon from '../../assets/icons/label2.svg';

function LabelView() {
    const { labelId } = useParams();
    const location = useLocation();
    const [label, setLabel] = useState(null);
    const [mails, setMails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingDraft, setEditingDraft] = useState(null);
    const [showCompose, setShowCompose] = useState(false);

    // Fetch label data + mails
    const fetchLabelWithMails = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            const res = await fetch(`/api/labels/${labelId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch label');
            const data = await res.json();
            setLabel(data);
            const sorted = (data.mails || [])
                .slice()
                .sort((a, b) => b.timestamp - a.timestamp);
            setMails(sorted);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLabelWithMails();
    }, [labelId, location.pathname]);

    // Listen for custom labelUpdated events
    useEffect(() => {
        const handleLabelUpdate = (event) => {
            if (event.detail.labelId === labelId) {
                fetchLabelWithMails();
            }
        };
        window.addEventListener('labelUpdated', handleLabelUpdate);
        return () => window.removeEventListener('labelUpdated', handleLabelUpdate);
    }, [labelId]);

    // Refetch when tab regains focus
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) fetchLabelWithMails();
        };
        const handleFocus = () => fetchLabelWithMails();
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [labelId]);

    const handleDraftClick = (mail) => {
        setEditingDraft(mail);
        setShowCompose(true);
    };


    if (error) return <p className="text-danger">{error}</p>;
    if (!label) return <p>Label not found.</p>;

    return (
        <div className="label-view-wrapper">
            <div className="label-header">
                <div className="label-title">
                    <div
                        className="label-color-icon"
                        style={{
                            backgroundColor: label.color,
                            maskImage: `url(${labelIcon})`,
                            WebkitMaskImage: `url(${labelIcon})`
                        }}
                    />
                    <h2>{label.name}</h2>
                </div>
                <div className="label-count">
                    {mails.length} {mails.length === 1 ? 'email' : 'emails'}
                </div>
            </div>

            <div className="label-mails-container">
                {mails.length === 0 ? (
                    <div className="no-mails-message">
                        <p>No emails with this label yet.</p>
                        <p>Apply this label to emails to see them here.</p>
                    </div>
                ) : (
                    mails.map(mail => (
                        <MailItem
                            key={mail._id}
                            mail={mail}
                            folder={mail.folder}
                            onClick={mail.status === 'draft'
                                ? () => handleDraftClick(mail)
                                : undefined}
                            onStarToggle={fetchLabelWithMails}
                            onTrash={fetchLabelWithMails}
                        />
                    ))
                )}

                {showCompose && editingDraft && (
                    <ComposeDialog
                        onClose={() => {
                            setShowCompose(false);
                            setEditingDraft(null);
                        }}
                        draft={editingDraft}
                        refreshInbox={fetchLabelWithMails}
                    />
                )}
            </div>
        </div>
    );
}

export default LabelView;
