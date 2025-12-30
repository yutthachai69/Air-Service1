// backend/models/userModel.js
const db = require('../config/db');

const User = {
    // 1. ฟังก์ชันสร้าง User
    create: (userData) => {
        return new Promise((resolve, reject) => {
            const { username, password, role, technician_id } = userData;
            // หมายเหตุ: หาก DB ยังไม่มีคอลัมน์ is_active ให้ลบ ", is_active" และ ", 1" ออก
            const sql = `INSERT INTO users (username, password, role, technician_id) VALUES (?, ?, ?, ?)`;
            
            db.run(sql, [username, password, role, technician_id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, ...userData });
                }
            });
        });
    },

    // 2. ฟังก์ชันหา User ตามชื่อ
    findByUsername: (username) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE username = ?`;
            
            db.get(sql, [username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    // 3. ฟังก์ชันอัปเดตข้อมูล
    update: (id, userData) => {
        return new Promise((resolve, reject) => {
            const { username, role, technician_id, password } = userData;
            
            let sql, params;
            if (password) {
                sql = `UPDATE users SET username = ?, role = ?, technician_id = ?, password = ? WHERE id = ?`;
                params = [username, role, technician_id, password, id];
            } else {
                sql = `UPDATE users SET username = ?, role = ?, technician_id = ? WHERE id = ?`;
                params = [username, role, technician_id, id];
            }

            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    },

    // 4. ฟังก์ชันเปิด-ปิดสถานะการใช้งาน
    updateStatus: (id, is_active) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE users SET is_active = ? WHERE id = ?`;
            db.run(sql, [is_active, id], function(err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    },

    // 5. ฟังก์ชันลบ User
    delete: (id) => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM users WHERE id = ?`;
            db.run(sql, [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    },

    // 6. ฟังก์ชันดึงรายชื่อผู้ใช้งานทั้งหมด (ย้ายเข้ามาใน User Object แล้ว)
    getAll: () => {
        return new Promise((resolve, reject) => {
            // หาก table users ยังไม่มี is_active ให้ลบคำว่า is_active ออกจาก SELECT
            const sql = `SELECT id, username, role, technician_id FROM users`;
            
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

module.exports = User;