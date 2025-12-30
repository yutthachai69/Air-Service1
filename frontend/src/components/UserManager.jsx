import { useState, useEffect } from 'react';
import { 
    UserPlusIcon, 
    ShieldCheckIcon, 
    TrashIcon, 
    KeyIcon,
    UserGroupIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useSnackbar } from 'notistack';
import { authService } from '../services/authService';

const UserManager = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'tenant', technician_id: '' });

    // ดึงข้อมูลผู้ใช้ทั้งหมด
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await authService.getAllUsers();
            setUsers(res || []);
        } catch (err) {
            enqueueSnackbar('ไม่สามารถดึงข้อมูลผู้ใช้ได้: ' + (err.response?.data?.message || err.message), { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // สร้างผู้ใช้ใหม่
    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await authService.createUser(formData);
            enqueueSnackbar('สร้างผู้ใช้งานสำเร็จ!', { variant: 'success' });
            setShowModal(false);
            setFormData({ username: '', password: '', role: 'tenant', technician_id: '' });
            fetchUsers();
        } catch (err) {
            enqueueSnackbar('เกิดข้อผิดพลาด: ' + (err.response?.data?.error || err.message), { variant: 'error' });
        }
    };

    // ลบผู้ใช้
    const handleDeleteUser = async (id) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้คนนี้?')) return;
        try {
            await authService.deleteUser(id);
            enqueueSnackbar('ลบผู้ใช้งานสำเร็จ!', { variant: 'success' });
            fetchUsers();
        } catch (err) {
            enqueueSnackbar('ไม่สามารถลบได้: ' + (err.response?.data?.message || err.message), { variant: 'error' });
        }
    };

    const adminCount = users.filter(u => u.role === 'admin').length;
    const totalCount = users.length;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-3xl font-black text-slate-800 italic uppercase">User <span className="text-blue-600">Management</span></h3>
                    <p className="text-slate-500 font-medium">จัดการสิทธิ์การเข้าถึงและบัญชีผู้ใช้งานในระบบ</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 active:scale-95"
                >
                    <UserPlusIcon className="w-5 h-5" />
                    เพิ่มผู้ใช้งานใหม่
                </button>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><ShieldCheckIcon className="w-8 h-8" /></div>
                    <div><p className="text-xs font-bold text-slate-400 uppercase">Administrators</p><p className="text-2xl font-black text-slate-800">{adminCount} คน</p></div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                    <div className="bg-slate-100 p-4 rounded-2xl text-slate-600"><UserGroupIcon className="w-8 h-8" /></div>
                    <div><p className="text-xs font-bold text-slate-400 uppercase">Total Users</p><p className="text-2xl font-black text-slate-800">{totalCount} คน</p></div>
                </div>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">User / Email</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Last Login</th>
                                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 uppercase">
                                                {user.username?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{user.username}</p>
                                                <p className="text-xs text-slate-400">ID: {user.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                            user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-6 text-sm font-medium text-slate-500">-</td>
                                    <td className="p-6">
                                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 shadow-sm transition-all border border-transparent hover:border-slate-100"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal สร้างผู้ใช้ใหม่ */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full relative">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                        
                        <h3 className="text-2xl font-black text-slate-800 mb-6">เพิ่มผู้ใช้งานใหม่</h3>
                        
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Username</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="owner">Owner</option>
                                    <option value="tenant">Tenant</option>
                                    <option value="technician">Technician</option>
                                </select>
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

            {loading && (
                <div className="text-center py-8 text-slate-400">กำลังโหลดข้อมูล...</div>
            )}
        </div>
    );
};

export default UserManager;