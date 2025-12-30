import { XMarkIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, menuItems, activeTab, setActiveTab, handleLogout }) => {
    return (
        <aside className={`
            ${isSidebarOpen ? 'w-72' : 'w-0 lg:w-20'} 
            bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out z-50
            fixed lg:relative h-full overflow-hidden
        `}>
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
                <span className={`text-2xl font-black italic tracking-tighter whitespace-nowrap transition-opacity ${!isSidebarOpen && 'lg:opacity-0'}`}>
                    AIR<span className="text-blue-500 not-italic">SERVICE</span>
                </span>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                    <XMarkIcon className="w-8 h-8" />
                </button>
            </div>

            <nav className="flex-1 pt-4 px-3 space-y-2 overflow-y-auto scrollbar-hide">
                {menuItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => {
                            setActiveTab(item.name);
                            if(window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 p-3 rounded-2xl font-bold transition-all ${
                            activeTab === item.name ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <item.icon className="w-6 h-6 shrink-0" />
                        <span className={`${!isSidebarOpen && 'lg:hidden'} whitespace-nowrap`}>{item.name}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800 overflow-hidden">
                <button onClick={handleLogout} className="w-full flex items-center gap-4 p-3 text-red-400 font-bold hover:bg-red-500/10 rounded-2xl transition-all">
                    <ArrowLeftOnRectangleIcon className="w-6 h-6 shrink-0" />
                    <span className={`${!isSidebarOpen && 'lg:hidden'} whitespace-nowrap`}>ออกจากระบบ</span>
                </button>
            </div>
        </aside>
    );
};

// ห้ามลืมบรรทัดนี้เด็ดขาด!
export default Sidebar;