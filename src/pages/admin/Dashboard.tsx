import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { BookOpen, Users, DollarSign } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';

export const Dashboard: React.FC = () => {
  const { courses } = useCourses();

  const stats = [
    { title: 'Total Courses', value: courses.length, icon: <BookOpen size={24} /> },
    { title: 'Active Students', value: '--', icon: <Users size={24} /> },
    { title: 'Monthly Revenue', value: '--', icon: <DollarSign size={24} /> },
  ];

  return (
    <div>
      <Helmet>
        <title>Admin Dashboard | Ready to Respond</title>
      </Helmet>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <Link to="/admin/courses/new" className="btn btn-primary">
          + Add Course
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{stat.title}</p>
                <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--color-text-main)' }}>{stat.value}</h3>
              </div>
              <div style={{ color: 'var(--color-primary)', backgroundColor: 'rgba(10, 66, 117, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#fff', padding: '1.75rem', borderRadius: '0.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
        <h2 style={{ marginTop: 0, color: 'var(--color-primary-dark)' }}>Course Management & Live Updates</h2>
        <p style={{ color: 'var(--color-text-main)', lineHeight: 1.6 }}>
          From here you can customize your courses, pricing, descriptions, icons, and display order. 
          Any edits you save automatically reflect on the public <strong>Classes & Pricing</strong> page and individual course pages.
        </p>

        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem 1.25rem', 
          backgroundColor: '#f8fafc', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
              <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>Vercel Cloud Integration</strong>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Connected via Vercel Serverless API (<code style={{ fontSize: '0.8rem' }}>/api/courses</code>). Edits are saved directly to Vercel storage for all site visitors.
            </span>
          </div>

          <Link to="/admin/courses" className="btn btn-outline" style={{ fontSize: '0.875rem' }}>
            Manage Courses &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
