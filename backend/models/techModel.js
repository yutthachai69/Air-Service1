// backend/models/techModel.js
const db = require('../config/db');

const Tech = {
    // 1. ดึงจากตาราง technicians (เพื่อให้เห็นรายชื่อ "ช่างเอ็ม" ที่คุณสร้างไป)
    getAll: () => {
        return new Promise((resolve, reject) => {
            // แก้จาก 'FROM users' เป็น 'FROM technicians'
            const sql = `SELECT * FROM technicians`; 
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // 2. บันทึกข้อมูลลงตาราง technicians (ถูกต้องแล้ว)
    create: (data) => {
        return new Promise((resolve, reject) => {
            const { name, phone, specialty } = data;
            const sql = `INSERT INTO technicians (name, phone, specialty) VALUES (?, ?, ?)`;
            db.run(sql, [name, phone, specialty], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...data });
            });
        });
    },

    // 3. หาช่างตาม ID
    findById: (id) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM technicians WHERE id = ?`;
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    // ... ส่วนของ updateLocation และ toggleStatus ให้คงไว้ที่ตาราง users ตามเดิม ... 
    updateLocation: (id, lat, lng) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE users SET latitude = ?, longitude = ? WHERE id = ?`;
            db.run(sql, [lat, lng, id], function(err) {
                if (err) reject(err);
                else resolve({ message: "อัปเดตพิกัดเรียบร้อย", userId: id, lat, lng });
            });
        });
    }
};

module.exports = Tech;