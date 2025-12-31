const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Authentication Routes
router.post('/login', authLimiter, authController.login);

// Users Resource (RESTful API)
// GET    /api/auth/users          - ดึงข้อมูลผู้ใช้ทั้งหมด
// POST   /api/auth/users          - สร้างผู้ใช้ใหม่
// PUT    /api/auth/users/:id      - แก้ไขข้อมูลผู้ใช้ทั้งหมด
// DELETE /api/auth/users/:id      - ลบผู้ใช้
// PATCH  /api/auth/users/:id/status - แก้ไขสถานะผู้ใช้ (เปิด/ปิดการใช้งาน)

router.get('/users', verifyToken, authController.getAllUsers);
router.post('/users', verifyToken, authController.register);
router.put('/users/:id', verifyToken, authController.updateUser);
router.delete('/users/:id', verifyToken, authController.deleteUser);
router.patch('/users/:id/status', verifyToken, authController.toggleStatus);

module.exports = router;