import { useState, useEffect, useRef } from 'react';
import { 
    WrenchScrewdriverIcon, 
    PhotoIcon, 
    CalendarDaysIcon,
    ChatBubbleLeftEllipsisIcon,
    ShieldCheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useSnackbar } from 'notistack';
import { equipmentService } from '../services/equipmentService';
import { orderService } from '../services/orderService';

const ServiceRequest = () => {
    const { enqueueSnackbar } = useSnackbar();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [equipments, setEquipments] = useState([]);
    const [formData, setFormData] = useState({
        equipment_id: '',
        service_type: 'cleaning',
        description: '',
        customer_name: '',
        customer_phone: '',
        owner_id: 1 // ต้องแก้ให้ดึงจาก user ที่ login
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showPDPAModal, setShowPDPAModal] = useState(false);
    const [showImageSourceModal, setShowImageSourceModal] = useState(false);

    // ดึงรายการเครื่องแอร์
    useEffect(() => {
        fetchEquipments();
        checkPDPAConsent();
    }, []);

    // ตรวจสอบว่าผู้ใช้เคยยินยอม PDPA แล้วหรือยัง
    const checkPDPAConsent = () => {
        try {
            const pdpaConsent = localStorage.getItem('pdpa_image_consent');
            return pdpaConsent === 'accepted';
        } catch (err) {
            console.error('Error checking PDPA consent:', err);
            return false;
        }
    };

    const fetchEquipments = async () => {
        try {
            const res = await equipmentService.getAllEquipments();
            setEquipments(res || []);
        } catch (err) {
            // ถ้าไม่มีสิทธิ์เป็น Owner ให้ใช้ข้อมูลจำลอง
            console.log('ไม่สามารถดึงข้อมูลแอร์ได้:', err);
            setEquipments([]);
        }
    };

    // ฟังก์ชันสำหรับเปิด file picker หลังจากยินยอม PDPA แล้ว
    const triggerFileInput = (captureMode = null) => {
        if (!fileInputRef.current) {
            console.error('File input ref is not available');
            return;
        }
        
        // ถ้ามี capture mode ให้เซ็ต attribute
        if (captureMode) {
            fileInputRef.current.setAttribute('capture', captureMode);
        } else {
            fileInputRef.current.removeAttribute('capture');
        }
        
        // ใช้ setTimeout เพื่อให้แน่ใจว่า DOM update แล้ว และ modal ปิดแล้ว
        setTimeout(() => {
            if (fileInputRef.current) {
                try {
                    // Reset value เพื่อให้สามารถเลือกไฟล์เดิมได้อีกครั้ง
                    fileInputRef.current.value = '';
                    fileInputRef.current.click();
                } catch (error) {
                    console.error('Error triggering file input:', error);
                    enqueueSnackbar('ไม่สามารถเปิด file picker ได้', { variant: 'error' });
                }
            }
        }, 300);
    };

    // เมื่อคลิกที่ area เลือกรูปภาพ
    const handleImageAreaClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // ถ้ามี modal แสดงอยู่แล้ว ไม่ต้องทำอะไร
        if (showImageSourceModal || showPDPAModal) {
            return;
        }
        
        // ตรวจสอบว่ายินยอม PDPA แล้วหรือยัง
        if (!checkPDPAConsent()) {
            // ถ้ายังไม่ยินยอม ให้แสดง PDPA modal ก่อน
            setShowPDPAModal(true);
            return;
        }
        
        // ถ้ายินยอมแล้ว ให้แสดง modal เลือกวิธีการ (ถ่ายรูป หรือเลือกไฟล์)
        setShowImageSourceModal(true);
    };

    // เปิด file picker สำหรับเลือกไฟล์
    const handleSelectFromFiles = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        // ปิด modal ก่อน
        setShowImageSourceModal(false);
        // เรียก triggerFileInput โดยตรง (จะใช้ setTimeout ภายใน)
        triggerFileInput(null); // ไม่ใช้ camera
    };

    // เปิด camera สำหรับถ่ายรูป
    const handleTakePhoto = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        // ปิด modal ก่อน
        setShowImageSourceModal(false);
        // เรียก triggerFileInput โดยตรง (จะใช้ setTimeout ภายใน)
        triggerFileInput('environment'); // environment = กล้องหลัง, user = กล้องหน้า
    };

    // เมื่อเลือกไฟล์แล้ว
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // ตรวจสอบอีกครั้งว่ายินยอมแล้ว (ป้องกันกรณีที่ user เปลี่ยน file input โดยตรง)
            if (!checkPDPAConsent()) {
                e.target.value = ''; // Clear file input
                setShowPDPAModal(true);
                return;
            }
            
            processImageFile(file);
        }
    };

    const processImageFile = (file) => {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleAcceptPDPA = () => {
        try {
            localStorage.setItem('pdpa_image_consent', 'accepted');
            setShowPDPAModal(false);
            
            // หลังจากยินยอมแล้ว ให้แสดง modal เลือกวิธีการ
            setTimeout(() => {
                setShowImageSourceModal(true);
            }, 200);
        } catch (err) {
            console.error('Error saving PDPA consent:', err);
            enqueueSnackbar('เกิดข้อผิดพลาดในการบันทึกการยินยอม', { variant: 'error' });
        }
    };

    const handleRejectPDPA = () => {
        setShowPDPAModal(false);
        enqueueSnackbar('ไม่สามารถใช้งานได้หากไม่ยินยอมการใช้ข้อมูล', { variant: 'info' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.equipment_id) {
            enqueueSnackbar('กรุณาเลือกเครื่องแอร์', { variant: 'warning' });
            return;
        }
        
        try {
            setLoading(true);
            
            // สร้าง tracking number (ตัวอย่าง)
            const tracking_no = `TRK-${Date.now()}`;
            const selectedEquip = equipments.find(eq => eq.id === parseInt(formData.equipment_id));
            
            // สร้าง FormData สำหรับส่งข้อมูลพร้อมรูปภาพ
            const formDataToSend = new FormData();
            formDataToSend.append('tracking_no', tracking_no);
            formDataToSend.append('customer_name', formData.customer_name || 'ไม่ระบุชื่อ');
            formDataToSend.append('customer_phone', formData.customer_phone || '');
            formDataToSend.append('service_type', formData.service_type);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('equipment_id', parseInt(formData.equipment_id));
            formDataToSend.append('owner_id', selectedEquip?.owner_id || 1);
            
            // ถ้ามีรูปภาพ ให้เพิ่มเข้าไปใน FormData
            if (imageFile) {
                formDataToSend.append('tenant_img', imageFile);
            }

            await orderService.createOrder(formDataToSend);
            
            enqueueSnackbar('ส่งเรื่องแจ้งซ่อมเรียบร้อยแล้ว! ช่างจะติดต่อกลับโดยเร็ว', { variant: 'success' });
            
            // Reset form
            setFormData({
                equipment_id: '',
                service_type: 'cleaning',
                description: '',
                customer_name: '',
                customer_phone: '',
                owner_id: 1
            });
            setImageFile(null);
            setImagePreview(null);
        } catch (err) {
            enqueueSnackbar('เกิดข้อผิดพลาด: ' + (err.response?.data?.error || err.message), { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in px-2 sm:px-0">
            <div className="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-900 p-6 sm:p-8 text-white">
                    <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight">
                        Create <span className="text-blue-500">Service Request</span>
                    </h3>
                    <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">แจ้งซ่อมหรือขอรับบริการล้างแอร์</p>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                    {/* เลือกเครื่องแอร์ */}
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">เลือกเครื่องที่ต้องการรับบริการ</label>
                        {equipments.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {equipments.map((equip) => (
                                    <label key={equip.id} className="relative flex items-center p-4 border-2 border-slate-100 rounded-2xl cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all group">
                                        <input 
                                            type="radio" 
                                            name="equipment_id" 
                                            value={equip.id}
                                            checked={formData.equipment_id === equip.id.toString()}
                                            onChange={(e) => setFormData({...formData, equipment_id: e.target.value})}
                                            className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-slate-300" 
                                            required 
                                        />
                                        <div className="ml-4">
                                            <p className="text-sm font-black text-slate-800">{equip.brand} {equip.model}</p>
                                            <p className="text-[10px] text-slate-400 font-bold">ห้อง {equip.room_number} • Serial: {equip.serial_number}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                                ไม่มีข้อมูลเครื่องแอร์ในระบบ
                            </div>
                        )}
                    </div>

                    {/* ข้อมูลลูกค้า */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">ชื่อลูกค้า</label>
                            <input
                                type="text"
                                value={formData.customer_name}
                                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="ชื่อ-นามสกุล"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">เบอร์โทรศัพท์</label>
                            <input
                                type="tel"
                                value={formData.customer_phone}
                                onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="08x-xxx-xxxx"
                            />
                        </div>
                    </div>

                    {/* ระบุอาการ */}
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">ระบุปัญหาหรืออาการ</label>
                        <select 
                            value={formData.service_type}
                            onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="cleaning">ขอรับบริการล้างแอร์ประจำปี</option>
                            <option value="not_cold">แอร์ไม่เย็น / ลมไม่ออก</option>
                            <option value="leaking">น้ำรั่ว / น้ำหยดจากตัวเครื่อง</option>
                            <option value="noise">เครื่องทำงานเสียงดังผิดปกติ</option>
                            <option value="other">อื่นๆ (ระบุรายละเอียดเพิ่มเติม)</option>
                        </select>
                    </div>

                    {/* รายละเอียดเพิ่มเติม */}
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">รายละเอียดเพิ่มเติม</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows={4}
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="อธิบายรายละเอียดปัญหาเพิ่มเติม (ถ้ามี)"
                        />
                    </div>

                    {/* อัปโหลดรูปภาพ */}
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">แนบรูปภาพ (ถ้ามี)</label>
                        <div 
                            onClick={handleImageAreaClick}
                            className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all cursor-pointer min-h-[120px]"
                        >
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            {imagePreview ? (
                                <div className="w-full">
                                    <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-contain rounded-xl mb-2" />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setImageFile(null);
                                            setImagePreview(null);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = '';
                                            }
                                        }}
                                        className="text-xs text-red-500 hover:text-red-700 font-bold"
                                    >
                                        ลบรูปภาพ
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <PhotoIcon className="w-12 h-12 mb-2" />
                                    <span className="text-sm font-bold">คลิกเพื่อเพิ่มรูปภาพ</span>
                                    <span className="text-xs mt-1">ถ่ายรูปหรือเลือกรูปจากอุปกรณ์</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
                    >
                        {loading ? 'กำลังส่งข้อมูล...' : 'ส่งเรื่องแจ้งซ่อม'}
                    </button>
                </form>
            </div>

            {/* Modal เลือกวิธีการ (ถ่ายรูป หรือเลือกไฟล์) */}
            {showImageSourceModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        setShowImageSourceModal(false);
                    }
                }}>
                    <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full relative animate-fade-in">
                        <button 
                            type="button"
                            onClick={() => setShowImageSourceModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                        
                        <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2 text-center">
                            เลือกวิธีการ
                        </h3>
                        <p className="text-sm text-slate-500 text-center mb-6">
                            คุณต้องการเพิ่มรูปภาพอย่างไร?
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* ปุ่มถ่ายรูป */}
                            <button
                                type="button"
                                onClick={handleTakePhoto}
                                className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all group"
                            >
                                <div className="bg-blue-600 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                    <PhotoIcon className="w-8 h-8 text-white" />
                                </div>
                                <span className="font-bold text-blue-700 text-sm">ถ่ายรูป</span>
                                <span className="text-xs text-blue-500 mt-1">ใช้กล้อง</span>
                            </button>
                            
                            {/* ปุ่มเลือกไฟล์ */}
                            <button
                                type="button"
                                onClick={handleSelectFromFiles}
                                className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-slate-100 rounded-2xl border-2 border-slate-200 hover:border-slate-400 transition-all group"
                            >
                                <div className="bg-slate-600 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <span className="font-bold text-slate-700 text-sm">เลือกไฟล์</span>
                                <span className="text-xs text-slate-500 mt-1">จากอุปกรณ์</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PDPA Consent Modal */}
            {showPDPAModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full relative">
                        <div className="flex items-center justify-center mb-4">
                            <ShieldCheckIcon className="w-16 h-16 text-blue-600" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-4 text-center">
                            การยินยอมการใช้ข้อมูลส่วนบุคคล
                        </h3>
                        <p className="text-sm text-slate-600 mb-6 text-center leading-relaxed">
                            เพื่อให้บริการได้อย่างมีประสิทธิภาพ ระบบจำเป็นต้องใช้ภาพถ่ายหรือรูปภาพที่คุณอัปโหลด 
                            ในการติดตามและจัดการงานซ่อม คุณยินยอมให้ระบบใช้ข้อมูลดังกล่าวหรือไม่?
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleRejectPDPA}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                            >
                                ไม่ยินยอม
                            </button>
                            <button
                                type="button"
                                onClick={handleAcceptPDPA}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                            >
                                ยินยอม
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceRequest;
