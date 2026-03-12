const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const mockAuth = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Login failed');
    }
    return response.json();
};

export const register = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || err.errors?.[0]?.msg || 'Registration failed');
    }
    return response.json();
};

export const verifyEmail = async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`);
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Verification failed');
    }
    return response.json();
};

export const forgotPassword = async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Request failed');
    }
    return response.json();
};

export const resetPassword = async (token, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Reset failed');
    }
    return response.json();
};

export const updateProfile = async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/users/profile/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Profile update failed');
    }
    return response.json();
};

export const getActivities = async (user_id = null) => {
    const url = user_id ? `${API_BASE_URL}/activities?user_id=${user_id}` : `${API_BASE_URL}/activities`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
};

export const getAnalytics = async (user_id = null) => {
    const url = user_id ? `${API_BASE_URL}/analytics?user_id=${user_id}` : `${API_BASE_URL}/analytics`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
};

export const trackEvent = async (trackingData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trackingData)
        });
        if (!response.ok) throw new Error('Tracking failed');
        return await response.json();
    } catch (err) {
        console.error('Error tracking event:', err);
    }
};

export const getUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
};

export const addUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to add user');
    return response.json();
};

export const updateUser = async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
};

export const deleteUser = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
};

export const getInsights = async () => {
    const response = await fetch(`${API_BASE_URL}/insights`);
    if (!response.ok) throw new Error('Failed to fetch API insights');
    return response.json();
};

export const getHeatmap = async (pageUrl) => {
    const response = await fetch(`${API_BASE_URL}/heatmap?pageUrl=${encodeURIComponent(pageUrl)}`);
    if (!response.ok) throw new Error('Failed to fetch heatmap');
    return response.json();
};

export const getReplays = async () => {
    const response = await fetch(`${API_BASE_URL}/replays`);
    if (!response.ok) throw new Error('Failed to fetch replays array');
    return response.json();
};

export const getReplayData = async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/replays/${sessionId}`);
    if (!response.ok) throw new Error('Failed to fetch replay chunk streams');
    return response.json();
};

export const getUserStats = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/user/stats/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user stats');
    return response.json();
};

export const getUserTimeline = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/user/timeline/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user timeline');
    return response.json();
};

export const getLeaderboard = async () => {
    const response = await fetch(`${API_BASE_URL}/leaderboard`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
};

export const getUserNotifications = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/user/notifications/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
};

export const markNotificationsAsRead = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/user/notifications/${userId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to mark notifications as read');
    return response.json();
};

export const updateGoals = async (userId, goals) => {
    const response = await fetch(`${API_BASE_URL}/user/goals/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goals)
    });
    if (!response.ok) throw new Error('Failed to update goals');
    return response.json();
};

export const triggerAutomation = async (webhookUrl, eventData) => {
    const response = await fetch(`${API_BASE_URL}/admin/trigger-automation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl, eventData })
    });
    if (!response.ok) throw new Error('Failed to trigger automation');
    return response.json();
};
