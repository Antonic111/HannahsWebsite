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

      <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
        <h2>Welcome to the Admin Portal</h2>
        <p>
          From here you can manage your courses and pricing. Any changes made to courses will immediately reflect on the public "Classes & Pricing" page.
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          <em>Note: This is a simulated backend for demonstration. Data is saved locally in your browser.</em>
        </p>
      </div>
    </div>
  );
};
