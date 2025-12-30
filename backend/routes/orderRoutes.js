const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const upload = require('../config/uploadConfig');

const { 
    verifyToken, 
    isAdmin, 
    isOwner, 
    isTechnician 
} = require('../middleware/authMiddleware');

// ============================================
// Service Orders Resource (RESTful API)
// ============================================
// GET    /api/orders              - ดึงรายการงานทั้งหมด
// POST   /api/orders              - สร้างงานใหม่
// GET    /api/orders/:id          - ดึงรายละเอียดงานตาม ID (ถ้ามีในอนาคต)
// PATCH  /api/orders/:id/status   - อัปเดตสถานะงาน
// PATCH  /api/orders/:id/assign   - มอบหมายงานให้ช่าง

router.get('/', verifyToken, orderController.getAllOrders);
router.post('/', verifyToken, upload.single('tenant_img'), orderController.createOrder);
router.patch('/:id/status', verifyToken, isTechnician, orderController.updateStatus);
router.patch('/:id/assign', verifyToken, isOwner, orderController.assignTechnician);
router.get('/track/:trackingNo', verifyToken, orderController.getOrderByTracking);

module.exports = router;