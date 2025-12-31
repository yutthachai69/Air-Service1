// Order Status Constants
const ORDER_STATUS = {
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
const EQUIPMENT_STATUS = {
    NORMAL: 'normal',
    MAINTENANCE_DUE: 'maintenance_due',
    UNDER_REPAIR: 'under_repair',
    OUT_OF_ORDER: 'out_of_order',
    RETIRED: 'retired'
};

// Service Type Constants
const SERVICE_TYPE = {
    CLEANING: 'cleaning',
    NOT_COLD: 'not_cold',
    LEAKING: 'leaking',
    NOISE: 'noise',
    OTHER: 'other'
};

// User Roles
const USER_ROLE = {
    ADMIN: 'admin',
    OWNER: 'owner',
    TENANT: 'tenant',
    TECHNICIAN: 'technician'
};

module.exports = {
    ORDER_STATUS,
    EQUIPMENT_STATUS,
    SERVICE_TYPE,
    USER_ROLE
};



