// src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar'; // Tạo component Sidebar riêng

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-muted/40"> {/* Nền xám nhẹ */}
      <AdminSidebar /> {/* Thanh điều hướng bên trái */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;