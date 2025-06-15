import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import MailItem from '../../components/MailItem';
import './LabelView.css';
import labelIcon from '../../assets/icons/label2.svg';

function LabelView() {
    const { labelId } = useParams();
    const location = useLocation();
    const [label, setLabel] = useState(null);
    const [mails, setMails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchLabelWithMails();
    }, [labelId, location.pathname]); // Re-fetch when labelId or route changes

    // Listen for label updates from other components
    useEffect(() => {
        const handleLabelUpdate = (event) => {
            if (event.detail.labelId === parseInt(labelId)) {
                // If the current label was updated, refetch its data
                fetchLabelWithMails();
            }
        };

        // Listen for the custom event
        window.addEventListener('labelUpdated', handleLabelUpdate);

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener('labelUpdated', handleLabelUpdate);
        };
    }, [labelId]);

    // Also re-fetch when the component becomes visible again
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchLabelWithMails();
            }
        };

        const handleFocus = () => {
            fetchLabelWithMails();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [labelId]);

    const fetchLabelWithMails = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("token");
            const response = await fetch(`/api/labels/${labelId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch label");
            }

            const data = await response.json();
            console.log('Fetched label data:', data); // Debug log
            setLabel(data);
            setMails(data.mails || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading label...</p>;
    if (error) return <p className="text-danger">{error}</p>;
    if (!label) return <p>Label not found.</p>;

    return (
        <div className="label-view-wrapper">
            <div className="label-header-section">
                <div className="label-title-container">
                    <div
                        className="label-color-icon"
                        style={{
                            width: 24,
                            height: 24,
                            backgroundColor: label.color,
                            maskImage: `url(${labelIcon})`,
                            WebkitMaskImage: `url(${labelIcon})`,
                            maskSize: 'contain',
                            WebkitMaskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            WebkitMaskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            WebkitMaskPosition: 'center'
                        }}
                    ></div>
                    <h2 className="label-title">{label.name}</h2>
                </div>
                <div className="label-mail-count">
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
                    <div className="mails-list">
                        {mails.map(mail => (
                            <MailItem key={mail.id} mail={mail} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LabelView; 