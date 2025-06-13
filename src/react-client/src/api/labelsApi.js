function getAuthHeaders(contentType) {
    const token = sessionStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    const headers = { Authorization: `Bearer ${token}` };
    if (contentType) headers["Content-Type"] = contentType;
    return headers;
}

export async function getLabels() {
    const response = await fetch('/api/labels', {
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error('Failed to fetch labels');
    }
    return response.json();
}

export async function addLabel(name, color = 'gray', parentId = null) {
    const body = { name, color };
    if (parentId) {
        body.parentId = parentId;
    }

    const response = await fetch('/api/labels', {
        method: 'POST',
        headers: getAuthHeaders('application/json'),
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create label');
    }
    return response.json();
}

export async function renameLabel(id, name) {
    const response = await fetch(`/api/labels/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders('application/json'),
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        throw new Error('Failed to rename label');
    }
    return response.json();
}

export async function deleteLabel(id) {
    const response = await fetch(`/api/labels/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error('Failed to delete label');
    }
    return { success: true };
}

export async function updateLabelColor(id, color) {
    const response = await fetch(`/api/labels/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders('application/json'),
        body: JSON.stringify({ color }),
    });
    if (!response.ok) {
        throw new Error('Failed to update label color');
    }
    return response.json();
}
