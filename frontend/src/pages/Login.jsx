import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isError, setIsError] = useState(false);
    const [validationError, setValidationError] = useState({ field: null, message: '' });
    const [isLoading, setIsLoading] = useState(false);
    
    const formRef = useRef(null);
    const { enqueueSnackbar } = useSnackbar();
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsError(false);
        setValidationError({ field: null, message: '' });

        // --- Custom Validation ---
        if (!username) {
            setValidationError({ field: 'username', message: 'โปรดระบุชื่อผู้ใช้งาน' });
            triggerShake();
            return;
        }
        if (!password) {
            setValidationError({ field: 'password', message: 'โปรดระบุรหัสผ่าน' });
            triggerShake();
            return;
        }

        setIsLoading(true);
        const result = await login(username, password);
        setIsLoading(false);

        if (result.success) {
            enqueueSnackbar('ยินดีต้อนรับกลับเข้าสู่ระบบ 🎉', { 
                variant: 'success',
                anchorOrigin: { vertical: 'top', horizontal: 'center' }
            });

            setTimeout(() => { 
                navigate('/dashboard');
            }, 800);
        } else {
            triggerShake();
            const errorMessage = result.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
            enqueueSnackbar(errorMessage, { 
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'center' },
                style: { borderRadius: '12px', fontWeight: 'bold' }
            });
        }
    };

    const triggerShake = () => {
        setIsError(true);
        setTimeout(() => setIsError(false), 500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 sm:p-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600/10"></div>
            
            <form 
                onSubmit={handleLogin} 
                className={`bg-white p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-[420px] border border-slate-100 transition-all duration-300 ${isError ? 'animate-shake border-red-200' : ''}`}
            >
                <div className="text-center mb-8 sm:mb-12">
                    <div className="inline-block p-3 sm:p-4 bg-blue-50 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight italic">AIR<span className="text-blue-600 not-italic">SERVICE</span></h2>
                    <p className="text-slate-400 mt-2 font-medium text-sm sm:text-base">Enterprise Solution v1.0</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    {/* Username Field */}
                    <div className="relative">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Username</label>
                        <input 
                            type="text" 
                            value={username}
                            placeholder="กรอกชื่อผู้ใช้งาน" 
                            className={`w-full p-3 sm:p-4 bg-slate-50 border-2 rounded-xl sm:rounded-2xl outline-none transition-all duration-200 text-sm sm:text-base ${validationError.field === 'username' ? 'border-red-400 bg-red-50' : 'border-slate-50 focus:border-blue-500 focus:bg-white'}`}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        {validationError.field === 'username' && (
                            <div className="absolute -top-1 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md animate-bounce">
                                {validationError.message}
                            </div>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="relative">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                        <input 
                            type="password" 
                            value={password}
                            placeholder="กรอกรหัสผ่าน" 
                            className={`w-full p-3 sm:p-4 bg-slate-50 border-2 rounded-xl sm:rounded-2xl outline-none transition-all duration-200 text-sm sm:text-base ${validationError.field === 'password' ? 'border-red-400 bg-red-50' : 'border-slate-50 focus:border-blue-500 focus:bg-white'}`}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {validationError.field === 'password' && (
                            <div className="absolute -top-1 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md animate-bounce">
                                {validationError.message}
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-slate-900 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-blue-600 shadow-lg shadow-slate-200 hover:shadow-blue-200 transition-all active:scale-95 mt-4 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'SIGN IN'}</span>
                        {!isLoading && (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        )}
                    </button>
                </div>
            </form>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
                    20%, 40%, 60%, 80% { transform: translateX(6px); }
                }
                .animate-shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
        </div>
    );
};

export default Login;