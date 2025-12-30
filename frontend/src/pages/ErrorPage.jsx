import { useNavigate } from 'react-router-dom';
import { ShieldExclamationIcon, HomeIcon } from '@heroicons/react/24/outline';

const ErrorPage = ({ type = "404" }) => {
    const navigate = useNavigate();
    
    const content = {
        "403": {
            title: "Access Denied!",
            desc: "ขออภัย คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ เฉพาะผู้ดูแลระบบเท่านั้น",
            icon: <ShieldExclamationIcon className="w-24 h-24 text-red-500" />
        },
        "404": {
            title: "Page Not Found",
            desc: "ไม่พบหน้าที่คุณกำลังค้นหา กรุณาตรวจสอบ URL อีกครั้ง",
            icon: <div className="text-8xl font-black text-slate-200">404</div>
        }
    };

    const data = content[type] || content["404"];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-8 animate-bounce-slow">
                {data.icon}
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 italic uppercase">{data.title}</h1>
            <p className="text-slate-500 mb-10 max-w-md mx-auto">{data.desc}</p>
            
            <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl active:scale-95"
            >
                <HomeIcon className="w-5 h-5" />
                กลับหน้าหลัก Dashboard
            </button>

            <style>{`
                @keyframes bounceSlow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-bounce-slow { animation: bounceSlow 3s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default ErrorPage;