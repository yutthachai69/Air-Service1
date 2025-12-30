import { useNavigate } from 'react-router-dom';

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-10 w-96 h-96 bg-blue-400/20 rounded-full blur-[120px] animate-blob"></div>
                <div className="absolute bottom-0 -right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
            </div>

            <div className="max-w-4xl relative z-10 animate-fade-in">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-black tracking-widest mb-10 border border-blue-100 uppercase">
                    <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                    Version 1.0 Release
                </div>

                {/* Main Heading - Responsive Size */}
                <h1 className="text-6xl md:text-9xl font-black text-slate-900 tracking-tighter mb-6 leading-[0.85] italic">
                    AIR<span className="text-blue-600 not-italic">SERVICE</span>
                </h1>

                <p className="text-lg md:text-2xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                    ยกระดับการบริหารจัดการงานล้างแอร์ของคุณ <br className="hidden md:block"/>
                    ด้วยระบบอัจฉริยะที่แม่นยำและรวดเร็วที่สุด
                </p>

                {/* Modern Buttons */}
                <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                    <button 
                        onClick={() => navigate('/login')}
                        className="group relative px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-bold text-xl transition-all hover:bg-blue-600 hover:shadow-[0_20px_40px_rgba(37,99,235,0.3)] active:scale-95"
                    >
                        เริ่มต้นใช้งาน
                        <span className="inline-block ml-2 transition-transform group-hover:translate-x-2">→</span>
                    </button>
                    
                    <button className="text-slate-600 font-bold text-lg hover:text-blue-600 transition-colors border-b-2 border-transparent hover:border-blue-600 pb-1">
                        เรียนรู้เพิ่มเติม
                    </button>
                </div>
            </div>

            <footer className="absolute bottom-10 text-slate-400 text-xs font-bold tracking-[0.2em] uppercase">
                © 2025 AirService Enterprise System
            </footer>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-fade-in { animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-blob { animation: blob 12s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
            `}</style>
        </div>
    );
};

export default Welcome;