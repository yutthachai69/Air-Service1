const db = require('../config/db');

const Notification = {
    // สร้าง notification ใหม่
    create: (data) => {
        return new Promise((resolve, reject) => {
            const { user_id, type, title, message, related_order_id = null } = data;
            
            const sql = `INSERT INTO notifications (user_id, type, title, message, related_order_id) 
                         VALUES (?, ?, ?, ?, ?)`;
            
            db.run(sql, [user_id, type, title, message, related_order_id], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...data, is_read: 0 });
            });
        });
    },

    // สร้าง notification หลายรายการพร้อมกัน (สำหรับแจ้งหลายคน)
    createMultiple: async (notifications) => {
        if (!notifications || notifications.length === 0) {
            return [];
        }
        
        // ใช้ Promise.all เพื่อสร้าง notifications แบบ parallel
        const promises = notifications.map(notif => Notification.create(notif));
        return Promise.all(promises);
    },

    // ดึง notifications ของ user
    getByUserId: (userId, limit = 50) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM notifications 
                         WHERE user_id = ? 
                         ORDER BY created_at DESC 
                         LIMIT ?`;
            
            db.all(sql, [userId, limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // ดึง notifications ที่ยังไม่อ่าน
    getUnreadByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM notifications 
                         WHERE user_id = ? AND is_read = 0 
                         ORDER BY created_at DESC`;
            
            db.all(sql, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // ทำเครื่องหมายว่าอ่านแล้ว
    markAsRead: (notificationId, userId) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE notifications SET is_read = 1 
                         WHERE id = ? AND user_id = ?`;
            
            db.run(sql, [notificationId, userId], function(err) {
                if (err) reject(err);
                else resolve({ id: notificationId, user_id: userId, is_read: 1 });
            });
        });
    },

    // ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
    markAllAsRead: (userId) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE notifications SET is_read = 1 
                         WHERE user_id = ? AND is_read = 0`;
            
            db.run(sql, [userId], function(err) {
                if (err) reject(err);
                else resolve({ user_id: userId, updated: this.changes });
            });
        });
    },

    // นับจำนวน notifications ที่ยังไม่อ่าน
    countUnread: (userId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*) as count FROM notifications 
                         WHERE user_id = ? AND is_read = 0`;
            
            db.get(sql, [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.count : 0);
            });
        });
    }
};

module.exports = Notification;
