import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdminLogin } from '../pages/admin/AdminLogin';
import styles from './AdminLayout.module.css';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Manage Courses', path: '/admin/courses', icon: <BookOpen size={20} /> },
  ];

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar / Topnav */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link to="/" className={styles.sidebarBrand}>
            Ready to Respond
          </Link>
          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>ADMIN</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${
                location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
                  ? styles.navItemActive
                  : ''
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          
          <button
            type="button"
            onClick={logout}
            className={styles.navItem}
            style={{ 
              marginTop: 'auto', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              width: '100%', 
              textAlign: 'left',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              color: 'rgba(255, 255, 255, 0.75)'
            }}
            title="Lock admin portal and log out"
          >
            <Lock size={18} />
            <span>Lock & Log Out</span>
          </button>

          <Link to="/" className={styles.navItem} style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>
            <LogOut size={16} />
            <span>Exit to Website</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};
