import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { PlusIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSnackbar } from 'notistack';
import { equipmentService } from '../services/equipmentService';

const AirRegistry = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        room_number: '',
        brand: '',
        model: '',
        serial_number: '',
        install_date: '',
        tenant_id: '',
        owner_id: 1
    });

    useEffect(() => {
        fetchEquipments();
    }, []);

    const fetchEquipments = async () => {
        try {
            setLoading(true);
            const res = await equipmentService.getAllEquipments();
            setEquipments(res || []);
        } catch (err) {
            enqueueSnackbar('ไม่สามารถดึงข้อมูลได้: ' + (err.response?.data?.error || err.message), { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEquipment = async (e) => {
        e.preventDefault();
        try {
            await equipmentService.createEquipment(formData);
            enqueueSnackbar('ลงทะเบียนแอร์สำเร็จ!', { variant: 'success' });
            setShowModal(false);
            setFormData({
                room_number: '',
                brand: '',
                model: '',
                serial_number: '',
                install_date: '',
                tenant_id: '',
                owner_id: 1
            });
            fetchEquipments();
        } catch (err) {
            enqueueSnackbar('เกิดข้อผิดพลาด: ' + (err.response?.data?.error || err.message), { variant: 'error' });
        }
    };

    const getStatus = (equipment) => {
        // ถ้ามี status field จาก database ให้ใช้ก่อน (priority สูงสุด)
        if (equipment.status && equipment.status !== 'normal') {
            const statusMap = {
                'maintenance_due': 'ใกล้กำหนดล้าง',
                'under_repair': 'แจ้งซ่อมอยู่',
                'out_of_order': 'ชำรุด / งดใช้งาน',
                'retired': 'เลิกใช้งาน'
            };
            return statusMap[equipment.status] || equipment.status;
        }
        
        // ถ้าไม่มี status field ให้คำนวณจาก next_service_date (backward compatibility)
        if (!equipment.next_service_date) return 'ใช้งานได้ปกติ';
        const nextDate = new Date(equipment.next_service_date);
        const today = new Date();
        const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'ใกล้กำหนดล้าง';
        if (diffDays < 30) return 'ใกล้กำหนดล้าง';
        return 'ใช้งานได้ปกติ';
    };

    const filteredEquipments = equipments.filter(eq => 
        eq.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ต้องประกาศ columns ภายใน component เพื่อให้เข้าถึง getStatusColor ได้
    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'brand', headerName: 'ยี่ห้อ', width: 130 },
        { field: 'model', headerName: 'รุ่น', width: 150 },
        { field: 'room_number', headerName: 'ห้อง', width: 120 },
        { field: 'serial_number', headerName: 'รหัสเครื่อง', width: 150 },
        { 
            field: 'status', 
            headerName: 'สถานะ', 
            width: 150,
            renderCell: (params) => {
                const status = params.row.status;
                const getStatusColor = (status) => {
                    if (!status) return 'bg-slate-100 text-slate-700';
                    if (typeof status === 'string' && (status.includes('ใช้งานได้ปกติ') || status === 'normal')) {
                        return 'bg-emerald-100 text-emerald-700';
                    } else if (typeof status === 'string' && (status.includes('ใกล้กำหนดล้าง') || status === 'maintenance_due')) {
                        return 'bg-amber-100 text-amber-700';
                    } else if (typeof status === 'string' && (status.includes('แจ้งซ่อมอยู่') || status === 'under_repair')) {
                        return 'bg-blue-100 text-blue-700';
                    } else if (typeof status === 'string' && (status.includes('ชำรุด') || status.includes('งดใช้งาน') || status === 'out_of_order')) {
                        return 'bg-red-100 text-red-700';
                    } else if (typeof status === 'string' && (status.includes('เลิกใช้งาน') || status === 'retired')) {
                        return 'bg-slate-100 text-slate-700';
                    }
                    return 'bg-slate-100 text-slate-700';
                };
                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(status)}`}>
                        {status}
                    </span>
                );
            }
        },
    ];

    const rows = filteredEquipments.map(eq => ({
        ...eq,
        status: getStatus(eq)
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-96">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="ค้นหาเครื่องแอร์..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200"
                >
                    <PlusIcon className="w-5 h-5" />
                    เพิ่มเครื่องแอร์
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-400">กำลังโหลดข้อมูล...</div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                    <div style={{ height: 450, width: '100%' }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSize={5}
                            rowsPerPageOptions={[5]}
                            disableSelectionOnClick
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F8FAFC', fontWeight: 'bold' },
                                '& .MuiDataGrid-cell': { borderBottom: '1px solid #F8FAFC' },
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Modal เพิ่มเครื่องแอร์ */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                        
                        <h3 className="text-2xl font-black text-slate-800 mb-6">ลงทะเบียนเครื่องแอร์ใหม่</h3>
                        
                        <form onSubmit={handleCreateEquipment} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">เลขห้อง</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.room_number}
                                        onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ยี่ห้อ</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.brand}
                                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">รุ่น</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.model}
                                        onChange={(e) => setFormData({...formData, model: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">รหัสเครื่อง</label>
                                    <input
                                        type="text"
                                        value={formData.serial_number}
                                        onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">วันที่ติดตั้ง</label>
                                    <input
                                        type="date"
                                        value={formData.install_date}
                                        onChange={(e) => setFormData({...formData, install_date: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
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

export default AirRegistry;