import React, { useState } from 'react';
import './SearchBar.css';
import AdvancedSearchDialog from './AdvancedSearchDialog';

function SearchBar({ onSearch, searchResults, isSearching, onClearSearch }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

    const handleSimpleSearch = (e) => {
        e.preventDefault();
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery) {
            onSearch({ query: trimmedQuery });
        }
    };

    const handleAdvancedSearch = (searchParams) => {
        onSearch(searchParams);
        setSearchQuery(''); // Clear simple search when doing advanced search
    };

    const handleClear = () => {
        setSearchQuery('');
        if (onClearSearch) {
            onClearSearch();
        }
    };

    const openAdvancedSearch = () => {
        setShowAdvancedSearch(true);
    };

    const closeAdvancedSearch = () => {
        setShowAdvancedSearch(false);
    };

    // Show active search indicator
    const hasActiveSearch = searchResults !== null || isSearching;
    const showingResults = searchResults && searchResults.length >= 0;

    return (
        <>
            <div className={`search-container ${isFocused ? 'focused' : ''} ${hasActiveSearch ? 'has-results' : ''}`}>
                <form onSubmit={handleSimpleSearch} className="search-form">
                    <button type="submit" className="search-icon-button" title="Search">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor" />
                        </svg>
                    </button>

                    <input
                        type="text"
                        className="search-input"
                        placeholder={isSearching ? "Searching..." : "Search mail"}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        disabled={isSearching}
                    />

                    {(searchQuery || hasActiveSearch) && (
                        <button type="button" className="clear-button" onClick={handleClear} title="Clear search">
                            <svg width="24" height="24" viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
                            </svg>
                        </button>
                    )}

                    <button 
                        type="button" 
                        className="filter-button" 
                        title="Advanced search options"
                        onClick={openAdvancedSearch}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" fill="currentColor" />
                        </svg>
                    </button>
                </form>

                {/* Search results indicator */}
                {showingResults && (
                    <div className="search-results-indicator">
                        {isSearching ? (
                            <span>Searching...</span>
                        ) : (
                            <span>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
                        )}
                    </div>
                )}
            </div>

            {showAdvancedSearch && (
                <AdvancedSearchDialog
                    onClose={closeAdvancedSearch}
                    onSearch={handleAdvancedSearch}
                />
            )}
        </>
    );
}

export default SearchBar; 