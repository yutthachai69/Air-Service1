// backend/utils/firebaseNotify.js

const admin = require('firebase-admin');

// ลองเรียกใช้ไฟล์กุญแจ
let serviceAccount;
try {
    serviceAccount = require('../firebase-key.json');
} catch (error) {
    console.error("❌ หาไฟล์ firebase-key.json ไม่เจอ! กรุณาเช็คว่าวางไว้ถูกที่ไหม");
}

// ถ้าเจอไฟล์กุญแจ ให้เริ่มระบบ
if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Connected!");
}

exports.sendPushNotification = async (fcmToken, title, body) => {
    // ถ้าไม่มี Token หรือยังเชื่อม Firebase ไม่ติด ให้จบงานเลย
    if (!fcmToken || !serviceAccount) return;

    const message = {
        notification: {
            title: title,
            body: body
        },
        token: fcmToken
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('✅ Notification sent:', response);
    } catch (error) {
        console.error('❌ Error sending notification:', error);
    }
};