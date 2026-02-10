import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const AdminLayout: React.FC = () => {
    const isAuthenticated = sessionStorage.getItem('admin_auth') === 'true';

    if (!isAuthenticated) {
        const pin = prompt('🔐 Enter Admin PIN:');
        if (pin === '1234') {
            sessionStorage.setItem('admin_auth', 'true');
        } else {
            alert('❌ Access Denied - Invalid PIN');
            return <Navigate to="/" />;
        }
    }

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('admin_auth');
            window.location.href = '/';
        }
    };

    return (
        <div className="admin-layout">
            <div className="admin-header">
                <div className="container">
                    <div className="flex justify-between items-center">
                        {/* Mini Logo Trio in Header */}
                        <div className="brand-logos" style={{ marginBottom: 0, justifyContent: 'flex-start', gap: 'var(--spacing-sm)' }}>
                            <img
                                src="/assets/width_193.png"
                                alt="EduMoon"
                                className="brand-logo brand-logo--xs"
                            />
                            <img
                                src="/assets/width_800.png"
                                alt="Admin"
                                className="brand-logo brand-logo--md"
                            />
                            <img
                                src="/assets/width_500.png"
                                alt="EduMoon"
                                className="brand-logo brand-logo--sm"
                            />
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.85rem' }}
                        >
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </div>
            <Outlet />
        </div>
    );
};

export default AdminLayout;
