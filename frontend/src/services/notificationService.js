import api from '../api/axios';

export const notificationService = {
    // ดึง notifications ของ user
    getAllNotifications: async () => {
        try {
            const response = await api.get('/notifications');
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    // ดึง notifications ที่ยังไม่อ่าน
    getUnreadNotifications: async () => {
        try {
            const response = await api.get('/notifications/unread');
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
            throw error;
        }
    },

    // ทำเครื่องหมายว่าอ่านแล้ว
    markAsRead: async (notificationId) => {
        try {
            const response = await api.patch(`/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    // ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
    markAllAsRead: async () => {
        try {
            const response = await api.patch('/notifications/read-all');
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },

    // บันทึก FCM token
    updateFcmToken: async (fcmToken) => {
        try {
            const response = await api.post('/notifications/fcm-token', { fcm_token: fcmToken });
            return response.data;
        } catch (error) {
            console.error('Error updating FCM token:', error);
            throw error;
        }
    }
};

