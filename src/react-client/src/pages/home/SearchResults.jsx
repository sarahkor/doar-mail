import React from 'react';
import MailItem from '../../components/MailItem';
import './SearchResults.css';

function SearchResults({ results, isSearching, searchParams, onClearSearch }) {
    return (
        <div className="search-results-container">
            <div className="search-results-header">
                <div className="search-results-info">
                    <h2 className="search-results-title">Search Results</h2>
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
                    null
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