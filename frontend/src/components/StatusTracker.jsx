import React, { useState, useEffect } from 'react';
import { WrenchScrewdriverIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const StatusTracker = () => {
    const { role } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const orders = await orderService.getAllOrders();
                // เรียงลำดับจากใหม่ไปเก่า
                const sortedJobs = Array.isArray(orders) 
                    ? orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    : [];
                setJobs(sortedJobs);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    // แปลงสถานะจาก Backend เป็น Config ของ UI
    const getStatusConfig = (status) => {
        const config = {
            'pending_owner': { label: 'รอรับเรื่อง', color: 'amber', percent: '10%', icon: '⚠️' },
            'pending': { label: 'รอรับเรื่อง', color: 'amber', percent: '10%', icon: '⚠️' },
            'approved': { label: 'อนุมัติแล้ว', color: 'blue', percent: '25%', icon: '✅' },
            'confirmed': { label: 'รับเรื่องแล้ว', color: 'blue', percent: '25%', icon: '✅' },
            'on_the_way': { label: 'ช่างกำลังเดินทาง', color: 'purple', percent: '35%', icon: '🚗' },
            'in_progress': { label: 'กำลังดำเนินการ', color: 'indigo', percent: '50%', icon: '🔧' },
            'waiting_spare': { label: 'รออะไหล่', color: 'orange', percent: '40%', icon: '⏳' },
            'waiting_owner': { label: 'รอตรวจสอบ', color: 'purple', percent: '80%', icon: '👁️' },
            'completed': { label: 'เสร็จสิ้น', color: 'emerald', percent: '100%', icon: '✔️' },
            'cancelled': { label: 'ยกเลิก', color: 'red', percent: '0%', icon: '❌' }
        };
        return config[status] || { label: status, color: 'slate', percent: '0%', icon: '❓' };
    };

    // Helper function to ensure Tailwind classes are detected correctly
    const getColorClasses = (color) => {
        const colors = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-500', icon: 'text-blue-600' },
            amber: { bg: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-500', icon: 'text-amber-600' },
            emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-500', icon: 'text-emerald-600' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600', bar: 'bg-purple-500', icon: 'text-purple-600' },
            indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', bar: 'bg-indigo-500', icon: 'text-indigo-600' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-600', bar: 'bg-orange-500', icon: 'text-orange-600' },
            red: { bg: 'bg-red-50', text: 'text-red-600', bar: 'bg-red-500', icon: 'text-red-600' },
            slate: { bg: 'bg-slate-50', text: 'text-slate-600', bar: 'bg-slate-500', icon: 'text-slate-600' },
        };
        return colors[color] || colors.blue;
    };

    const openDetailsModal = (job) => {
        setSelectedJob(job);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setSelectedJob(null);
        setShowDetailsModal(false);
    };

    if (loading) return <div className="p-10 text-center text-slate-400 animate-pulse">กำลังโหลดข้อมูลสถานะ...</div>;

    return (
        <div className="animate-fade-in space-y-6">
            <h3 className="text-2xl font-black text-slate-800 italic uppercase">Track <span className="text-blue-600">Status</span></h3>
            
            <div className="grid gap-4">
                {jobs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                        ไม่พบรายการแจ้งซ่อม
                    </div>
                ) : jobs.map((job) => {
                    const statusConfig = getStatusConfig(job.status);
                    const colors = getColorClasses(statusConfig.color);
                    return (
                        <div key={job.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
                            <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center`}>
                                    <WrenchScrewdriverIcon className={`w-7 h-7 ${colors.icon}`} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{job.tracking_no || `JOB-${job.id}`}</p>
                                    <h4 className="text-lg font-black text-slate-800">{job.service_type || job.description}</h4>
                                    <p className="text-sm text-slate-500">{new Date(job.created_at).toLocaleDateString('th-TH', { dateStyle: 'long' })}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="flex-1 max-w-md px-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Progress</span>
                                    <span className={`text-[10px] font-bold uppercase ${colors.text}`}>{statusConfig.label}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${colors.bar} transition-all duration-1000`} 
                                        style={{ width: statusConfig.percent }}
                                    ></div>
                                </div>
                            </div>

                            <button 
                                onClick={() => openDetailsModal(job)}
                                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors"
                            >
                                ดูรายละเอียด
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Modal สำหรับแสดงรายละเอียดงาน */}
            {showDetailsModal && selectedJob && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                        <button 
                            onClick={closeDetailsModal}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 z-10"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                        
                        <div className="space-y-6">
                            {/* Header */}
                            <div>
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                                    {selectedJob.tracking_no || `JOB-${selectedJob.id}`}
                                </p>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">
                                    {selectedJob.service_type || selectedJob.description || 'ไม่ระบุรายละเอียด'}
                                </h3>
                                <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase ${getColorClasses(getStatusConfig(selectedJob.status).color).text} ${getColorClasses(getStatusConfig(selectedJob.status).color).bg}`}>
                                    {getStatusConfig(selectedJob.status).label}
                                </span>
                            </div>

                            {/* ข้อมูลเครื่องแอร์ */}
                            {(selectedJob.brand || selectedJob.model || selectedJob.room_number) && (
                                <div className="border-t border-slate-100 pt-6">
                                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">ข้อมูลเครื่องแอร์</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedJob.brand && (
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1">ยี่ห้อ</p>
                                                <p className="text-base font-bold text-slate-800">{selectedJob.brand} {selectedJob.model || ''}</p>
                                            </div>
                                        )}
                                        {selectedJob.room_number && (
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1">ห้อง</p>
                                                <p className="text-base font-bold text-slate-800">{selectedJob.room_number}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ข้อมูลลูกค้า */}
                            <div className="border-t border-slate-100 pt-6">
                                <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">ข้อมูลลูกค้า</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">ชื่อลูกค้า</p>
                                        <p className="text-base font-bold text-slate-800">{selectedJob.customer_name || '-'}</p>
                                    </div>
                                    {selectedJob.customer_phone && (
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">เบอร์โทร</p>
                                            <p className="text-base font-bold text-slate-800">{selectedJob.customer_phone}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* รูปภาพที่ลูกค้าส่งมา */}
                            {selectedJob.tenant_img && (
                                <div className="border-t border-slate-100 pt-6">
                                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">รูปภาพที่ส่งมา</h4>
                                    <img 
                                        src={`http://localhost:5000${selectedJob.tenant_img}`} 
                                        alt="รูปที่ลูกค้าส่งมา" 
                                        className="w-full h-64 object-cover rounded-2xl"
                                    />
                                </div>
                            )}

                            {/* รายละเอียดเพิ่มเติม */}
                            {selectedJob.description && (
                                <div className="border-t border-slate-100 pt-6">
                                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">รายละเอียดเพิ่มเติม</h4>
                                    <p className="text-base text-slate-700 whitespace-pre-wrap">{selectedJob.description}</p>
                                </div>
                            )}

                            {/* รออะไหล่ - แสดงข้อมูล spare part */}
                            {selectedJob.status === 'waiting_spare' && selectedJob.spare_part_name && (
                                <div className="border-t border-slate-100 pt-6">
                                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">ข้อมูลอะไหล่</h4>
                                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl">⏳</span>
                                            <div>
                                                <p className="text-sm font-bold text-orange-800">รออะไหล่: {selectedJob.spare_part_name}</p>
                                                {selectedJob.spare_part_eta && (
                                                    <p className="text-xs text-orange-600 mt-1">
                                                        คาดว่าจะได้รับ: {new Date(selectedJob.spare_part_eta).toLocaleDateString('th-TH', { 
                                                            dateStyle: 'long' 
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ยกเลิก - แสดงเหตุผล */}
                            {selectedJob.status === 'cancelled' && selectedJob.cancellation_reason && (
                                <div className="border-t border-slate-100 pt-6">
                                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">เหตุผลที่ยกเลิก</h4>
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                        <p className="text-base text-red-800 whitespace-pre-wrap">{selectedJob.cancellation_reason}</p>
                                    </div>
                                </div>
                            )}

                            {/* ข้อมูลสถานะและราคา */}
                            <div className="border-t border-slate-100 pt-6">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <ClockIcon className="w-5 h-5" />
                                        <div>
                                            <p className="text-xs text-slate-400">วันที่สร้าง</p>
                                            <p className="text-sm font-bold text-slate-700">
                                                {selectedJob.created_at ? new Date(selectedJob.created_at).toLocaleString('th-TH', { 
                                                    dateStyle: 'long',
                                                    timeStyle: 'short'
                                                }) : '-'}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedJob.total_price && (
                                        <div className="text-right">
                                            <p className="text-xs text-slate-400 mb-1">ราคารวม</p>
                                            <p className="text-2xl font-black text-blue-600">฿{selectedJob.total_price}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="border-t border-slate-100 pt-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-bold uppercase text-slate-400">ความคืบหน้า</span>
                                    <span className={`text-xs font-bold uppercase ${getColorClasses(getStatusConfig(selectedJob.status).color).text}`}>
                                        {getStatusConfig(selectedJob.status).label}
                                    </span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${getColorClasses(getStatusConfig(selectedJob.status).color).bar} transition-all duration-1000`} 
                                        style={{ width: getStatusConfig(selectedJob.status).percent }}
                                    ></div>
                                </div>
                            </div>

                            {/* ปุ่มปิด */}
                            <div className="pt-4">
                                <button
                                    onClick={closeDetailsModal}
                                    className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
                                >
                                    ปิด
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusTracker;