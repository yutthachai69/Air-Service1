import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { SnackbarProvider } from 'notistack' // นำเข้า Provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* หุ้ม App ด้วย SnackbarProvider เพื่อเปิดใช้งานการแจ้งเตือนทั่วทั้งโปรเจกต์ */}
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={4000}
      // เปลี่ยนจาก right เป็น center เพื่อให้กระแทกตาตรงกลางหน้าจอ
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      // ปรับแต่ง Style พื้นฐานให้ดูพรีเมียมขึ้น
      DomRootProps={{
        style: { fontWeight: 'bold' }
      }}
    >
      <App />
    </SnackbarProvider>
  </React.StrictMode>,
)