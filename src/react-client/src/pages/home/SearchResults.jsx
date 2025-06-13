import React from 'react';
import MailItem from '../../components/MailItem';
import './SearchResults.css';

function SearchResults({ results, isSearching, searchParams, onClearSearch }) {
    const formatSearchParams = () => {
        if (!searchParams) return '';

        const parts = [];
        if (searchParams.query) {
            parts.push(`"${searchParams.query}"`);
        }
        if (searchParams.subject) {
            parts.push(`subject:"${searchParams.subject}"`);
        }
        if (searchParams.from) {
            parts.push(`from:"${searchParams.from}"`);
        }
        if (searchParams.content) {
            parts.push(`content:"${searchParams.content}"`);
        }

        return parts.join(' ');
    };

    const getSearchTypeDescription = () => {
        if (!searchParams) return '';

        if (searchParams.query) {
            return 'Smart search across all fields';
        } else {
            const fields = [];
            if (searchParams.subject) fields.push('subject');
            if (searchParams.from) fields.push('sender');
            if (searchParams.content) fields.push('content');

            if (fields.length === 1) {
                return `Advanced search in ${fields[0]}`;
            } else {
                return `Advanced search in ${fields.join(', ')}`;
            }
        }
    };

    return (
        <div className="search-results-container">
            <div className="search-results-header">
                <div className="search-results-info">
                    <h2 className="search-results-title">Search Results</h2>
                    <div className="search-type-description">
                        <span className="search-type-text">{getSearchTypeDescription()}</span>
                    </div>
                    <div className="search-query-display">
                        <span className="search-query-label">Query: </span>
                        <span className="search-query-text">{formatSearchParams()}</span>
                    </div>
                    <div className="search-results-count">
                        {isSearching ? (
                            <span>Searching...</span>
                        ) : (
                            <span>
                                {results.length} result{results.length !== 1 ? 's' : ''} found
                            </span>
                        )}
                    </div>
                </div>
                <button
                    className="clear-search-button"
                    onClick={onClearSearch}
                    title="Clear search and return to inbox"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
                    </svg>
                    Clear Search
                </button>
            </div>

            <div className="search-results-content">
                {isSearching ? (
                    <div className="search-loading">
                        <div className="loading-spinner"></div>
                        <p>Searching your emails...</p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="no-search-results">
                        <div className="no-results-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor" opacity="0.3" />
                            </svg>
                        </div>
                        <h3>No results found</h3>
                        <p>Try adjusting your search terms or using different keywords.</p>
                        <div className="search-suggestions">
                            <h4>Search tips:</h4>
                            <ul>
                                <li>Check your spelling</li>
                                <li>Try more general keywords</li>
                                <li>Use the advanced search to search specific fields</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="search-results-list">
                        {results.map(mail => (
                            <MailItem key={mail.id} mail={mail} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchResults; 