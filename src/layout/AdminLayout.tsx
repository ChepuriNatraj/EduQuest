
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const AdminLayout: React.FC = () => {
    // Simple PIN check for now - in production use real auth
    const isAuthenticated = sessionStorage.getItem('admin_auth') === 'true';

    if (!isAuthenticated) {
        const pin = prompt('Enter Admin PIN:');
        if (pin === '1234') { // Hardcoded for demo
            sessionStorage.setItem('admin_auth', 'true');
        } else {
            alert('Access Denied');
            return <Navigate to="/" />;
        }
    }

    return (
        <div className="admin-layout">
            <Outlet />
        </div>
    );
};

export default AdminLayout;
