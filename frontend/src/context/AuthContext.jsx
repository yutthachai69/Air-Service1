import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

// สร้าง Context
const AuthContext = createContext(null);

// Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [role, setRole] = useState(localStorage.getItem('role') || null);
    const [loading, setLoading] = useState(true);

    // ตรวจสอบ token เมื่อ component mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');
        
        if (storedToken && storedRole) {
            setToken(storedToken);
            setRole(storedRole);
            // TODO: ถ้ามี API สำหรับ verify token หรือดึง user data ก็เรียกที่นี่
            setUser({ role: storedRole });
        }
        
        setLoading(false);
    }, []);

    // Login function
    const login = async (username, password) => {
        try {
            const response = await authService.login(username, password);
            const { token: newToken, role: userRole, user: userData } = response;
            
            // เก็บข้อมูลใน localStorage
            localStorage.setItem('token', newToken);
            localStorage.setItem('role', userRole || userData?.role || 'admin');
            
            // Update state
            setToken(newToken);
            setRole(userRole || userData?.role || 'admin');
            setUser(userData || { role: userRole || userData?.role || 'admin' });
            
            return { success: true, data: response };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || error.message 
            };
        }
    };

    // Logout function
    const logout = () => {
        authService.logout();
        setToken(null);
        setRole(null);
        setUser(null);
        // Navigation จะทำใน component ที่เรียก logout
    };

    // Check if authenticated
    const isAuthenticated = !!token;

    // Value ที่จะส่งให้ components ที่ใช้ Context
    const value = {
        user,
        token,
        role,
        loading,
        isAuthenticated,
        login,
        logout,
        setUser, // สำหรับอัปเดต user data ถ้ามี
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom Hook สำหรับใช้ Auth Context
export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
};

