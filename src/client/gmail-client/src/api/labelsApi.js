export async function getLabels() {
    const response = await fetch('/api/labels', {
        headers: {
            'id': 'dev-user', // For development
        }
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

    console.log('📤 Sending to API:', JSON.stringify(body, null, 2));

    const response = await fetch('/api/labels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'id': 'dev-user', // For development
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error('Failed to create label');
    }
    return response.json();
}

export async function renameLabel(id, name) {
    const response = await fetch(`/api/labels/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'id': 'dev-user', // For development
        },
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
        headers: {
            'id': 'dev-user', // For development
        },
    });
    if (!response.ok) {
        throw new Error('Failed to delete label');
    }
    // Delete returns 204 No Content, so don't try to parse JSON
    return { success: true };
}

export async function updateLabelColor(id, color) {
    const response = await fetch(`/api/labels/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'id': 'dev-user', // For development
        },
        body: JSON.stringify({ color }),
    });
    if (!response.ok) {
        throw new Error('Failed to update label color');
    }
    return response.json();
}
