import { useState } from 'react';
import { 
    BellAlertIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon, 
    InformationCircleIcon 
} from '@heroicons/react/24/outline';

const NotificationCenter = () => {
    const [notifications] = useState([
        { id: 1, type: 'urgent', title: 'งานด่วนเข้าใหม่!', message: 'คุณ A แจ้งซ่อมแอร์ไม่เย็น (หมู่บ้านแสนสุข)', time: '5 นาทีที่แล้ว' },
        { id: 2, type: 'reminder', title: 'ถึงกำหนดล้างแอร์', message: 'เครื่องหมายเลข AC-105 ครบกำหนดล้าง 6 เดือนแล้ว', time: '1 ชม. ที่แล้ว' },
        { id: 3, type: 'success', title: 'งานสำเร็จแล้ว', message: 'ช่างสมชาย ปิดงานล้างแอร์ (Office Zone B)', time: '2 ชม. ที่แล้ว' },
        { id: 4, type: 'info', title: 'ระบบอัปเดต', message: 'ปรับปรุงระบบจัดการผู้ใช้เรียบร้อยแล้ว', time: '1 วันที่แล้ว' },
    ]);

    const getIcon = (type) => {
        switch(type) {
            case 'urgent': return <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />;
            case 'reminder': return <BellAlertIcon className="w-6 h-6 text-amber-500" />;
            case 'success': return <CheckCircleIcon className="w-6 h-6 text-emerald-500" />;
            default: return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h3 className="text-3xl font-black text-slate-800 italic uppercase">Notifications</h3>
                    <p className="text-slate-500">ติดตามความเคลื่อนไหวและงานด่วนทั้งหมดในระบบ</p>
                </div>
                <button className="text-sm font-bold text-blue-600 hover:underline">ทำเครื่องหมายว่าอ่านแล้วทั้งหมด</button>
            </div>

            <div className="space-y-4">
                {notifications.map((notif) => (
                    <div key={notif.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-5 items-start group">
                        <div className="mt-1">{getIcon(notif.type)}</div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{notif.title}</h4>
                                <span className="text-xs font-medium text-slate-400">{notif.time}</span>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed">{notif.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationCenter;