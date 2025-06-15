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

export async function renameLabel(labelId, newName, parentId = undefined) {
    const body = { name: newName };
    if (parentId !== undefined) {
        body.parentId = parentId;
    }

    console.log(`📡 renameLabel API call - ID: ${labelId}, body:`, body);

    const response = await fetch(`/api/labels/${labelId}`, {
        method: 'PATCH',
        headers: getAuthHeaders('application/json'),
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        throw new Error('Failed to rename label');
    }
    const result = await response.json();
    console.log(`📡 renameLabel API response:`, result);
    return result;
}

export async function deleteLabel(labelId) {
    const response = await fetch(`/api/labels/${labelId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        throw new Error('Failed to delete label');
    }
}

export async function addMailToLabel(labelId, mailId) {
    const response = await fetch(`/api/labels/${labelId}/mails`, {
        method: 'POST',
        headers: getAuthHeaders('application/json'),
        body: JSON.stringify({ mailId }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to add mail to label');
    }
    return response.json();
}

export async function removeMailFromLabel(labelId, mailId) {
    const response = await fetch(`/api/labels/${labelId}/${mailId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to remove mail from label');
    }
}
