import { useState } from 'react';
import { 
    ClockIcon, 
    UserIcon, 
    WrenchIcon, 
    MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

const ServiceHistory = () => {
    const [history] = useState([
        { id: 1, date: '2025-12-20', airName: 'Daikin - Living Room', task: 'ล้างแอร์ใหญ่', tech: 'สมชาย สายลม', note: 'ล้างแผงคอยล์ร้อนและคอยล์เย็น' },
        { id: 2, date: '2025-10-15', airName: 'Mitsubishi - Bedroom', task: 'เติมน้ำยาแอร์', tech: 'วิชัย ใจเย็น', note: 'เติมน้ำยา R32 ไป 20 ปอนด์' },
        { id: 3, date: '2025-08-01', airName: 'Daikin - Living Room', task: 'เปลี่ยนแคป', tech: 'มานะ ขยันซ่อม', note: 'เปลี่ยน Capacitor พัดลมคอยล์ร้อน' },
    ]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <h3 className="text-3xl font-black text-slate-800 italic uppercase">Service <span className="text-blue-600">History</span></h3>
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                    <input type="text" placeholder="ค้นหาตามชื่อแอร์..." className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64" />
                </div>
            </div>

            <div className="relative border-l-2 border-slate-200 ml-4 md:ml-8 space-y-10">
                {history.map((item) => (
                    <div key={item.id} className="relative pl-10">
                        {/* Dot on Timeline */}
                        <div className="absolute -left-[11px] top-0 w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow-sm"></div>
                        
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                                <span className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ClockIcon className="w-4 h-4" /> {item.date}
                                </span>
                                <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-bold uppercase italic">
                                    {item.task}
                                </span>
                            </div>
                            <h4 className="text-xl font-black text-slate-800 mb-2">{item.airName}</h4>
                            <p className="text-slate-500 text-sm mb-4 leading-relaxed">{item.note}</p>
                            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm bg-slate-50 w-fit px-4 py-2 rounded-xl border border-slate-100">
                                <UserIcon className="w-4 h-4" /> ช่าง: {item.tech}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServiceHistory;