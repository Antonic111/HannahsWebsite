import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Edit, Trash2, ExternalLink, GripVertical, ChevronUp, ChevronDown, Check, Plus, Clock, Tag } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { CourseIcon } from '../../components/CourseIcon';
import styles from './CourseManager.module.css';

export const CourseManager: React.FC = () => {
  const { courses, deleteCourse, reorderCourses } = useCourses();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const saveTimerRef = useRef<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showSaveNotice = (msg = 'Order updated') => {
    setSaveMessage(msg);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      setSaveMessage(null);
    }, 2500);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      setDeletingId(id);
      showSaveNotice(`Deleting "${name}"...`);
      const success = await deleteCourse(id);
      setDeletingId(null);
      if (success) {
        showSaveNotice(`Deleted "${name}"`);
      } else {
        showSaveNotice(`Failed to delete "${name}". Check connection.`);
      }
    }
  };

  const moveCourse = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= courses.length) return;
    const reordered = [...courses];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    showSaveNotice(`Saving order...`);
    await reorderCourses(reordered);
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
    <div className={styles.container}>
      <Helmet>
        <title>Manage Courses | Admin | Ready to Respond</title>
      </Helmet>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Manage Courses</h1>
          <p className={styles.subtitle}>
            Add, edit, or rearrange course offerings. Order set here reflects directly on the public Classes page.
          </p>
        </div>
        <Link to="/admin/courses/new" className={`btn btn-primary ${styles.addBtn}`}>
          <Plus size={16} />
          <span>Add Course</span>
        </Link>
      </div>

      {/* Helper & Status Notice */}
      <div className={styles.statusBar}>
        <span className={styles.helperText}>
          <GripVertical size={15} aria-hidden="true" />
          <span>Drag rows or use arrow buttons to rearrange display order.</span>
        </span>
        {saveMessage && (
          <span className={styles.saveBadge} role="status">
            <Check size={13} />
            <span>{saveMessage}</span>
          </span>
        )}
      </div>

      {courses.length === 0 ? (
        <div className={styles.emptyState}>
          <p style={{ margin: '0 0 1rem', fontSize: '1rem' }}>No courses found. Add your first course to get started!</p>
          <Link to="/admin/courses/new" className="btn btn-primary">
            + Add Course
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile Card List (shown on <= 768px) */}
          <div className={styles.mobileCardsContainer}>
            {courses.map((course, index) => (
              <div key={course.id} className={styles.mobileCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleWrapper}>
                    <div className={styles.cardIconBox} aria-hidden="true">
                      <CourseIcon iconName={course.icon || course.id} size={18} />
                    </div>
                    <div className={styles.cardCourseName}>{course.name}</div>
                  </div>

                  <div className={styles.cardOrderControls}>
                    <span className={styles.cardOrderNum}>#{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => moveCourse(index, index - 1)}
                      disabled={index === 0}
                      className={styles.orderBtn}
                      title="Move up"
                      aria-label={`Move ${course.name} up`}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCourse(index, index + 1)}
                      disabled={index === courses.length - 1}
                      className={styles.orderBtn}
                      title="Move down"
                      aria-label={`Move ${course.name} down`}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>

                <div className={styles.cardDetails}>
                  <div className={`${styles.detailBadge} ${styles.detailBadgePrimary}`}>
                    <Tag size={13} />
                    <span>{course.price || 'Free'}</span>
                  </div>
                  <div className={styles.detailBadge}>
                    <Clock size={13} />
                    <span>{course.duration || 'N/A'}</span>
                  </div>
                  {course.certification && (
                    <div className={styles.detailBadge} style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span>{course.certification}</span>
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <Link
                    to={`/classes/${course.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.actionBtn}
                    title="View public page"
                  >
                    <ExternalLink size={15} />
                    <span>View</span>
                  </Link>

                  <Link
                    to={`/admin/courses/edit/${course.id}`}
                    className={styles.actionBtn}
                    style={{ color: 'var(--color-primary-dark)' }}
                  >
                    <Edit size={15} />
                    <span>Edit</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(course.id, course.name)}
                    disabled={deletingId === course.id}
                    className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                    title="Delete course"
                    aria-label={`Delete ${course.name}`}
                  >
                    <Trash2 size={15} />
                    <span>{deletingId === course.id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (shown on > 768px) */}
          <div className={styles.tableContainer}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '64px', textAlign: 'center' }}>Order</th>
                    <th>Course Name</th>
                    <th>Price</th>
                    <th>Duration</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => {
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
                        <td style={{ padding: '0.5rem', textAlign: 'center', userSelect: 'none' }}>
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

                        <td style={{ fontWeight: 500 }}>
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
                        <td>{course.price}</td>
                        <td>{course.duration}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
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
                              disabled={deletingId === course.id}
                              style={{ 
                                padding: '0.5rem', 
                                backgroundColor: 'var(--color-secondary)', 
                                color: 'white', 
                                borderColor: 'var(--color-secondary)',
                                opacity: deletingId === course.id ? 0.4 : 1,
                                cursor: deletingId === course.id ? 'wait' : 'pointer'
                              }}
                              aria-label="Delete Course"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
