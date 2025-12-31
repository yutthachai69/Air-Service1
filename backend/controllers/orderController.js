const Order = require('../models/orderModel');
const { sendNotificationToUser, sendNotificationToMultipleUsers } = require('../utils/notificationHelper');
const db = require('../config/db');

// 1. ลูกหอ (Tenant) แจ้งซ่อม
exports.createOrder = async (req, res) => {
    try {
        const tenant_id = req.user.id;
        
        // ถ้ามีการอัปโหลดรูปภาพ ให้เก็บ path ของรูป
        let tenant_img = '';
        if (req.file) {
            tenant_img = `/uploads/${req.file.filename}`;
        } else if (req.body.tenant_img) {
            tenant_img = req.body.tenant_img;
        }
        
        // แปลง equipment_id และ owner_id เป็น number
        const equipment_id = req.body.equipment_id ? parseInt(req.body.equipment_id) : null;
        const owner_id = req.body.owner_id ? parseInt(req.body.owner_id) : null;
        
        const orderData = {
            tracking_no: req.body.tracking_no,
            customer_name: req.body.customer_name,
            customer_phone: req.body.customer_phone || '',
            service_type: req.body.service_type,
            description: req.body.description || '',
            tenant_id: tenant_id,
            owner_id: owner_id,
            equipment_id: equipment_id,
            tenant_img: tenant_img
        };
        
        const newOrder = await Order.createByTenant(orderData);
        
        // ส่ง notification ไปให้ Owner (ถ้ามี owner_id)
        if (owner_id) {
            await sendNotificationToUser(
                owner_id,
                'order_created',
                'มีงานใหม่รออนุมัติ',
                `มีงานใหม่จาก ${orderData.customer_name}: ${orderData.service_type || orderData.description || 'ไม่ระบุรายละเอียด'}`,
                newOrder.id
            );
        }
        
        // ส่ง notification ไปให้ Admin ทุกคน
        const admins = await new Promise((resolve, reject) => {
            const sql = `SELECT id FROM users WHERE role = 'admin'`;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        if (admins.length > 0) {
            const adminIds = admins.map(admin => admin.id);
            await sendNotificationToMultipleUsers(
                adminIds,
                'order_created',
                'มีงานใหม่รออนุมัติ',
                `มีงานใหม่จาก ${orderData.customer_name}: ${orderData.service_type || orderData.description || 'ไม่ระบุรายละเอียด'}`,
                newOrder.id
            );
        }
        
        res.status(201).json({ message: "ส่งเรื่องแจ้งซ่อมถึงเจ้าของแล้ว", data: newOrder });
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ error: err.message });
    }
};

// 2. ดึงงานทั้งหมด
exports.getAllOrders = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.id;
        
        // ถ้าเป็น admin หรือ owner ให้ดูทั้งหมด
        // ถ้าเป็น technician ให้ดูเฉพาะงานที่ assign ให้ (ใช้ technician_id จาก token)
        // ถ้าเป็น tenant ให้ดูเฉพาะงานของตัวเอง
        let orders;
        if (userRole === 'admin' || userRole === 'owner') {
            orders = await Order.getAll();
        } else if (userRole === 'technician') {
            // ใช้ req.user.tech_id (technician_id จาก token ที่เก็บไว้ตอน login)
            // ถ้าไม่มี tech_id ให้ใช้ userId (กรณีที่ยังไม่ได้ link กับ technician record)
            const technicianId = req.user.tech_id || userId;
            orders = await Order.getByTechnician(technicianId);
        } else {
            orders = await Order.getByTenant(userId);
        }
        
        res.json({ message: "ดึงข้อมูลใบงานทั้งหมดสำเร็จ", count: orders.length, data: orders });
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: err.message });
    }
};

// 3. เจ้าของ (Owner) อนุมัติและจ่ายงานให้ช่าง
exports.assignTechnician = async (req, res) => {
    try {
        const { id } = req.params; // ดึง orderId จาก URL parameter (RESTful style)
        const { technicianId } = req.body;
        const result = await Order.assignTechnician(id, technicianId);
        
        // ดึงข้อมูล order เพื่อส่ง notification
        const order = await new Promise((resolve, reject) => {
            const sql = `SELECT * FROM service_orders WHERE id = ?`;
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (order) {
            // ส่ง notification ไปให้ Technician
            // หา user_id จาก users table ที่มี technician_id ตรงกับ technicianId
            const techUser = await new Promise((resolve, reject) => {
                const sql = `SELECT id FROM users WHERE technician_id = ?`;
                db.get(sql, [technicianId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            if (techUser && techUser.id) {
                await sendNotificationToUser(
                    techUser.id,
                    'order_assigned',
                    'คุณได้รับงานใหม่',
                    `งาน: ${order.service_type || order.description || 'ไม่ระบุรายละเอียด'} - ${order.customer_name || 'ไม่ระบุชื่อ'}`,
                    id
                );
            }
            
            // ส่ง notification ไปให้ Tenant
            if (order.tenant_id) {
                await sendNotificationToUser(
                    order.tenant_id,
                    'order_assigned',
                    'งานของคุณได้รับการอนุมัติ',
                    `งานของคุณได้รับการอนุมัติและมอบหมายให้ช่างแล้ว: ${order.service_type || order.description || 'ไม่ระบุรายละเอียด'}`,
                    id
                );
            }
        }
        
        res.json({ message: "อนุมัติงานและจ่ายงานให้ช่างเรียบร้อย", data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. ช่าง (Technician) อัปเดตงาน (รองรับ spare parts และ cancellation)
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, before_img, after_img, total_price, spare_part_name, spare_part_eta, cancellation_reason } = req.body;
        const result = await Order.updateByTech(id, status, before_img, after_img, total_price, spare_part_name, spare_part_eta, cancellation_reason);
        
        // ดึงข้อมูล order เพื่อส่ง notification
        const order = await new Promise((resolve, reject) => {
            const sql = `SELECT * FROM service_orders WHERE id = ?`;
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (order) {
            let notificationTitle = '';
            let notificationMessage = '';
            
            // กำหนดข้อความตามสถานะ
            if (status === 'in_progress') {
                notificationTitle = 'ช่างเริ่มดำเนินการแล้ว';
                notificationMessage = `งาน: ${order.service_type || order.description || 'ไม่ระบุรายละเอียด'} กำลังดำเนินการอยู่`;
            } else if (status === 'waiting_spare') {
                notificationTitle = 'รออะไหล่';
                notificationMessage = `งาน: ${order.service_type || order.description || 'ไม่ระบุรายละเอียด'} กำลังรออะไหล่${spare_part_name ? ` (${spare_part_name})` : ''}`;
            } else if (status === 'completed') {
                notificationTitle = 'งานเสร็จสมบูรณ์แล้ว';
                notificationMessage = `งาน: ${order.service_type || order.description || 'ไม่ระบุรายละเอียด'} เสร็จสมบูรณ์แล้ว${total_price ? ` ราคา: ฿${total_price}` : ''}`;
            } else if (status === 'cancelled') {
                notificationTitle = 'งานถูกยกเลิก';
                notificationMessage = `งาน: ${order.service_type || order.description || 'ไม่ระบุรายละเอียด'} ถูกยกเลิก${cancellation_reason ? ` (${cancellation_reason})` : ''}`;
            } else if (status === 'on_the_way') {
                notificationTitle = 'ช่างกำลังเดินทาง';
                notificationMessage = `งาน: ${order.service_type || order.description || 'ไม่ระบุรายละเอียด'} - ช่างกำลังเดินทางมาถึง`;
            }
            
            // ส่ง notification ไปให้ Owner และ Tenant (ถ้ามี)
            if (notificationTitle && notificationMessage) {
                const userIds = [];
                if (order.owner_id) userIds.push(order.owner_id);
                if (order.tenant_id) userIds.push(order.tenant_id);
                
                if (userIds.length > 0) {
                    await sendNotificationToMultipleUsers(
                        userIds,
                        'order_updated',
                        notificationTitle,
                        notificationMessage,
                        id
                    );
                }
            }
        }
        
        res.json({ message: "อัปเดตข้อมูลการซ่อมสำเร็จ", data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. ดึงรายละเอียดตามเลข Tracking (ต้องมีเพื่อให้ Route ไม่ Crash)
exports.getOrderByTracking = async (req, res) => {
    try {
        const { trackingNo } = req.params;
        res.json({ message: `ข้อมูลสำหรับ Tracking: ${trackingNo}`, status: "Feature coming soon" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 6. ดึงสถิติรายงาน
exports.getReportStats = async (req, res) => {
    try {
        const stats = await Order.getReportStats();
        const monthlyRevenue = await Order.getMonthlyRevenue();
        const currentMonthRevenue = await Order.getCurrentMonthRevenue();

        // แปลงเดือนเป็นชื่อเดือนภาษาไทย/อังกฤษ
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedMonthlyRevenue = monthlyRevenue.reverse().map(item => {
            const date = new Date(item.month + '-01');
            return {
                month: monthNames[date.getMonth()],
                revenue: item.revenue
            };
        });

        // ถ้ามีไม่ครบ 3 เดือน ให้เติม 0
        while (formattedMonthlyRevenue.length < 3) {
            const monthsAgo = 3 - formattedMonthlyRevenue.length;
            const date = new Date();
            date.setMonth(date.getMonth() - monthsAgo);
            formattedMonthlyRevenue.unshift({
                month: monthNames[date.getMonth()],
                revenue: 0
            });
        }

        res.json({
            message: "ดึงสถิติรายงานสำเร็จ",
            data: {
                currentMonthRevenue: currentMonthRevenue,
                totalCompleted: stats.total_completed,
                jobDistribution: {
                    cleaning: stats.cleaning_count,
                    repair: stats.repair_count,
                    other: stats.other_count
                },
                monthlyRevenue: formattedMonthlyRevenue
            }
        });
    } catch (err) {
        console.error('Error fetching report stats:', err);
        res.status(500).json({ error: err.message });
    }
};
