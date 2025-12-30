import { useState, useEffect } from 'react';
import { 
    UserPlusIcon, 
    PhoneIcon, 
    CheckBadgeIcon, 
    NoSymbolIcon,
    EllipsisVerticalIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useSnackbar } from 'notistack';
import { technicianService } from '../services/technicianService';

const TechnicianManager = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [techs, setTechs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', specialty: '' });

    useEffect(() => {
        fetchTechs();
    }, []);

    const fetchTechs = async () => {
        try {
            setLoading(true);
            const res = await technicianService.getAllTechnicians();
            setTechs(res || []);
        } catch (err) {
            enqueueSnackbar('ไม่สามารถดึงข้อมูลช่างได้: ' + (err.response?.data?.error || err.message), { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTech = async (e) => {
        e.preventDefault();
        try {
            await technicianService.createTechnician(formData);
            enqueueSnackbar('เพิ่มช่างสำเร็จ!', { variant: 'success' });
            setShowModal(false);
            setFormData({ name: '', phone: '', specialty: '' });
            fetchTechs();
        } catch (err) {
            enqueueSnackbar('เกิดข้อผิดพลาด: ' + (err.response?.data?.error || err.message), { variant: 'error' });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-3xl font-black text-slate-800 italic uppercase">Technician <span className="text-blue-600">Team</span></h3>
                    <p className="text-slate-500 font-medium">จัดการทีมช่างและตรวจสอบสถานะการทำงาน</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                >
                    <UserPlusIcon className="w-5 h-5" />
                    เพิ่มช่างใหม่
                </button>
            </div>

            {/* Grid Cards */}
            {loading ? (
                <div className="text-center py-12 text-slate-400">กำลังโหลดข้อมูล...</div>
            ) : techs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">ยังไม่มีช่างในระบบ</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {techs.map((tech) => (
                        <div key={tech.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                            {/* Status Bar */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-400"></div>
                            
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">
                                    👨‍🔧
                                </div>
                                <button className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                    <EllipsisVerticalIcon className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-1 mb-6">
                                <h4 className="text-xl font-black text-slate-800">{tech.name}</h4>
                                <p className="text-blue-600 text-sm font-bold uppercase tracking-wider">{tech.specialty || 'ช่างซ่อมแอร์'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                    <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Rating</p>
                                    <p className="text-xl font-black text-slate-800">{tech.rating ? tech.rating.toFixed(1) : '0.0'}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                    <p className="text-[10px] text-slate-400 font-black uppercase mb-1">สถานะ</p>
                                    <p className="text-xs font-black text-emerald-600">พร้อมทำงาน</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                {tech.phone && (
                                    <a href={`tel:${tech.phone}`} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                                        <PhoneIcon className="w-4 h-4" /> โทรหา
                                    </a>
                                )}
                                <button className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all">
                                    ดูประวัติ
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal เพิ่มช่าง */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full relative">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                        
                        <h3 className="text-2xl font-black text-slate-800 mb-6">เพิ่มช่างใหม่</h3>
                        
                        <form onSubmit={handleCreateTech} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ชื่อ-นามสกุล</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">เบอร์โทรศัพท์</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ความเชี่ยวชาญ</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.specialty}
                                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                                    placeholder="เช่น ล้างแอร์, ซ่อมแอร์, ติดตั้ง"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                                >
                                    บันทึก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TechnicianManager;