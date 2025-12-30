// backend/controllers/authController.js
const User = require('../models/userModel'); // เรียกใช้ Model (ประกาศครั้งเดียวพอ)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ใช้ค่าจาก .env ถ้าไม่มีให้ใช้ค่า Default (ควรเปลี่ยนก่อนขึ้น Production)
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me_later'; 

// 1. สร้าง User ใหม่
exports.register = async (req, res) => {
    try {
        const { username, password, role, technician_id } = req.body;

        // Hash Password
        const hashedPassword = bcrypt.hashSync(password, 8);

        // เรียกใช้ Model สร้าง User
        const newUser = await User.create({ 
            username, 
            password: hashedPassword, 
            role, 
            technician_id 
        });

        res.json({ message: "สร้าง User สำเร็จ", id: newUser.id });

    } catch (err) {
        // ถ้า Model ส่ง error (เช่น username ซ้ำ)
        res.status(500).json({ error: "Username นี้มีคนใช้แล้ว หรือเกิดข้อผิดพลาด: " + err.message });
    }
};

// 2. เข้าสู่ระบบ (Login)
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // เรียกใช้ Model หา User
        const user = await User.findByUsername(username);

        if (!user) return res.status(404).json({ message: "ไม่พบชื่อผู้ใช้งาน" });

        // เช็ครหัสผ่าน
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).json({ token: null, message: "รหัสผ่านผิด" });

        // ออก Token
        const token = jwt.sign(
            { id: user.id, role: user.role, tech_id: user.technician_id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Login สำเร็จ",
            token: token,
            role: user.role,
            user: { id: user.id, username: user.username, role: user.role }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. ลบผู้ใช้งาน (เฉพาะ Admin และห้ามลบตัวเอง)
exports.deleteUser = async (req, res) => {
    try {
        const targetId = req.params.id;     // ID ของ User ที่ต้องการจะลบ
        const currentUserId = req.user.id;  // ID ของ Admin ที่กำลังใช้งานอยู่ (จาก Token)

        // 🛑 1. ดักไม่ให้ลบตัวเอง
        if (targetId == currentUserId) {
            return res.status(403).json({ 
                message: "ป้องกันการกดผิด: คุณไม่สามารถลบบัญชี Admin ของตัวเองได้" 
            });
        }

        // 2. เรียกใช้ Model เพื่อลบข้อมูล
        const result = await User.delete(targetId);
        
        if (!result) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้งานที่ต้องการลบ" });
        }

        res.json({ message: "ลบผู้ใช้งานสำเร็จ" });

    } catch (err) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบ: " + err.message });
    }
};

// ... (Register, Login, DeleteUser ที่มีอยู่แล้ว)

// 4. อัปเดตข้อมูลผู้ใช้งาน (แก้ไขชื่อ, สิทธิ์, หรือรหัสผ่านใหม่)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, role, technician_id, password } = req.body;
        
        const updateData = { username, role, technician_id };

        // ถ้ามีการส่ง Password ใหม่มา ให้ Hash ก่อนบันทึก
        if (password) {
            updateData.password = bcrypt.hashSync(password, 8);
        }

        const result = await User.update(id, updateData);
        
        if (!result) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้งานที่ต้องการแก้ไข" });
        }

        res.json({ message: "อัปเดตข้อมูลผู้ใช้งานสำเร็จ" });
    } catch (err) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดต: " + err.message });
    }
};

// 5. เปิด-ปิด สถานะการใช้งาน (Active / Inactive)
exports.toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body; // ส่งค่า 1 (เปิด) หรือ 0 (ปิด)
        const currentUserId = req.user.id;

        // 🛑 ป้องกัน Admin ปิดการใช้งานบัญชีตัวเอง
        if (id == currentUserId && is_active == 0) {
            return res.status(403).json({ 
                message: "ไม่สามารถปิดการใช้งานบัญชีของตัวเองได้" 
            });
        }

        const result = await User.updateStatus(id, is_active);
        
        if (!result) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
        }

        res.json({ 
            message: `เปลี่ยนสถานะเป็น ${is_active == 1 ? 'เปิดใช้งาน' : 'ระงับใช้งาน'} เรียบร้อยแล้ว` 
        });
    } catch (err) {
        res.status(500).json({ error: "เกิดข้อผิดพลาด: " + err.message });
    }
};

// เพิ่มต่อท้ายในไฟล์ authController.js
exports.getAllUsers = async (req, res) => {
    try {
        // เรียกใช้ Model ที่เราเพิ่งสร้าง
        const users = await User.getAll();
        
        res.json({
            message: "ดึงข้อมูลผู้ใช้งานทั้งหมดสำเร็จ",
            count: users.length,
            data: users
        });
    } catch (err) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล: " + err.message });
    }
};