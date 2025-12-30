# 📋 โครงสร้างโปรเจกต์ Jobflow (Air Service Management System)

## 🎯 ภาพรวม
ระบบจัดการบริการซ่อมและล้างแอร์ครบวงจร แบ่งเป็น **Backend (Node.js/Express)** และ **Frontend (React/Vite)**

---

## 📁 โครงสร้าง Backend (`/backend`)

### 1. **Entry Point**
- `main.js` - จุดเริ่มต้นของแอปพลิเคชัน, กำหนด Routes, Middleware, และเริ่ม Server

### 2. **Routes** (`/routes`)
RESTful API endpoints:

- `authRoutes.js` - Authentication & User Management
  - `POST /api/auth/login` - เข้าสู่ระบบ
  - `GET /api/auth/users` - ดึงรายชื่อผู้ใช้ทั้งหมด
  - `POST /api/auth/users` - สร้างผู้ใช้ใหม่
  - `PUT /api/auth/users/:id` - แก้ไขข้อมูลผู้ใช้
  - `DELETE /api/auth/users/:id` - ลบผู้ใช้
  - `PATCH /api/auth/users/:id/status` - เปิด/ปิดสถานะผู้ใช้

- `orderRoutes.js` - Service Orders Management
  - `GET /api/orders` - ดึงรายการงานทั้งหมด (filter ตาม role)
  - `POST /api/orders` - สร้างงานใหม่ (Tenant)
  - `PATCH /api/orders/:id/status` - อัปเดตสถานะงาน (Technician)
  - `PATCH /api/orders/:id/assign` - มอบหมายงานให้ช่าง (Owner)
  - `GET /api/orders/track/:trackingNo` - ดึงข้อมูลตาม Tracking Number

- `equipmentRoutes.js` - Equipment/Air Conditioner Management
  - `GET /api/equipments` - ดึงรายการเครื่องแอร์ทั้งหมด
  - `POST /api/equipments` - เพิ่มเครื่องแอร์ใหม่ (Admin)
  - `PATCH /api/equipments/:id/status` - อัปเดตสถานะเครื่องแอร์ (Admin)

- `techRoutes.js` - Technician Management
  - `GET /api/technicians` - ดึงรายชื่อช่างทั้งหมด
  - `POST /api/technicians` - เพิ่มช่างใหม่
  - `GET /api/technicians/:id` - ดึงข้อมูลช่างคนเดียว

- `notificationRoutes.js` - Notification Management
  - `GET /api/notifications` - ดึง notifications ของ user
  - `GET /api/notifications/unread` - ดึง notifications ที่ยังไม่อ่าน
  - `PATCH /api/notifications/:id/read` - ทำเครื่องหมายว่าอ่านแล้ว
  - `PATCH /api/notifications/read-all` - ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
  - `POST /api/notifications/fcm-token` - บันทึก FCM token สำหรับ Push Notification

### 3. **Controllers** (`/controllers`)
Business Logic Layer:

- `authController.js` - จัดการ Authentication และ User Management
- `orderController.js` - จัดการ Service Orders พร้อมส่ง Notifications
- `equipmentController.js` - จัดการ Equipment/Air Conditioner
- `techController.js` - จัดการ Technicians
- `notificationController.js` - จัดการ Notifications

### 4. **Models** (`/models`)
Database Access Layer (SQLite):

- `userModel.js` - CRUD operations สำหรับ `users` table
- `orderModel.js` - CRUD operations สำหรับ `service_orders` table
- `equipmentModel.js` - CRUD operations สำหรับ `equipments` table
- `techModel.js` - CRUD operations สำหรับ `technicians` table
- `notificationModel.js` - CRUD operations สำหรับ `notifications` table

### 5. **Middleware** (`/middleware`)
- `authMiddleware.js` - JWT Token Verification, Role-based Access Control (RBAC)
  - `verifyToken` - ตรวจสอบ JWT token
  - `isAdmin`, `isOwner`, `isTechnician` - ตรวจสอบ role
- `errorHandler.js` - Centralized Error Handling

### 6. **Utils** (`/utils`)
- `firebaseNotify.js` - Firebase Cloud Messaging (FCM) สำหรับ Push Notifications
- `notificationHelper.js` - Helper functions สำหรับส่ง notifications

### 7. **Config** (`/config`)
- `db.js` - SQLite Database Connection และ Table Creation
- `uploadConfig.js` - Multer Configuration สำหรับ File Uploads (รูปภาพ)

---

## 📁 โครงสร้าง Frontend (`/frontend`)

### 1. **Entry Points**
- `main.jsx` - React App Entry Point (wrapped with SnackbarProvider)
- `App.jsx` - Main App Component (React Router, AuthProvider)

### 2. **Pages** (`/pages`)
- `Login.jsx` - หน้า Login
- `Dashboard.jsx` - หน้าหลัก Dashboard (Overview, Stats, Tab Management)
- `Welcome.jsx` - หน้า Welcome (ถ้ามี)
- `ErrorPage.jsx` - หน้า Error (404, etc.)

### 3. **Components** (`/components`)
- `SidebarLayout.jsx` - Layout หลักพร้อม Sidebar และ Header (Notification Bell)
- `Sidebar.jsx` - Sidebar Navigation Menu
- `AirRegistry.jsx` - ทะเบียนเครื่องแอร์ (แสดง, ค้นหา, เพิ่ม)
- `ServiceRequest.jsx` - ส่งเรื่องแจ้งซ่อม (PDPA Consent, Camera/File Upload)
- `ServiceOrders.jsx` - ใบงานแจ้งซ่อม (แสดง, Filter, Assign Technician)
- `StatusTracker.jsx` - ติดตามสถานะงาน (Progress Bar, Detail Modal)
- `TechnicianManager.jsx` - จัดการช่าง
- `ServiceHistory.jsx` - ประวัติบริการ
- `Reports.jsx` - รายงานสรุป
- `UserManager.jsx` - จัดการผู้ใช้
- `NotificationCenter.jsx` - Notification Center (ถ้ามี)

### 4. **Services** (`/services`)
API Client Layer:

- `authService.js` - API calls สำหรับ Authentication & User Management
- `orderService.js` - API calls สำหรับ Service Orders
- `equipmentService.js` - API calls สำหรับ Equipment
- `technicianService.js` - API calls สำหรับ Technicians
- `notificationService.js` - API calls สำหรับ Notifications

### 5. **Context** (`/context`)
- `AuthContext.jsx` - Authentication State Management (user, token, role, login, logout)

### 6. **Hooks** (`/hooks`)
- `useAuth.js` - Custom Hook สำหรับใช้ AuthContext

### 7. **API** (`/api`)
- `axios.jsx` - Axios Instance Configuration (Base URL, Interceptors, Request/Response Handling)

---

## 🗄️ Database Schema (SQLite)

### Tables:

1. **`technicians`**
   - `id`, `name`, `phone`, `avatar_url`, `rating`, `specialty`

2. **`users`**
   - `id`, `username`, `password` (hashed), `role` (admin/owner/tenant/technician)
   - `technician_id` (FK to technicians), `is_active`, `is_online`
   - `latitude`, `longitude`, `fcm_token`, `created_at`

3. **`equipments`**
   - `id`, `brand`, `model`, `room_number`, `serial_number`
   - `install_date`, `next_service_date`, `status` (normal/maintenance_due/under_repair/out_of_order/retired)
   - `tenant_id` (FK to users), `owner_id` (FK to users), `created_at`

4. **`service_orders`**
   - `id`, `tracking_no`, `customer_name`, `customer_phone`
   - `service_type`, `description`, `status` (pending_owner/approved/in_progress/completed/cancelled/on_the_way/waiting_spare/etc.)
   - `tenant_id`, `owner_id`, `technician_id`, `equipment_id`
   - `total_price`, `tenant_img`, `before_img`, `after_img`
   - `spare_part_name`, `spare_part_eta`, `cancellation_reason`
   - `appointment_date`, `fcm_token`, `created_at`

5. **`notifications`**
   - `id`, `user_id`, `type` (order_created/order_assigned/order_updated/order_completed)
   - `title`, `message`, `related_order_id`, `is_read`, `created_at`

---

## 🔐 Authentication & Authorization

### Roles:
- **Admin** - จัดการทั้งหมด (Users, Technicians, Reports)
- **Owner** - อนุมัติงาน, มอบหมายช่าง, ดูประวัติ
- **Tenant** - แจ้งซ่อม, ติดตามสถานะ
- **Technician** - รับงาน, อัปเดตสถานะ, อัปโหลดรูป

### Flow:
1. Login → JWT Token → เก็บใน localStorage
2. Protected Routes → ตรวจสอบ Token → ตรวจสอบ Role
3. API Calls → Attach Token ใน Header → Backend Verify

---

## 🔔 Notification System

### Features:
- **In-App Notifications** - แสดงใน Notification Bell Dropdown
- **Push Notifications** - ผ่าน Firebase Cloud Messaging (FCM)
- **Real-time Updates** - Polling ทุก 30 วินาที

### Triggers:
- Tenant สร้าง Order → แจ้ง Owner และ Admin
- Owner Assign Technician → แจ้ง Technician และ Tenant
- Technician Update Status → แจ้ง Owner และ Tenant

---

## 📊 Status Management

### Service Order Statuses:
- `pending_owner` - รอรับเรื่อง (Owner)
- `approved` - อนุมัติแล้ว
- `confirmed` - รับเรื่องแล้ว
- `on_the_way` - ช่างกำลังเดินทาง
- `in_progress` - กำลังดำเนินการ
- `waiting_spare` - รออะไหล่
- `waiting_owner` - รอตรวจสอบ
- `completed` - เสร็จสมบูรณ์
- `cancelled` - ยกเลิก

### Equipment Statuses:
- `normal` - ใช้งานได้ปกติ
- `maintenance_due` - ใกล้กำหนดล้าง
- `under_repair` - แจ้งซ่อมอยู่
- `out_of_order` - ชำรุด / งดใช้งาน
- `retired` - เลิกใช้งาน

---

## 🎨 Frontend Tech Stack

- **React 19** - UI Framework
- **Vite** - Build Tool
- **React Router DOM** - Routing
- **Material-UI (MUI)** - UI Components (DataGrid, Charts)
- **Tailwind CSS** - Styling
- **Heroicons** - Icons
- **Axios** - HTTP Client
- **Notistack** - Toast Notifications
- **Context API** - State Management

---

## 🔧 Backend Tech Stack

- **Node.js** - Runtime
- **Express** - Web Framework
- **SQLite** - Database
- **JWT** - Authentication
- **Bcrypt** - Password Hashing
- **Multer** - File Uploads
- **Firebase Admin SDK** - Push Notifications
- **CORS** - Cross-Origin Resource Sharing

---

## 📝 Key Features

1. ✅ **Role-Based Access Control (RBAC)**
2. ✅ **Service Order Management** (Create, Assign, Update, Track)
3. ✅ **Equipment/Air Conditioner Registry**
4. ✅ **Technician Management**
5. ✅ **User Management**
6. ✅ **Notification System** (In-App + Push)
7. ✅ **Image Upload** (PDPA Consent, Camera/File Selection)
8. ✅ **Status Tracking** (Detailed Progress, Status History)
9. ✅ **Reports & Analytics**
10. ✅ **Responsive Design** (Mobile, Tablet, Desktop)

---

## 🚀 API Base URLs

- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:5173`

---

## 📦 Dependencies

### Backend:
- express, sqlite3, jsonwebtoken, bcryptjs, multer, firebase-admin, cors, dotenv

### Frontend:
- react, react-dom, react-router-dom, axios, @mui/material, @mui/x-data-grid, @mui/x-charts, tailwindcss, @heroicons/react, notistack

---

*Last Updated: 30 December 2025*

