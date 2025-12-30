import { useState, useEffect } from 'react';
import { 
    HomeIcon, WrenchScrewdriverIcon, PlusCircleIcon, 
    ClipboardDocumentListIcon, UserCircleIcon, ClockIcon, 
    ChartBarIcon, UserGroupIcon, Bars3Icon, BellIcon 
} from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';

const allMenuItems = [
    { name: 'Overview', icon: HomeIcon, roles: ['admin', 'technician', 'owner'] },
    { name: 'ทะเบียนแอร์', icon: WrenchScrewdriverIcon, roles: ['admin', 'technician', 'owner', 'tenant'] },
    { name: 'ส่งเรื่องแจ้งซ่อม', icon: PlusCircleIcon, roles: ['tenant', 'owner'] },
    { name: 'ใบงานแจ้งซ่อม', icon: ClipboardDocumentListIcon, roles: ['admin', 'owner', 'technician'] },
    { name: 'ติดตามสถานะ', icon: ClockIcon, roles: ['admin', 'technician', 'owner', 'tenant'] },
    { name: 'จัดการช่าง', icon: UserCircleIcon, roles: ['admin'] },
    { name: 'ประวัติบริการ', icon: ClockIcon, roles: ['admin', 'owner'] },
    { name: 'รายงานสรุป', icon: ChartBarIcon, roles: ['admin'] }, // เฉพาะ Admin เท่านั้น
    { name: 'จัดการผู้ใช้', icon: UserGroupIcon, roles: ['admin'] },
];

const SidebarLayout = ({ children, activeTab, setActiveTab, userRole, handleLogout, notifications }) => {
    // บน mobile ให้ sidebar ปิดไว้ก่อน, บน desktop (lg ขึ้นไป) ให้เปิด
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

    // แก้ไข: หาก userRole เป็น 'undefined' หรือไม่มีค่า ให้ default เป็น 'admin' เพื่อแสดงเมนู
    const currentRole = (userRole && userRole !== 'undefined' && userRole !== 'null') ? userRole : 'admin'; 
    const menuItems = allMenuItems.filter(item => item.roles.includes(currentRole));

    useEffect(() => {
        console.log("SidebarLayout Debug:", { userRole, menuItemsCount: menuItems.length, isSidebarOpen });
        
        // Handle window resize - ปิด sidebar บน mobile เมื่อ resize
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [userRole, menuItems.length, isSidebarOpen]);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
            {/* Mobile Overlay - แสดงเมื่อ sidebar เปิดบน mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            
            <Sidebar 
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                menuItems={menuItems}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleLogout={handleLogout}
            />

            {/* ส่วนหลัก ต้องมี min-w-0 และ flex-1 เพื่อให้จอไม่เบี้ยว */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-10 shrink-0 relative z-30">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors shrink-0"
                            aria-label="Toggle Sidebar"
                        >
                            <Bars3Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                        </button>
                        <h2 className="text-base sm:text-xl font-black text-slate-800 uppercase italic tracking-tight truncate">{activeTab}</h2>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors relative"
                                aria-label="Notifications"
                            >
                                <BellIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                                {notifications && notifications.filter(n => n.is_read === 0).length > 0 && (
                                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                                )}
                            </button>
                            
                            {/* Notification Dropdown */}
                            {showNotificationDropdown && (
                                <>
                                    {/* Overlay to close dropdown when clicking outside */}
                                    <div 
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowNotificationDropdown(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
                                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                            <h3 className="font-bold text-slate-800">การแจ้งเตือน</h3>
                                            <button
                                                onClick={() => setShowNotificationDropdown(false)}
                                                className="text-slate-400 hover:text-slate-600"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div className="overflow-y-auto max-h-[24rem]">
                                            {notifications && notifications.length > 0 ? (
                                                <div className="divide-y divide-slate-100">
                                                    {notifications.map((notif) => {
                                                        // แปลง created_at เป็นเวลาที่อ่านง่าย
                                                        const timeAgo = notif.created_at 
                                                            ? new Date(notif.created_at).toLocaleString('th-TH', {
                                                                dateStyle: 'short',
                                                                timeStyle: 'short'
                                                            })
                                                            : '';
                                                        
                                                        // กำหนดสีตาม type
                                                        const getTypeColor = (type) => {
                                                            if (type === 'order_created' || type === 'order_assigned') return 'blue';
                                                            if (type === 'order_completed') return 'emerald';
                                                            if (type === 'order_updated') return 'purple';
                                                            return 'blue';
                                                        };
                                                        
                                                        const typeColor = getTypeColor(notif.type);
                                                        const colorClasses = {
                                                            blue: 'bg-blue-500',
                                                            emerald: 'bg-emerald-500',
                                                            purple: 'bg-purple-500'
                                                        };
                                                        
                                                        return (
                                                            <div 
                                                                key={notif.id} 
                                                                className={`p-4 hover:bg-slate-50 transition-colors ${notif.is_read === 0 ? 'bg-blue-50/30' : ''}`}
                                                            >
                                                                <div className="flex gap-3">
                                                                    <div className="flex-shrink-0">
                                                                        <div className={`w-2 h-2 ${colorClasses[typeColor] || 'bg-blue-500'} rounded-full mt-2`} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-bold text-slate-800 truncate">
                                                                            {notif.title}
                                                                        </p>
                                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                                            {notif.message}
                                                                        </p>
                                                                        <p className="text-xs text-slate-400 mt-1">
                                                                            {timeAgo}
                                                                        </p>
                                                                    </div>
                                                                    {notif.is_read === 0 && (
                                                                        <div className="flex-shrink-0">
                                                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center text-slate-400">
                                                    <BellIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                    <p className="text-sm">ไม่มีการแจ้งเตือน</p>
                                                </div>
                                            )}
                                        </div>
                                        {notifications && notifications.length > 0 && (
                                            <div className="p-3 border-t border-slate-100">
                                                <button 
                                                    onClick={() => {
                                                        setShowNotificationDropdown(false);
                                                        setActiveTab && setActiveTab('Overview');
                                                    }}
                                                    className="w-full text-sm font-bold text-blue-600 hover:text-blue-700 text-center py-2"
                                                >
                                                    ดูการแจ้งเตือนทั้งหมด
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                            <UserCircleIcon className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-[#F8FAFC] scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default SidebarLayout;
