import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LogOut } from 'lucide-react';
import styles from './AdminLayout.module.css';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

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
          
          <Link to="/" className={styles.navItem} style={{ marginTop: 'auto' }}>
            <LogOut size={20} />
            Exit Admin
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
