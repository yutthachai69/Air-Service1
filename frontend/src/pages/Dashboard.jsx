import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/SidebarLayout';
import AirRegistry from '../components/AirRegistry';
import ServiceRequest from '../components/ServiceRequest';
import ServiceOrders from '../components/ServiceOrders';
import StatusTracker from '../components/StatusTracker';
import TechnicianManager from '../components/TechnicianManager';
import ServiceHistory from '../components/ServiceHistory';
import Reports from '../components/Reports';
import UserManager from '../components/UserManager';
import NotificationCenter from '../components/NotificationCenter';
import { equipmentService } from '../services/equipmentService';
import { orderService } from '../services/orderService';
import { notificationService } from '../services/notificationService';

const Dashboard = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { role, logout } = useAuth();
    const navigate = useNavigate();
    // ถ้าเป็น tenant ให้เริ่มต้นที่ 'ส่งเรื่องแจ้งซ่อม' แทน 'Overview'
    const userRole = role || 'admin';
    const [activeTab, setActiveTab] = useState(userRole === 'tenant' ? 'ส่งเรื่องแจ้งซ่อม' : 'Overview');
    const [stats, setStats] = useState({
        equipmentCount: 0,
        urgentService: 0,
        pendingOrders: 0
    });
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (activeTab === 'Overview') {
            fetchStats();
        }
        fetchNotifications();
        
        // Polling: ดึง notifications ทุก 30 วินาที
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);
        
        return () => clearInterval(interval);
    }, [activeTab]);

    const fetchNotifications = async () => {
        try {
            const notifs = await notificationService.getAllNotifications();
            setNotifications(notifs || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [equipmentsRes, ordersRes] = await Promise.all([
                equipmentService.getAllEquipments().catch(() => []),
                orderService.getAllOrders().catch(() => [])
            ]);

            const equipments = Array.isArray(equipmentsRes) ? equipmentsRes : [];
            let orders = Array.isArray(ordersRes) ? ordersRes : [];
            
            // Filter orders ตาม role (เหมือนกับ ServiceOrders component)
            if (userRole === 'owner') {
                orders = orders.filter(order => order.status === 'pending_owner');
            }

            // นับแอร์ที่ต้องล้างด่วน (next_service_date ใกล้หรือผ่านไปแล้ว)
            const today = new Date();
            const urgentCount = equipments.filter(eq => {
                if (!eq.next_service_date) return false;
                const nextDate = new Date(eq.next_service_date);
                return nextDate <= today;
            }).length;

            // นับงานที่ค้าง (ไม่นับ completed และ cancelled)
            // สำหรับ Owner: นับเฉพาะ pending_owner (เพื่อให้ตรงกับ ServiceOrders)
            // สำหรับ Admin/Technician: นับงานทั้งหมดที่ไม่ completed/cancelled
            const pendingCount = orders.filter(order => {
                const status = order.status;
                // ถ้าเป็น owner role ให้นับเฉพาะ pending_owner (เพื่อให้ตรงกับ ServiceOrders)
                if (userRole === 'owner') {
                    return status === 'pending_owner';
                }
                // สำหรับ admin/technician ให้นับงานทั้งหมดที่ไม่เสร็จ
                return status !== 'completed' && status !== 'cancelled';
            }).length;

            setStats({
                equipmentCount: equipments.length,
                urgentService: urgentCount,
                pendingOrders: pendingCount
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <SidebarLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userRole={userRole}
            handleLogout={handleLogout}
            notifications={notifications}
        >
            {activeTab === 'Overview' && (
                <div className="animate-fade-in space-y-8">
                    {/* ส่วน Stats 3 ใบ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                         <button
                            onClick={() => setActiveTab('ทะเบียนแอร์')}
                            className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl hover:bg-slate-800 transition-all text-left cursor-pointer group"
                         >
                            <p className="text-slate-400 font-bold text-xs uppercase mb-2">แอร์ในระบบ</p>
                            <div className="flex items-end justify-between">
                                <p className="text-5xl font-black">{loading ? '...' : stats.equipmentCount}</p>
                                <svg className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">คลิกเพื่อดูรายละเอียด</p>
                         </button>
                         <button
                            onClick={() => setActiveTab('ใบงานแจ้งซ่อม')}
                            className="p-8 bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-sm hover:border-amber-300 hover:bg-amber-50 transition-all text-left cursor-pointer group"
                         >
                            <p className="text-amber-500 font-bold text-xs uppercase mb-2">ต้องล้างด่วน</p>
                            <div className="flex items-end justify-between">
                                <p className="text-5xl font-black text-slate-800">{loading ? '...' : stats.urgentService}</p>
                                <svg className="w-6 h-6 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">คลิกเพื่อดูรายละเอียด</p>
                         </button>
                         <button
                            onClick={() => setActiveTab('ใบงานแจ้งซ่อม')}
                            className="p-8 bg-blue-600 text-white rounded-[2.5rem] shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all text-left cursor-pointer group"
                         >
                            <p className="text-blue-100 font-bold text-xs uppercase mb-2">งานค้าง</p>
                            <div className="flex items-end justify-between">
                                <p className="text-5xl font-black">{loading ? '...' : stats.pendingOrders}</p>
                                <svg className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <p className="text-xs text-blue-200 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">คลิกเพื่อดูรายละเอียด</p>
                         </button>
                    </div>
                </div>
            )}
            
            {activeTab === 'ติดตามสถานะ' && <StatusTracker />}
            {activeTab === 'ทะเบียนแอร์' && <AirRegistry />}
            {activeTab === 'ส่งเรื่องแจ้งซ่อม' && <ServiceRequest />}
            {activeTab === 'ใบงานแจ้งซ่อม' && <ServiceOrders />}
            {activeTab === 'จัดการช่าง' && <TechnicianManager />}
            {activeTab === 'ประวัติบริการ' && <ServiceHistory />}
            {activeTab === 'รายงานสรุป' && <Reports />}
            {activeTab === 'จัดการผู้ใช้' && <UserManager />}
        </SidebarLayout>
    );
};

export default Dashboard;