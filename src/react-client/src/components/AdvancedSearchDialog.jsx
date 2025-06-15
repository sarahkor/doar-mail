import React, { useState } from 'react';
import './AdvancedSearchDialog.css';

function AdvancedSearchDialog({ onClose, onSearch }) {
    const [searchParams, setSearchParams] = useState({
        from: '',
        to: '',
        subject: '',
        content: ''
    });

    const handleInputChange = (field, value) => {
        setSearchParams(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();

        // Filter out empty search parameters
        const activeSearchParams = {};
        Object.keys(searchParams).forEach(key => {
            if (searchParams[key].trim()) {
                activeSearchParams[key] = searchParams[key].trim();
            }
        });

        // Only search if at least one field has content
        if (Object.keys(activeSearchParams).length > 0) {
            onSearch(activeSearchParams);
            onClose();
        }
    };

    const handleClear = () => {
        setSearchParams({
            from: '',
            to: '',
            subject: '',
            content: ''
        });
    };

    const hasSearchTerms = Object.values(searchParams).some(value => value.trim());

    return (
        <div className="advanced-search-overlay" onClick={onClose}>
            <div className="advanced-search-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="advanced-search-header">
                    <h3>Advanced Search</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSearch} className="advanced-search-form">
                    <div className="search-field">
                        <label htmlFor="from-input">From</label>
                        <input
                            id="from-input"
                            type="text"
                            placeholder="Search by sender email address"
                            value={searchParams.from}
                            onChange={(e) => handleInputChange('from', e.target.value)}
                            className="search-input-field"
                        />
                    </div>

                    <div className="search-field">
                        <label htmlFor="to-input">To</label>
                        <input
                            id="to-input"
                            type="text"
                            placeholder="Search by recipient email address"
                            value={searchParams.to}
                            onChange={(e) => handleInputChange('to', e.target.value)}
                            className="search-input-field"
                        />
                    </div>

                    <div className="search-field">
                        <label htmlFor="subject-input">Subject</label>
                        <input
                            id="subject-input"
                            type="text"
                            placeholder="Search in email subject"
                            value={searchParams.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                            className="search-input-field"
                        />
                    </div>

                    <div className="search-field">
                        <label htmlFor="content-input">Content</label>
                        <input
                            id="content-input"
                            type="text"
                            placeholder="Search in email content"
                            value={searchParams.content}
                            onChange={(e) => handleInputChange('content', e.target.value)}
                            className="search-input-field"
                        />
                    </div>

                    <div className="advanced-search-actions">
                        <button
                            type="button"
                            className="clear-button-advanced"
                            onClick={handleClear}
                            disabled={!hasSearchTerms}
                        >
                            Clear
                        </button>
                        <button
                            type="submit"
                            className="search-button"
                            disabled={!hasSearchTerms}
                        >
                            Search
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdvancedSearchDialog; 