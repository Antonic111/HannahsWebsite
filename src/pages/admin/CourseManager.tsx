import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Edit, Trash2, ExternalLink, GripVertical, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { CourseIcon } from '../../components/CourseIcon';

export const CourseManager: React.FC = () => {
  const { courses, deleteCourse, reorderCourses } = useCourses();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const saveTimerRef = useRef<number | null>(null);

  const showSaveNotice = (msg = 'Order updated') => {
    setSaveMessage(msg);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      setSaveMessage(null);
    }, 2500);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteCourse(id);
    }
  };

  const moveCourse = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= courses.length) return;
    const reordered = [...courses];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    reorderCourses(reordered);
    showSaveNotice(`Moved "${moved.name}" to position ${toIndex + 1}`);
  };

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      moveCourse(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div>
      <Helmet>
        <title>Manage Courses | Admin | Ready to Respond</title>
      </Helmet>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Manage Courses</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Add, edit, or rearrange course offerings. Order set here reflects on the public Classes & Pricing page.
          </p>
        </div>
        <Link to="/admin/courses/new" className="btn btn-primary">
          + Add Course
        </Link>
      </div>

      {/* Helper & Status Notice */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', minHeight: '28px' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <GripVertical size={15} aria-hidden="true" />
          <span>Drag rows by the grip handle or use the arrow buttons to rearrange display order.</span>
        </span>
        {saveMessage && (
          <span 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              fontSize: '0.8rem', 
              color: '#15803d', 
              backgroundColor: '#f0fdf4', 
              border: '1px solid #bbf7d0', 
              padding: '0.2rem 0.65rem', 
              borderRadius: '9999px',
              fontWeight: 600,
            }}
            role="status"
          >
            <Check size={13} />
            <span>{saveMessage}</span>
          </span>
        )}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--color-bg-main)', borderBottom: '1px solid var(--color-border)' }}>
              <tr>
                <th style={{ width: '64px', padding: '0.875rem 0.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.8125rem' }}>
                  Order
                </th>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Course Name</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Price</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Duration</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No courses found. Add your first course!
                  </td>
                </tr>
              ) : (
                courses.map((course, index) => {
                  const isDragging = draggedIndex === index;
                  const isDragOver = dragOverIndex === index;

                  return (
                    <tr 
                      key={course.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      style={{ 
                        borderBottom: isDragOver && draggedIndex !== null && draggedIndex < index 
                          ? '2px solid var(--color-primary)' 
                          : '1px solid var(--color-border)',
                        borderTop: isDragOver && draggedIndex !== null && draggedIndex > index 
                          ? '2px solid var(--color-primary)' 
                          : undefined,
                        backgroundColor: isDragging 
                          ? '#f1f5f9' 
                          : isDragOver 
                          ? 'rgba(10, 66, 117, 0.05)' 
                          : '#ffffff',
                        opacity: isDragging ? 0.45 : 1,
                        transition: 'background-color 0.15s, opacity 0.15s',
                        cursor: isDragging ? 'grabbing' : 'default',
                      }}
                    >
                      {/* Drag Handle & Order Buttons */}
                      <td style={{ padding: '0.5rem', textAlign: 'center', verticalAlign: 'middle', userSelect: 'none' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'center' }}>
                          <div 
                            title="Drag to reorder" 
                            style={{ 
                              cursor: 'grab', 
                              display: 'flex', 
                              alignItems: 'center', 
                              color: isDragging ? 'var(--color-primary)' : '#94a3b8',
                              padding: '0.25rem 0.1rem',
                              borderRadius: '4px',
                            }}
                            aria-label="Drag handle"
                          >
                            <GripVertical size={18} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button
                              type="button"
                              onClick={() => moveCourse(index, index - 1)}
                              disabled={index === 0}
                              title="Move up"
                              aria-label={`Move ${course.name} up`}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: index === 0 ? 'not-allowed' : 'pointer',
                                opacity: index === 0 ? 0.2 : 0.75,
                                color: 'var(--color-primary)',
                                lineHeight: 1,
                                display: 'flex',
                              }}
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveCourse(index, index + 1)}
                              disabled={index === courses.length - 1}
                              title="Move down"
                              aria-label={`Move ${course.name} down`}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: index === courses.length - 1 ? 'not-allowed' : 'pointer',
                                opacity: index === courses.length - 1 ? 0.2 : 0.75,
                                color: 'var(--color-primary)',
                                lineHeight: 1,
                                display: 'flex',
                              }}
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.875rem 1rem', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div 
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(230, 57, 70, 0.08)',
                              border: '1px solid rgba(230, 57, 70, 0.18)',
                              color: 'var(--color-secondary)',
                              flexShrink: 0
                            }}
                            aria-hidden="true"
                          >
                            <CourseIcon iconName={course.icon || course.id} size={16} />
                          </div>
                          <span>{course.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>{course.price}</td>
                      <td style={{ padding: '1rem' }}>{course.duration}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Link 
                          to={`/classes/${course.id}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-outline" 
                          style={{ padding: '0.5rem' }} 
                          title="View Public Page"
                          aria-label="View Public Page"
                        >
                          <ExternalLink size={16} />
                        </Link>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
