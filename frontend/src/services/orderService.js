import api from '../api/axios';

// Order Service - จัดการ API calls สำหรับ Service Orders

export const orderService = {
    // ดึงรายการ orders ทั้งหมด
    getAllOrders: async () => {
        const response = await api.get('/orders');
        // API returns: { message, count, data: [...] }
        // Return only the data array for convenience
        return response.data.data || [];
    },

    // สร้าง order ใหม่ (สำหรับ Tenant)
    createOrder: async (orderData) => {
        // orderData สามารถเป็น FormData หรือ plain object
        const config = orderData instanceof FormData 
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        
        const response = await api.post('/orders', orderData, config);
        return response.data;
    },

    // Assign technician ให้ order (สำหรับ Owner/Admin)
    assignTechnician: async (orderId, technicianId) => {
        const response = await api.patch(`/orders/${orderId}/assign`, {
            technicianId
        });
        return response.data;
    },

    // อัปเดตสถานะ order (สำหรับ Technician)
    updateOrderStatus: async (orderId, statusData) => {
        const { status, before_img, after_img, total_price } = statusData;
        const response = await api.patch(`/orders/${orderId}/status`, {
            status,
            before_img,
            after_img,
            total_price
        });
        return response.data;
    },

    // ดึง order ตาม tracking number
    getOrderByTracking: async (trackingNo) => {
        const response = await api.get(`/orders/track/${trackingNo}`);
        return response.data;
    }
};

