const Equipment = require('../models/equipmentModel');

// เพิ่มเครื่องแอร์ใหม่
exports.addEquipment = async (req, res) => {
    try {
        const newEquip = await Equipment.create(req.body);
        res.status(201).json({ message: "ลงทะเบียนแอร์สำเร็จ", data: newEquip });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ดึงรายการแอร์ทั้งหมด
exports.listEquipments = async (req, res) => {
    try {
        const list = await Equipment.getAll();
        res.json({ message: "ดึงข้อมูลแอร์ทั้งหมดสำเร็จ", data: list });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// อัปเดตสถานะเครื่องแอร์
exports.updateEquipmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await Equipment.updateStatus(id, status);
        res.json({ message: "อัปเดตสถานะเครื่องแอร์สำเร็จ", data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};