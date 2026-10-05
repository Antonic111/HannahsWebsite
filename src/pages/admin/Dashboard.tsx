import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { BookOpen, Users, DollarSign, Plus } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const { courses, storageConnected } = useCourses();

  const stats = [
    { title: 'Total Courses', value: courses.length, icon: <BookOpen size={22} /> },
    { title: 'Active Students', value: '--', icon: <Users size={22} /> },
    { title: 'Monthly Revenue', value: '--', icon: <DollarSign size={22} /> },
  ];

  return (
    <div className={styles.container}>
      <Helmet>
        <title>Admin Dashboard | Ready to Respond</title>
      </Helmet>

      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <Link to="/admin/courses/new" className={`btn btn-primary ${styles.addBtn}`}>
          <Plus size={16} />
          <span>Add Course</span>
        </Link>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statInner}>
              <div>
                <p className={styles.statTitle}>{stat.title}</p>
                <h3 className={styles.statValue}>{stat.value}</h3>
              </div>
              <div className={styles.statIconBox}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.infoCard}>
        <h2 className={styles.infoTitle}>Course Management & Live Updates</h2>
        <p className={styles.infoText}>
          From here you can customize your courses, pricing, descriptions, icons, and display order. 
          Any edits you save automatically reflect on the public <strong>Classes & Pricing</strong> page and individual course pages.
        </p>

        <div 
          className={styles.storageAlert}
          style={{ 
            backgroundColor: storageConnected ? '#f0fdf4' : '#fffbeb', 
            border: storageConnected ? '1px solid #bbf7d0' : '1px solid #fde68a',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: storageConnected ? '#22c55e' : '#f59e0b', 
                display: 'inline-block' 
              }} />
              <strong style={{ fontSize: '0.9rem', color: storageConnected ? '#15803d' : '#92400e' }}>
                {storageConnected ? 'Vercel Cloud Storage Connected' : 'Local Browser Storage Active'}
              </strong>
            </div>
            <span style={{ fontSize: '0.85rem', color: storageConnected ? '#166534' : '#78350f', lineHeight: 1.4, display: 'inline-block' }}>
              {storageConnected 
                ? 'Changes are automatically synced to Vercel storage and visible to all visitors on readytorespond.ca.'
                : 'Custom courses are preserved safely in your browser. To sync live across all devices and visitors, connect Vercel Blob or KV in your Vercel Dashboard under Storage.'}
            </span>
          </div>

          <Link to="/admin/courses" className={`btn btn-outline ${styles.storageBtn}`} style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
            Manage Courses &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
