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
            <div className="admin-header" style={{
                background: 'linear-gradient(135deg, var(--brown-dark), var(--brown-medium))',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                marginBottom: 'var(--spacing-lg)',
                boxShadow: 'var(--shadow-md)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div className="container">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-md">
                            <span style={{ fontSize: '1.5rem' }}>🎮</span>
                            <h3 style={{ color: 'var(--gold-bright)', margin: 0, fontFamily: "'Cinzel', serif" }}>
                                Admin Panel
                            </h3>
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
