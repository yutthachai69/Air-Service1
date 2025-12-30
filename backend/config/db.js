const sqlite3 = require('sqlite3').verbose();

// เชื่อมต่อฐานข้อมูล
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTables();
    }
});

// ฟังก์ชันสร้างตาราง (ออกแบบใหม่ให้ครบทุก Role และทุก Step)
function createTables() {
    db.serialize(() => {
        // 1. ตารางข้อมูลรายละเอียดช่าง (Technicians)
        db.run(`CREATE TABLE IF NOT EXISTS technicians (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            avatar_url TEXT,
            rating REAL,
            specialty TEXT
        )`);

        // 2. ตารางผู้ใช้งานระบบ (Users: Admin, Owner, Tenant, Technician)
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'tenant', -- 'admin', 'owner', 'tenant', 'technician'
            technician_id INTEGER,       -- เชื่อมกับตาราง technicians (ถ้ามี)
            is_active INTEGER DEFAULT 1,
            is_online INTEGER DEFAULT 0,
            latitude REAL,
            longitude REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(technician_id) REFERENCES technicians(id)
        )`);

        // 3. ตารางใบงานซ่อม (Service Orders: รองรับ Flow การแนบรูปและอนุมัติ)
        db.run(`CREATE TABLE IF NOT EXISTS service_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tracking_no TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            customer_phone TEXT,
            service_type TEXT,           -- ประเภทงานซ่อม
            description TEXT,            -- รายละเอียดเพิ่มเติม/อาการ
            status TEXT DEFAULT 'pending_owner', -- สถานะ: pending_owner, approved, in_progress, waiting_owner, completed
            
            tenant_id INTEGER,           -- ID ลูกหอที่แจ้ง
            owner_id INTEGER,            -- ID เจ้าของที่ดูแล
            technician_id INTEGER,       -- ID ช่างที่รับงาน
            equipment_id INTEGER,        -- ID เครื่องแอร์ที่เกี่ยวข้อง
            
            total_price REAL,
            tenant_img TEXT,             -- รูปที่ลูกหอส่งตอนแจ้ง
            before_img TEXT,             -- รูปที่ช่างถ่ายก่อนทำ
            after_img TEXT,              -- รูปที่ช่างถ่ายหลังทำ
            
            appointment_date DATETIME,
            fcm_token TEXT,              -- สำหรับ Notification
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY(tenant_id) REFERENCES users(id),
            FOREIGN KEY(owner_id) REFERENCES users(id),
            FOREIGN KEY(technician_id) REFERENCES technicians(id),
            FOREIGN KEY(equipment_id) REFERENCES equipments(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating service_orders table:', err);
            } else {
                // เพิ่ม column equipment_id ถ้ายังไม่มี (สำหรับ database ที่สร้างไว้แล้ว)
                db.run(`ALTER TABLE service_orders ADD COLUMN equipment_id INTEGER`, (alterErr) => {
                    // ไม่ต้องแสดง error ถ้ามี column อยู่แล้ว
                    if (alterErr && !alterErr.message.includes('duplicate column name')) {
                        console.log('equipment_id column may already exist or error:', alterErr.message);
                    }
                });
                
                // เพิ่ม column ใหม่สำหรับ spare parts และ cancellation
                const newColumns = [
                    { name: 'spare_part_name', type: 'TEXT' },
                    { name: 'spare_part_eta', type: 'DATETIME' },
                    { name: 'cancellation_reason', type: 'TEXT' }
                ];
                
                newColumns.forEach(col => {
                    db.run(`ALTER TABLE service_orders ADD COLUMN ${col.name} ${col.type}`, (alterErr) => {
                        if (alterErr && !alterErr.message.includes('duplicate column name')) {
                            console.log(`${col.name} column may already exist or error:`, alterErr.message);
                        }
                    });
                });
            }
        });

        // 4. ตารางข้อมูลเครื่องแอร์ (Equipments)
        db.run(`CREATE TABLE IF NOT EXISTS equipments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_number TEXT NOT NULL,      -- เลขห้อง
            brand TEXT,                     -- ยี่ห้อ
            model TEXT,                     -- รุ่น
            serial_number TEXT UNIQUE,      -- รหัสเครื่อง (ควร UNIQUE)
            install_date DATETIME,          -- วันที่ติดตั้ง
            last_service_date DATETIME,     -- วันที่ล้าง/ซ่อมล่าสุด
            next_service_date DATETIME,     -- วันที่ควรล้างครั้งต่อไป (ระบบคำนวณ)
            status TEXT DEFAULT 'normal',   -- สถานะ: 'normal', 'maintenance_due', 'under_repair', 'out_of_order', 'retired'
            tenant_id INTEGER,              -- อยู่ในห้องของลูกหอคนไหน
            owner_id INTEGER,               -- เจ้าของคนไหนดูแล
            FOREIGN KEY(tenant_id) REFERENCES users(id),
            FOREIGN KEY(owner_id) REFERENCES users(id)
)`, (err) => {
            if (err) {
                console.error('Error creating equipments table:', err);
            } else {
                // เพิ่ม column status ถ้ายังไม่มี (สำหรับ database ที่สร้างไว้แล้ว)
                db.run(`ALTER TABLE equipments ADD COLUMN status TEXT DEFAULT 'normal'`, (alterErr) => {
                    if (alterErr && !alterErr.message.includes('duplicate column name')) {
                        console.log('status column may already exist or error:', alterErr.message);
                    }
                });
            }
        });

        // 5. ตารางการแจ้งเตือน (Notifications)
        db.run(`CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,           -- User ที่จะรับการแจ้งเตือน
            type TEXT NOT NULL,                 -- ประเภท: 'order_created', 'order_assigned', 'order_updated', 'order_completed', 'system'
            title TEXT NOT NULL,                -- หัวข้อการแจ้งเตือน
            message TEXT NOT NULL,              -- ข้อความการแจ้งเตือน
            related_order_id INTEGER,           -- ID ของ order ที่เกี่ยวข้อง (ถ้ามี)
            is_read INTEGER DEFAULT 0,          -- 0 = ยังไม่อ่าน, 1 = อ่านแล้ว
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(related_order_id) REFERENCES service_orders(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating notifications table:', err);
            }
        });

        // เพิ่ม fcm_token field ใน users table (ถ้ายังไม่มี)
        db.run(`ALTER TABLE users ADD COLUMN fcm_token TEXT`, (alterErr) => {
            if (alterErr && !alterErr.message.includes('duplicate column name')) {
                console.log('fcm_token column may already exist or error:', alterErr.message);
            }
        });

        console.log("All tables initialized with New Flow (Tenant/Owner/Tech) successfully.");
    });
}

module.exports = db;