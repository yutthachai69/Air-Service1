import { useState, useEffect } from 'react';
import { PlusIcon, CheckCircleIcon, ClockIcon, WrenchIcon, UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { technicianService } from '../services/technicianService';

const ServiceOrders = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { role } = useAuth();
    const [orders, setOrders] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedTech, setSelectedTech] = useState('');
    const userRole = role || '';

    useEffect(() => {
        fetchOrders();
        if (userRole === 'admin' || userRole === 'owner') {
            fetchTechnicians();
        }
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await orderService.getAllOrders();
            setOrders(res || []);
        } catch (err) {
            enqueueSnackbar('ไม่สามารถดึงข้อมูลงานได้: ' + (err.response?.data?.message || err.message), { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchTechnicians = async () => {
        try {
            const res = await technicianService.getAllTechnicians();
            setTechnicians(res || []);
        } catch (err) {
            console.error('Error fetching technicians:', err);
        }
    };

    const getStatusColor = (status) => {
        const statusMap = {
            'pending_owner': 'bg-amber-100 text-amber-600',
            'pending': 'bg-amber-100 text-amber-600',
            'approved': 'bg-blue-100 text-blue-600',
            'confirmed': 'bg-blue-100 text-blue-600',
            'on_the_way': 'bg-purple-100 text-purple-600',
            'in_progress': 'bg-indigo-100 text-indigo-600',
            'waiting_spare': 'bg-orange-100 text-orange-600',
            'waiting_owner': 'bg-orange-100 text-orange-600',
            'completed': 'bg-emerald-100 text-emerald-600',
            'cancelled': 'bg-red-100 text-red-600'
        };
        return statusMap[status] || 'bg-slate-100 text-slate-600';
    };

    const getStatusText = (status) => {
        const statusMap = {
            'pending_owner': 'รอรับเรื่อง',
            'pending': 'รอรับเรื่อง',
            'approved': 'อนุมัติแล้ว',
            'confirmed': 'รับเรื่องแล้ว',
            'on_the_way': 'ช่างกำลังเดินทาง',
            'in_progress': 'กำลังดำเนินการ',
            'waiting_spare': 'รออะไหล่',
            'waiting_owner': 'รอตรวจสอบ',
            'completed': 'เสร็จสมบูรณ์',
            'cancelled': 'ยกเลิก'
        };
        return statusMap[status] || status;
    };

    const handleAssignTechnician = async () => {
        if (!selectedTech) {
            enqueueSnackbar('กรุณาเลือกช่าง', { variant: 'error' });
            return;
        }

        try {
            await orderService.assignTechnician(selectedOrder.id, parseInt(selectedTech));
            enqueueSnackbar('มอบหมายงานให้ช่างสำเร็จ!', { variant: 'success' });
            setShowAssignModal(false);
            setSelectedOrder(null);
            setSelectedTech('');
            fetchOrders(); // Refresh orders
        } catch (err) {
            enqueueSnackbar('เกิดข้อผิดพลาด: ' + (err.response?.data?.error || err.message), { variant: 'error' });
        }
    };

    const openAssignModal = (order) => {
        if (order.status !== 'pending_owner') {
            enqueueSnackbar('งานนี้ได้ถูกอนุมัติแล้ว', { variant: 'info' });
            return;
        }
        setSelectedOrder(order);
        setShowAssignModal(true);
    };

    // Filter orders สำหรับ Owner: แสดงเฉพาะงานที่รออนุมัติ
    const displayOrders = (userRole === 'owner') 
        ? orders.filter(order => order.status === 'pending_owner')
        : orders;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header ส่วนควบคุม */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-black text-slate-800 italic uppercase">Service <span className="text-blue-600">Orders</span></h3>
                    {userRole === 'owner' && (
                        <p className="text-sm text-slate-500 mt-1">แสดงเฉพาะงานที่รออนุมัติ ({displayOrders.length} งาน)</p>
                    )}
                </div>
            </div>

            {/* ส่วนแสดง Cards สถานะงาน */}
            {loading ? (
                <div className="text-center py-12 text-slate-400">กำลังโหลดข้อมูล...</div>
            ) : displayOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    {userRole === 'owner' ? 'ไม่มีงานที่รออนุมัติ' : 'ยังไม่มีงานในระบบ'}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayOrders.map((order) => (
                        <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
                            
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{order.tracking_no || `JOB-${order.id}`}</span>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                                    {getStatusText(order.status)}
                                </span>
                            </div>

                            <h4 className="text-lg font-bold text-slate-800 mb-1">
                                {order.brand ? `${order.brand} ${order.model || ''}` : 'ไม่ระบุยี่ห้อ'}
                            </h4>
                            <p className="text-sm text-slate-500 mb-2">ห้อง: {order.room_number || '-'}</p>
                            <p className="text-sm text-slate-500 mb-2">{order.service_type || order.description || 'ไม่ระบุรายละเอียด'}</p>
                            <p className="text-xs text-slate-400 mb-4">ลูกค้า: {order.customer_name || '-'}</p>
                            
                            {order.tenant_img && (
                                <div className="mb-4">
                                    <img 
                                        src={`http://localhost:5000${order.tenant_img}`} 
                                        alt="รูปที่ลูกค้าส่งมา" 
                                        className="w-full h-32 object-cover rounded-xl"
                                    />
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <ClockIcon className="w-4 h-4" />
                                    <span className="text-xs font-medium">
                                        {order.created_at ? new Date(order.created_at).toLocaleDateString('th-TH') : '-'}
                                    </span>
                                </div>
                                <span className="text-lg font-black text-slate-900">
                                    {order.total_price ? `฿${order.total_price}` : 'รอราคา'}
                                </span>
                            </div>

                            {/* ปุ่มสำหรับ Owner: Assign Technician */}
                            {(userRole === 'owner' || userRole === 'admin') && order.status === 'pending_owner' && (
                                <button
                                    onClick={() => openAssignModal(order)}
                                    className="w-full mt-4 bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <UserPlusIcon className="w-4 h-4" />
                                    มอบหมายช่าง
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal สำหรับ Assign Technician */}
            {showAssignModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full relative">
                        <button 
                            onClick={() => {
                                setShowAssignModal(false);
                                setSelectedOrder(null);
                                setSelectedTech('');
                            }}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                        
                        <h3 className="text-2xl font-black text-slate-800 mb-2">มอบหมายช่าง</h3>
                        <p className="text-sm text-slate-500 mb-6">เลือกช่างสำหรับงาน: {selectedOrder.tracking_no}</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">เลือกช่าง</label>
                                <select
                                    value={selectedTech}
                                    onChange={(e) => setSelectedTech(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">-- เลือกช่าง --</option>
                                    {technicians.map((tech) => (
                                        <option key={tech.id} value={tech.id}>
                                            {tech.name} {tech.specialty ? `(${tech.specialty})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAssignModal(false);
                                        setSelectedOrder(null);
                                        setSelectedTech('');
                                    }}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleAssignTechnician}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                                >
                                    ยืนยัน
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceOrders;