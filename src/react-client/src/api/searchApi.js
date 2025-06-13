function getAuthHeaders(contentType = null) {
    const headers = { Authorization: `Bearer ${sessionStorage.getItem('token')}` };
    if (contentType) headers['Content-Type'] = contentType;
    return headers;
}

export async function searchMails(searchParams) {
    const queryParams = new URLSearchParams();

    // Handle simple search (legacy support)
    if (searchParams.query) {
        queryParams.append('q', searchParams.query);
    }

    // Handle advanced search parameters
    if (searchParams.subject) {
        queryParams.append('subject', searchParams.subject);
    }
    if (searchParams.from) {
        queryParams.append('from', searchParams.from);
    }
    if (searchParams.content) {
        queryParams.append('content', searchParams.content);
    }

    const response = await fetch(`/api/search?${queryParams.toString()}`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Search failed');
    }

    return response.json();
} 