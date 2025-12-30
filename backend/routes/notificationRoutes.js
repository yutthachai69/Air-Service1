const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

// GET    /api/notifications              - ดึง notifications ของ user
// GET    /api/notifications/unread       - ดึง notifications ที่ยังไม่อ่าน
// PATCH  /api/notifications/:id/read     - ทำเครื่องหมายว่าอ่านแล้ว
// PATCH  /api/notifications/read-all     - ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
// POST   /api/notifications/fcm-token    - บันทึก FCM token

router.get('/', verifyToken, notificationController.getNotifications);
router.get('/unread', verifyToken, notificationController.getUnreadNotifications);
router.patch('/:id/read', verifyToken, notificationController.markAsRead);
router.patch('/read-all', verifyToken, notificationController.markAllAsRead);
router.post('/fcm-token', verifyToken, notificationController.updateFcmToken);

module.exports = router;

