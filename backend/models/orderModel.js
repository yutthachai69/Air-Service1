const db = require('../config/db');

const Order = {
    // 1. ลูกหอแจ้งซ่อม: เพิ่ม equipment_id เพื่อเก็บประวัติรายเครื่อง
    createByTenant: (data) => {
        return new Promise((resolve, reject) => {
            const { 
                tracking_no, customer_name, customer_phone, 
                service_type, description, tenant_id, owner_id, 
                tenant_img, equipment_id // รับ ID ของเครื่องแอร์เพิ่ม
            } = data;

            const sql = `INSERT INTO service_orders (
                tracking_no, customer_name, customer_phone, 
                service_type, description, tenant_id, owner_id, 
                tenant_img, equipment_id, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_owner')`;

            db.run(sql, [
                tracking_no, customer_name, customer_phone, 
                service_type, description, tenant_id, owner_id, 
                tenant_img, equipment_id
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...data, status: 'pending_owner' });
            });
        });
    },

    // 2. ดึงใบงานทั้งหมด (ปรับให้ Join ข้อมูลแอร์มาโชว์ด้วย)
    getAll: () => {
        return new Promise((resolve, reject) => {
            // ใช้ try-catch สำหรับกรณีที่ column equipment_id ยังไม่มี
            // ลอง query แบบมี JOIN ก่อน
            const sql = `
                SELECT o.*, e.brand, e.model, e.room_number 
                FROM service_orders o
                LEFT JOIN equipments e ON o.equipment_id = e.id
                ORDER BY o.created_at DESC`;
            
            db.all(sql, [], (err, rows) => {
                if (err) {
                    // ถ้า error (อาจเป็นเพราะไม่มี column equipment_id) ให้ลอง query แบบไม่มี JOIN
                    console.log('Trying fallback query without equipment_id:', err.message);
                    const fallbackSql = `SELECT * FROM service_orders ORDER BY created_at DESC`;
                    db.all(fallbackSql, [], (fallbackErr, fallbackRows) => {
                        if (fallbackErr) {
                            reject(fallbackErr);
                        } else {
                            // เพิ่ม field ว่างๆ สำหรับ brand, model, room_number
                            const rowsWithDefaults = fallbackRows.map(row => ({
                                ...row,
                                brand: null,
                                model: null,
                                room_number: null
                            }));
                            resolve(rowsWithDefaults);
                        }
                    });
                } else {
                    resolve(rows);
                }
            });
        });
    },

    // ดึงงานตาม Technician
    getByTechnician: (technicianId) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT o.*, e.brand, e.model, e.room_number 
                FROM service_orders o
                LEFT JOIN equipments e ON o.equipment_id = e.id
                WHERE o.technician_id = ?
                ORDER BY o.created_at DESC`;
            db.all(sql, [technicianId], (err, rows) => {
                if (err) {
                    // Fallback ถ้าไม่มี equipment_id column
                    const fallbackSql = `SELECT * FROM service_orders WHERE technician_id = ? ORDER BY created_at DESC`;
                    db.all(fallbackSql, [technicianId], (fallbackErr, fallbackRows) => {
                        if (fallbackErr) {
                            reject(fallbackErr);
                        } else {
                            const rowsWithDefaults = fallbackRows.map(row => ({
                                ...row,
                                brand: null,
                                model: null,
                                room_number: null
                            }));
                            resolve(rowsWithDefaults);
                        }
                    });
                } else {
                    resolve(rows);
                }
            });
        });
    },

    // ดึงงานตาม Tenant
    getByTenant: (tenantId) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT o.*, e.brand, e.model, e.room_number 
                FROM service_orders o
                LEFT JOIN equipments e ON o.equipment_id = e.id
                WHERE o.tenant_id = ?
                ORDER BY o.created_at DESC`;
            db.all(sql, [tenantId], (err, rows) => {
                if (err) {
                    // Fallback ถ้าไม่มี equipment_id column
                    const fallbackSql = `SELECT * FROM service_orders WHERE tenant_id = ? ORDER BY created_at DESC`;
                    db.all(fallbackSql, [tenantId], (fallbackErr, fallbackRows) => {
                        if (fallbackErr) {
                            reject(fallbackErr);
                        } else {
                            const rowsWithDefaults = fallbackRows.map(row => ({
                                ...row,
                                brand: null,
                                model: null,
                                room_number: null
                            }));
                            resolve(rowsWithDefaults);
                        }
                    });
                } else {
                    resolve(rows);
                }
            });
        });
    },

    // 3. เจ้าของอนุมัติงาน (คงเดิม)
    assignTechnician: (orderId, technicianId) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE service_orders SET technician_id = ?, status = 'approved' WHERE id = ?`;
            db.run(sql, [technicianId, orderId], function(err) {
                if (err) reject(err);
                else resolve({ id: orderId, technician_id: technicianId, status: 'approved' });
            });
        });
    },

    // 4. ช่างอัปเดตงาน (รองรับ spare parts และ cancellation)
    updateByTech: (id, status, before_img, after_img, total_price, spare_part_name = null, spare_part_eta = null, cancellation_reason = null) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE service_orders SET 
                status = ?, before_img = ?, after_img = ?, total_price = ?, 
                spare_part_name = ?, spare_part_eta = ?, cancellation_reason = ?
                WHERE id = ?`;
            db.run(sql, [status, before_img, after_img, total_price, spare_part_name, spare_part_eta, cancellation_reason, id], function(err) {
                if (err) reject(err);
                else resolve({ id, status });
            });
        });
    },

    // ดึงสถิติรายงาน
    getReportStats: () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    COUNT(*) as total_completed,
                    COALESCE(SUM(total_price), 0) as total_revenue,
                    COUNT(CASE WHEN service_type = 'cleaning' THEN 1 END) as cleaning_count,
                    COUNT(CASE WHEN service_type = 'not_cold' OR service_type = 'leaking' OR service_type = 'noise' THEN 1 END) as repair_count,
                    COUNT(CASE WHEN service_type = 'other' THEN 1 END) as other_count
                FROM service_orders
                WHERE status = 'completed'
            `;
            
            db.get(sql, [], (err, row) => {
                if (err) reject(err);
                else resolve(row || { total_completed: 0, total_revenue: 0, cleaning_count: 0, repair_count: 0, other_count: 0 });
            });
        });
    },

    // ดึงรายได้รายเดือน (3 เดือนล่าสุด)
    getMonthlyRevenue: () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    strftime('%Y-%m', created_at) as month,
                    COALESCE(SUM(total_price), 0) as revenue
                FROM service_orders
                WHERE status = 'completed'
                    AND created_at >= datetime('now', '-3 months')
                GROUP BY strftime('%Y-%m', created_at)
                ORDER BY month DESC
                LIMIT 3
            `;
            
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    },

    // ดึงรายได้เดือนปัจจุบัน
    getCurrentMonthRevenue: () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT COALESCE(SUM(total_price), 0) as revenue
                FROM service_orders
                WHERE status = 'completed'
                    AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
            `;
            
            db.get(sql, [], (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.revenue : 0);
            });
        });
    }
};

module.exports = Order;