import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import type { Course } from '../../data/courses';

export const CourseEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCourse, addCourse, updateCourse } = useCourses();
  
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<Course>({
    id: '',
    name: '',
    shortDescription: '',
    fullDescription: '',
    audience: '',
    duration: '',
    certification: '',
    price: '',
  });

  useEffect(() => {
    if (isEditing && id) {
      const existingCourse = getCourse(id);
      if (existingCourse) {
        setFormData(existingCourse);
      } else {
        navigate('/admin/courses'); // Redirect if not found
      }
    }
  }, [id, isEditing, getCourse, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && id) {
      updateCourse(id, formData);
    } else {
      // Generate a simple ID from the name for new courses
      const newId = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      addCourse({ ...formData, id: newId });
    }
    
    navigate('/admin/courses');
  };

  return (
    <div>
      <Helmet>
        <title>{isEditing ? 'Edit Course' : 'New Course'} | Admin | Ready to Respond</title>
      </Helmet>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>{isEditing ? 'Edit Course' : 'Create New Course'}</h1>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '0.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label htmlFor="name" className="form-label">Course Name *</label>
            <input type="text" id="name" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="price" className="form-label">Price *</label>
              <input type="text" id="price" name="price" className="form-control" value={formData.price} onChange={handleChange} placeholder="e.g. $120.00" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="duration" className="form-label">Duration *</label>
              <input type="text" id="duration" name="duration" className="form-control" value={formData.duration} onChange={handleChange} placeholder="e.g. 4 Hours" required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="audience" className="form-label">Target Audience</label>
            <input type="text" id="audience" name="audience" className="form-control" value={formData.audience} onChange={handleChange} placeholder="e.g. Healthcare Professionals" />
          </div>

          <div className="form-group">
            <label htmlFor="certification" className="form-label">Certification Provided</label>
            <input type="text" id="certification" name="certification" className="form-control" value={formData.certification} onChange={handleChange} placeholder="e.g. Heart & Stroke BLS (1 Year)" />
          </div>

          <div className="form-group">
            <label htmlFor="shortDescription" className="form-label">Short Description *</label>
            <textarea id="shortDescription" name="shortDescription" className="form-control" rows={2} value={formData.shortDescription} onChange={handleChange} required></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="fullDescription" className="form-label">Full Description</label>
            <textarea id="fullDescription" name="fullDescription" className="form-control" rows={5} value={formData.fullDescription} onChange={handleChange}></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Save Changes' : 'Create Course'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/courses')}>
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
