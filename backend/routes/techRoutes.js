const express = require('express');
const router = express.Router();
const techController = require('../controllers/techController');
// 1. นำเข้า verifyToken จาก middleware เพื่อใช้ตรวจสอบสิทธิ์
const { verifyToken } = require('../middleware/authMiddleware');

// 2. ใส่ verifyToken คั่นกลางระหว่าง Path และ Controller
// ตอนนี้ทุกเส้นทางจะถูกล็อกไว้ ต้องใช้ Token ในการเข้าถึงเหมือนฝั่ง Users
router.get('/', verifyToken, techController.getAllTechs);       // GET /api/technicians
router.post('/', verifyToken, techController.createTech);      // POST /api/technicians
router.get('/:id', verifyToken, techController.getTechById);   // GET /api/technicians/:id

module.exports = router;