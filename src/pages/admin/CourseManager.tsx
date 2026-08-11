import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';

export const CourseManager: React.FC = () => {
  const { courses, deleteCourse } = useCourses();

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteCourse(id);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Manage Courses | Admin | Ready to Respond</title>
      </Helmet>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Manage Courses</h1>
        <Link to="/admin/courses/new" className="btn btn-primary">
          + Add Course
        </Link>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--color-bg-main)', borderBottom: '1px solid var(--color-border)' }}>
              <tr>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Course Name</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Price</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Duration</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No courses found. Add your first course!
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{course.name}</td>
                    <td style={{ padding: '1rem' }}>{course.price}</td>
                    <td style={{ padding: '1rem' }}>{course.duration}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <Link to={`/admin/courses/edit/${course.id}`} className="btn btn-outline" style={{ padding: '0.5rem' }} aria-label="Edit Course">
                        <Edit size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(course.id, course.name)}
                        className="btn" 
                        style={{ padding: '0.5rem', backgroundColor: 'var(--color-secondary)', color: 'white', borderColor: 'var(--color-secondary)' }}
                        aria-label="Delete Course"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
