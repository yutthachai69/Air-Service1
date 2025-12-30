import React, { useState, useEffect } from 'react';
import SidebarLayout from './SidebarLayout';

// Import Components ทั้งหมด
import AirRegistry from './AirRegistry';
import ServiceRequest from './ServiceRequest';
import ServiceOrders from './ServiceOrders';
import StatusTracker from './StatusTracker'; // <-- เพิ่มการ Import
import TechnicianManager from './TechnicianManager';
import ServiceHistory from './ServiceHistory';
import Reports from './Reports';
import UserManager from './UserManager';
import NotificationCenter from './NotificationCenter';

const Dashboard = () => {
    // Default Tab
    const [activeTab, setActiveTab] = useState('Overview');
    const [userRole, setUserRole] = useState('admin');

    useEffect(() => {
        // ดึง Role จาก LocalStorage (หรือ API)
        const role = localStorage.getItem('role') || 'admin';
        setUserRole(role);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <SidebarLayout 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            userRole={userRole}
            handleLogout={handleLogout}
        >
            {/* ส่วนกำหนด Routing: เลือกแสดง Component ตาม activeTab */}
            {activeTab === 'Overview' && <NotificationCenter />}
            {activeTab === 'ติดตามสถานะ' && <StatusTracker />} {/* <-- เพิ่มบรรทัดนี้เพื่อให้แสดงผล */}
            {activeTab === 'ทะเบียนแอร์' && <AirRegistry />}
            {activeTab === 'ส่งเรื่องแจ้งซ่อม' && <ServiceRequest />}
            {activeTab === 'ใบงานแจ้งซ่อม' && <ServiceOrders />}
            {activeTab === 'จัดการช่าง' && <TechnicianManager />}
            {activeTab === 'ประวัติบริการ' && <ServiceHistory />}
            {activeTab === 'รายงานสรุป' && <Reports />}
            {activeTab === 'จัดการผู้ใช้' && <UserManager />}
        </SidebarLayout>
    );
};

export default Dashboard;