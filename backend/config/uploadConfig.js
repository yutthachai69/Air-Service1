const multer = require('multer');
const path = require('path');

// ตั้งค่าที่เก็บไฟล์
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // เก็บลงโฟลเดอร์ uploads
    },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์ใหม่กันซ้ำ: timestamp + random number + นามสกุลเดิม
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// กรองเฉพาะไฟล์รูปภาพ
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('รองรับเฉพาะไฟล์รูปภาพเท่านั้น!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;