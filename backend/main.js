const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// 1. Import Routes & Middleware
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const techRoutes = require('./routes/techRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const errorHandler = require('./middleware/errorHandler'); // นำเข้า Error Handler

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Middleware พื้นฐาน
app.use(cors());
app.use(express.json());

// เปิดให้เข้าถึงโฟลเดอร์รูปภาพ (http://localhost:5000/uploads/filename.jpg)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Routes Usage (RESTful API)
app.use('/api/auth', authRoutes);        // Authentication & Users: /api/auth/login, /api/auth/users
app.use('/api/orders', orderRoutes);     // Service Orders: /api/orders
app.use('/api/equipments', equipmentRoutes); // Equipments: /api/equipments
app.use('/api/technicians', techRoutes); // Technicians: /api/technicians
app.use('/api/notifications', notificationRoutes); // Notifications: /api/notifications 

// Test Route
app.get('/', (req, res) => {
    res.send('Air Service API (Refactored) is Running! 🚀');
});

// ------------------------------------------------------------------
// 4. Error Handler Middleware (ต้องวางไว้ท้ายสุด หลัง Routes ทั้งหมด!)
// ถ้าไม่วางตรงนี้ ระบบจัดการ Error ที่เราสร้างไว้จะไม่ทำงานครับ
app.use(errorHandler);
// ------------------------------------------------------------------

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});