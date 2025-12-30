const db = require('../config/db');

const Equipment = {
    create: (data) => {
        return new Promise((resolve, reject) => {
            const { room_number, brand, model, serial_number, install_date, tenant_id, owner_id, status = 'normal' } = data;
            
            // ตั้งค่าวันล้างรอบถัดไปอัตโนมัติ (อีก 6 เดือน)
            const nextService = new Date();
            nextService.setMonth(nextService.getMonth() + 6);
            const next_service_date = nextService.toISOString();

            const sql = `INSERT INTO equipments 
                (room_number, brand, model, serial_number, install_date, last_service_date, next_service_date, status, tenant_id, owner_id) 
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)`;

            db.run(sql, [room_number, brand, model, serial_number, install_date, next_service_date, status, tenant_id, owner_id], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...data, next_service_date, status });
            });
        });
    },
    
    // อัปเดตสถานะเครื่องแอร์
    updateStatus: (id, status) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE equipments SET status = ? WHERE id = ?`;
            db.run(sql, [status, id], function(err) {
                if (err) reject(err);
                else resolve({ id, status });
            });
        });
    },

    getAll: () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM equipments ORDER BY room_number ASC`;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

module.exports = Equipment;