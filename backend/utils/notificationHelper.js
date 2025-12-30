const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const { sendPushNotification } = require('./firebaseNotify');
const db = require('../config/db');

// Helper function สำหรับส่ง notification ไปให้ user
const sendNotificationToUser = async (userId, type, title, message, relatedOrderId = null) => {
    try {
        // สร้าง notification ในฐานข้อมูล
        const notification = await Notification.create({
            user_id: userId,
            type: type,
            title: title,
            message: message,
            related_order_id: relatedOrderId
        });

        // ดึง FCM token ของ user (ถ้ามี) และส่ง Push Notification
        const user = await new Promise((resolve, reject) => {
            const sql = `SELECT fcm_token FROM users WHERE id = ?`;
            db.get(sql, [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (user && user.fcm_token) {
            // ส่ง Push Notification ผ่าน FCM
            await sendPushNotification(user.fcm_token, title, message);
        }

        return notification;
    } catch (error) {
        console.error('Error sending notification to user:', error);
        // ไม่ throw error เพื่อไม่ให้กระทบกับ flow หลัก
        return null;
    }
};

// Helper function สำหรับส่ง notification ไปให้หลาย user
const sendNotificationToMultipleUsers = async (userIds, type, title, message, relatedOrderId = null) => {
    try {
        const notifications = userIds.map(userId => ({
            user_id: userId,
            type: type,
            title: title,
            message: message,
            related_order_id: relatedOrderId
        }));

        // สร้าง notifications ในฐานข้อมูล
        const results = await Notification.createMultiple(notifications);

        // ดึง FCM tokens ของ users และส่ง Push Notifications
        const users = await new Promise((resolve, reject) => {
            const placeholders = userIds.map(() => '?').join(',');
            const sql = `SELECT id, fcm_token FROM users WHERE id IN (${placeholders})`;
            db.all(sql, userIds, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        // ส่ง Push Notifications
        const pushPromises = users
            .filter(user => user.fcm_token)
            .map(user => sendPushNotification(user.fcm_token, title, message));
        
        await Promise.allSettled(pushPromises);

        return results;
    } catch (error) {
        console.error('Error sending notifications to multiple users:', error);
        return [];
    }
};

module.exports = {
    sendNotificationToUser,
    sendNotificationToMultipleUsers
};

