import React, { useState } from 'react';
import './AdvancedSearchDialog.css';

function AdvancedSearchDialog({ onClose, onSearch }) {
    const [searchParams, setSearchParams] = useState({
        subject: '',
        from: '',
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

        // Filter out empty search parameters and trim whitespace
        const activeSearchParams = {};
        Object.keys(searchParams).forEach(key => {
            const trimmedValue = searchParams[key].trim();
            if (trimmedValue) {
                activeSearchParams[key] = trimmedValue;
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
            subject: '',
            from: '',
            content: ''
        });
    };

    // Check if there are any non-empty search terms
    const hasSearchTerms = Object.values(searchParams).some(value => value.trim());

    return (
        <div className="advanced-search-overlay" onClick={onClose}>
            <div className="advanced-search-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="advanced-search-header">
                    <h3>Advanced Search</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSearch} className="advanced-search-form">
                    <div className="search-help-text">
                        <p>Search supports partial matches and multiple words. You can combine any of these fields:</p>
                    </div>

                    <div className="search-field">
                        <label htmlFor="subject-input">Subject</label>
                        <input
                            id="subject-input"
                            type="text"
                            placeholder="e.g., 'meeting today' or 'project update'"
                            value={searchParams.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                            className="search-input-field"
                        />
                    </div>

                    <div className="search-field">
                        <label htmlFor="from-input">From</label>
                        <input
                            id="from-input"
                            type="text"
                            placeholder="e.g., 'john@example.com' or 'John Smith'"
                            value={searchParams.from}
                            onChange={(e) => handleInputChange('from', e.target.value)}
                            className="search-input-field"
                        />
                    </div>

                    <div className="search-field">
                        <label htmlFor="content-input">Content</label>
                        <input
                            id="content-input"
                            type="text"
                            placeholder="e.g., 'quarterly report' or 'vacation request'"
                            value={searchParams.content}
                            onChange={(e) => handleInputChange('content', e.target.value)}
                            className="search-input-field"
                        />
                    </div>

                    <div className="search-tips">
                        <h4>Search Tips:</h4>
                        <ul>
                            <li><strong>Partial matching:</strong> Type part of a word to find matches</li>
                            <li><strong>Multiple words:</strong> All words must be found (e.g., "project update")</li>
                            <li><strong>Combine fields:</strong> Use any combination of subject, sender, and content</li>
                            <li><strong>Case insensitive:</strong> Search works regardless of upper/lower case</li>
                        </ul>
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