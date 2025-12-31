const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me_later';

exports.verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: "กรุณา Login ก่อน!" });

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Token ไม่ถูกต้อง หรือหมดอายุ" });
        
        req.user = {
            id: decoded.id,
            role: decoded.role,
            tech_id: decoded.tech_id
        };
        next();
    });
};

// --- เพิ่มส่วนนี้เพื่อความปลอดภัย (RBAC) ---

// ตรวจสอบว่าเป็น Admin เท่านั้น
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "ปฏิเสธการเข้าถึง: สงวนสิทธิ์เฉพาะ Admin เท่านั้น" });
    }
};

// ตรวจสอบว่าเป็น Owner หรือ Admin (เจ้าของดูแลหอพัก)
exports.isOwner = (req, res, next) => {
    if (req.user && (req.user.role === 'owner' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: "ปฏิเสธการเข้าถึง: สงวนสิทธิ์สำหรับเจ้าของหอพัก" });
    }
};

// ตรวจสอบว่าเป็น Technician (ช่าง)
exports.isTechnician = (req, res, next) => {
    if (req.user && req.user.role === 'technician') {
        next();
    } else {
        res.status(403).json({ message: "ปฏิเสธการเข้าถึง: เฉพาะช่างเท่านั้นที่ทำรายการนี้ได้" });
    }
};