// backend/controllers/techController.js
const Tech = require('../models/techModel'); 

exports.getAllTechs = async (req, res) => { // ตรวจสอบชื่อนี้
    try {
        const techs = await Tech.getAll(); 
        res.json({ message: "ดึงข้อมูลช่างสำเร็จ", count: techs.length, data: techs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createTech = async (req, res) => { // ตรวจสอบชื่อนี้
    try {
        const newTech = await Tech.create(req.body);
        res.status(201).json({ message: "เพิ่มช่างสำเร็จ", data: newTech });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTechById = async (req, res) => { // ตรวจสอบชื่อนี้
    try {
        const { id } = req.params;
        const tech = await Tech.findById(id); 
        if (!tech) return res.status(404).json({ error: "ไม่พบข้อมูลช่าง" });
        res.json({ data: tech });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};