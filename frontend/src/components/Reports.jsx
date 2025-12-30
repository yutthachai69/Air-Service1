// แก้ไขการ Import สองบรรทัดแรกให้รวมกัน
import { BarChart, PieChart } from '@mui/x-charts';
import { CurrencyDollarIcon, WrenchScrewdriverIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const Reports = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <h3 className="text-3xl font-black text-slate-800 italic uppercase tracking-tight">
                Reports <span className="text-blue-600">& Analytics</span>
            </h3>

            {/* Top Cards สรุปสั้นๆ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-blue-100 p-4 rounded-2xl text-blue-600">
                        <CurrencyDollarIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">รายได้เดือนนี้</p>
                        <p className="text-2xl font-black text-slate-800">฿45,200</p>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600">
                        <WrenchScrewdriverIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">งานที่สำเร็จ</p>
                        <p className="text-2xl font-black text-slate-800">128 งาน</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow lg:hidden xl:flex">
                     <div className="bg-purple-100 p-4 rounded-2xl text-purple-600">
                        <AcademicCapIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ความพึงพอใจ</p>
                        <p className="text-2xl font-black text-slate-800">4.9 / 5.0</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* กราฟแท่งรายได้รายเดือน */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <h4 className="text-lg font-black text-slate-800 mb-6 italic uppercase">
                        Revenue <span className="text-blue-600">Overview</span>
                    </h4>
                    <div className="h-[300px] w-full">
                        <BarChart
                            xAxis={[{ scaleType: 'band', data: ['Oct', 'Nov', 'Dec'] }]}
                            series={[{ data: [35000, 42000, 45200], label: 'รายได้ (บาท)', color: '#2563eb' }]}
                            borderRadius={10}
                            margin={{ top: 20, bottom: 30, left: 60, right: 20 }}
                        />
                    </div>
                </div>

                {/* Pie Chart สัดส่วนงาน */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <h4 className="text-lg font-black text-slate-800 mb-6 italic uppercase">
                        Job <span className="text-blue-600">Distribution</span>
                    </h4>
                    <div className="h-[300px] w-full flex justify-center">
                        <PieChart
                            series={[{
                                data: [
                                    { id: 0, value: 70, label: 'ล้างแอร์', color: '#2563eb' },
                                    { id: 1, value: 20, label: 'ซ่อมแอร์', color: '#64748b' },
                                    { id: 2, value: 10, label: 'ติดตั้ง', color: '#94a3b8' },
                                ],
                                innerRadius: 80,
                                outerRadius: 110,
                                paddingAngle: 5,
                                cornerRadius: 8,
                            }]}
                            slotProps={{
                                legend: {
                                    direction: 'row',
                                    position: { vertical: 'bottom', horizontal: 'center' },
                                    padding: 0,
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;