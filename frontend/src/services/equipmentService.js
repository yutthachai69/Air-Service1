import api from '../api/axios';

// Equipment Service - จัดการ API calls สำหรับ Equipment/เครื่องแอร์

export const equipmentService = {
    // ดึงรายการ equipment ทั้งหมด
    getAllEquipments: async () => {
        const response = await api.get('/equipments');
        // API returns: { message, data: [...] }
        // Return only the data array for convenience
        return response.data.data || [];
    },

    // สร้าง equipment ใหม่ (สำหรับ Admin)
    createEquipment: async (equipmentData) => {
        const response = await api.post('/equipments', equipmentData);
        return response.data;
    }
};

