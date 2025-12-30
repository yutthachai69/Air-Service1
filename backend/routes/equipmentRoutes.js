const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// ============================================
// Equipments Resource (RESTful API)
// ============================================
// GET    /api/equipments          - ดึงรายการเครื่องแอร์ทั้งหมด
// POST   /api/equipments          - ลงทะเบียนเครื่องแอร์ใหม่ (Admin only)
// GET    /api/equipments/:id      - ดึงรายละเอียดเครื่องแอร์ตาม ID (ถ้ามีในอนาคต)
// PUT    /api/equipments/:id      - แก้ไขข้อมูลเครื่องแอร์ (ถ้ามีในอนาคต)
// DELETE /api/equipments/:id      - ลบเครื่องแอร์ (ถ้ามีในอนาคต)

router.get('/', verifyToken, equipmentController.listEquipments);
router.post('/', verifyToken, isAdmin, equipmentController.addEquipment);
router.patch('/:id/status', verifyToken, equipmentController.updateEquipmentStatus);

module.exports = router;

