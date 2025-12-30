const Notification = require('../models/notificationModel');
const User = require('../models/userModel');

// ดึง notifications ของ user ปัจจุบัน
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 50 } = req.query;
        
        const notifications = await Notification.getByUserId(userId, parseInt(limit));
        const unreadCount = await Notification.countUnread(userId);
        
        res.json({ 
            message: "ดึงข้อมูลการแจ้งเตือนสำเร็จ", 
            data: notifications,
            unread_count: unreadCount
        });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ error: err.message });
    }
};

// ดึงเฉพาะ notifications ที่ยังไม่อ่าน
exports.getUnreadNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const notifications = await Notification.getUnreadByUserId(userId);
        const unreadCount = await Notification.countUnread(userId);
        
        res.json({ 
            message: "ดึงข้อมูลการแจ้งเตือนที่ยังไม่อ่านสำเร็จ", 
            data: notifications,
            unread_count: unreadCount
        });
    } catch (err) {
        console.error('Error fetching unread notifications:', err);
        res.status(500).json({ error: err.message });
    }
};

// ทำเครื่องหมายว่าอ่านแล้ว
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const result = await Notification.markAsRead(id, userId);
        res.json({ message: "อัปเดตสถานะการแจ้งเตือนสำเร็จ", data: result });
    } catch (err) {
        console.error('Error marking notification as read:', err);
        res.status(500).json({ error: err.message });
    }
};

// ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await Notification.markAllAsRead(userId);
        res.json({ message: "อัปเดตสถานะการแจ้งเตือนทั้งหมดสำเร็จ", data: result });
    } catch (err) {
        console.error('Error marking all notifications as read:', err);
        res.status(500).json({ error: err.message });
    }
};

// บันทึก FCM token ของ user (ใช้สำหรับ Push Notification)
exports.updateFcmToken = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fcm_token } = req.body;
        
        // อัปเดต FCM token ใน users table
        const db = require('../config/db');
        const sql = `UPDATE users SET fcm_token = ? WHERE id = ?`;
        
        db.run(sql, [fcm_token, userId], function(err) {
            if (err) {
                console.error('Error updating FCM token:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "บันทึก FCM token สำเร็จ", data: { user_id: userId, fcm_token } });
        });
    } catch (err) {
        console.error('Error updating FCM token:', err);
        res.status(500).json({ error: err.message });
    }
};

