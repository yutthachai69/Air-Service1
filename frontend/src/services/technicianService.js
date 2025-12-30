import api from '../api/axios';

// Technician Service - จัดการ API calls สำหรับ Technician/ช่าง

export const technicianService = {
    // ดึงรายการ technician ทั้งหมด
    getAllTechnicians: async () => {
        const response = await api.get('/technicians');
        // API returns: { message, count, data: [...] }
        // Return only the data array for convenience
        return response.data.data || [];
    },

    // สร้าง technician ใหม่
    createTechnician: async (technicianData) => {
        const response = await api.post('/technicians', technicianData);
        return response.data;
    },

    // ดึง technician ตาม ID
    getTechnicianById: async (technicianId) => {
        const response = await api.get(`/technicians/${technicianId}`);
        return response.data;
    }
};

