import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // URL ของ Backend
});

// ดักจับ Request เพื่อใส่ Token ก่อนส่งไปหา Server
api.interceptors.request.use((config) => {
    // ดึง token จาก localStorage (axios interceptor ไม่สามารถใช้ Context ได้โดยตรง)
    // แต่ในส่วนของ components จะใช้ token จาก Context แทน
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // ถ้าเป็น FormData ไม่ต้อง set Content-Type (ให้ browser set ให้อัตโนมัติ)
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
});

// ดักจับ Response เพื่อจัดการ error
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // ถ้า token หมดอายุหรือไม่ถูกต้อง ให้ logout
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.clear();
            // Redirect ไป login (Context จะ update state อัตโนมัติเมื่อ localStorage เปลี่ยน)
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;