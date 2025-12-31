// Order Status Constants
export const ORDER_STATUS = {
    PENDING_OWNER: 'pending_owner',
    PENDING: 'pending',
    APPROVED: 'approved',
    CONFIRMED: 'confirmed',
    ON_THE_WAY: 'on_the_way',
    IN_PROGRESS: 'in_progress',
    WAITING_SPARE: 'waiting_spare',
    WAITING_OWNER: 'waiting_owner',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

// Equipment Status Constants
export const EQUIPMENT_STATUS = {
    NORMAL: 'normal',
    MAINTENANCE_DUE: 'maintenance_due',
    UNDER_REPAIR: 'under_repair',
    OUT_OF_ORDER: 'out_of_order',
    RETIRED: 'retired'
};

// Service Type Constants
export const SERVICE_TYPE = {
    CLEANING: 'cleaning',
    NOT_COLD: 'not_cold',
    LEAKING: 'leaking',
    NOISE: 'noise',
    OTHER: 'other'
};

// User Roles
export const USER_ROLE = {
    ADMIN: 'admin',
    OWNER: 'owner',
    TENANT: 'tenant',
    TECHNICIAN: 'technician'
};

// Polling Intervals (in milliseconds)
export const POLLING_INTERVALS = {
    NOTIFICATIONS: 30000, // 30 seconds
    STATS: 60000 // 1 minute
};

// Order Status Labels (Thai)
export const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.PENDING_OWNER]: 'รอรับเรื่อง',
    [ORDER_STATUS.PENDING]: 'รอรับเรื่อง',
    [ORDER_STATUS.APPROVED]: 'อนุมัติแล้ว',
    [ORDER_STATUS.CONFIRMED]: 'รับเรื่องแล้ว',
    [ORDER_STATUS.ON_THE_WAY]: 'ช่างกำลังเดินทาง',
    [ORDER_STATUS.IN_PROGRESS]: 'กำลังดำเนินการ',
    [ORDER_STATUS.WAITING_SPARE]: 'รออะไหล่',
    [ORDER_STATUS.WAITING_OWNER]: 'รอตรวจสอบ',
    [ORDER_STATUS.COMPLETED]: 'เสร็จสมบูรณ์',
    [ORDER_STATUS.CANCELLED]: 'ยกเลิก'
};

// Equipment Status Labels (Thai)
export const EQUIPMENT_STATUS_LABELS = {
    [EQUIPMENT_STATUS.NORMAL]: 'ปกติ',
    [EQUIPMENT_STATUS.MAINTENANCE_DUE]: 'ใกล้กำหนดล้าง',
    [EQUIPMENT_STATUS.UNDER_REPAIR]: 'แจ้งซ่อมอยู่',
    [EQUIPMENT_STATUS.OUT_OF_ORDER]: 'ชำรุด / งดใช้งาน',
    [EQUIPMENT_STATUS.RETIRED]: 'เลิกใช้งาน'
};



