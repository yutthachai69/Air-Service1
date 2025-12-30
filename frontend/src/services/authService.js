import api from '../api/axios';

// Authentication Service - จัดการ API calls สำหรับ authentication

export const authService = {
    // Login
    login: async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        return response.data;
    },

    // Register/Create User (สำหรับ Admin)
    createUser: async (userData) => {
        const response = await api.post('/auth/users', userData);
        return response.data;
    },

    // Update User
    updateUser: async (userId, userData) => {
        const response = await api.put(`/auth/users/${userId}`, userData);
        return response.data;
    },

    // Delete User
    deleteUser: async (userId) => {
        const response = await api.delete(`/auth/users/${userId}`);
        return response.data;
    },

    // Get All Users
    getAllUsers: async () => {
        const response = await api.get('/auth/users');
        // API returns: { message, count, data: [...] }
        // Return only the data array for convenience
        return response.data.data || [];
    },

    // Toggle User Status
    toggleUserStatus: async (userId, isActive) => {
        const response = await api.patch(`/auth/users/${userId}/status`, { is_active: isActive });
        return response.data;
    },

    // Logout (local function - clear token)
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        // Redirect handled in AuthContext
    }
};

