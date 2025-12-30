// backend/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
    // 1. อ่าน Status Code ที่ส่งมา (ถ้าไม่มีให้ตั้งเป็น 500 Internal Server Error)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // 2. แสดง Error ลงใน Console ของ Server (เพื่อให้ Developer เห็น)
    console.error('🔥 Error:', err.message);
    
    // ถ้าอยากเห็นละเอียดๆ ว่าพังบรรทัดไหน ให้เปิดบรรทัดนี้:
    // console.error(err.stack);

    // 3. ส่ง Response กลับไปหา Client (หน้าเว็บ/แอพ) เป็น JSON เสมอ
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Server Error',
        // ในโหมด Production เราจะไม่ส่ง stack trace ออกไป (เพื่อความปลอดภัย)
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;