import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, X } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import styles from './ContactForm.module.css';

export const ContactForm: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { courses } = useCourses();

  const courseQuery = searchParams.get('course') || '';
  const [selectedCourse, setSelectedCourse] = useState<string>(courseQuery);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state if URL query param changes
  useEffect(() => {
    if (courseQuery) {
      setSelectedCourse(courseQuery);
    }
  }, [courseQuery]);

  const handleClearCourse = () => {
    setSelectedCourse('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('course');
    setSearchParams(newParams, { replace: true });
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCourse(val);
    const newParams = new URLSearchParams(searchParams);
    if (val && val !== 'General Inquiry') {
      newParams.set('course', val);
    } else {
      newParams.delete('course');
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError('There was a problem sending your message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={styles.successMessage}>
        <h4>Thank you for your message!</h4>
        <p>We have received your inquiry and will contact you shortly.</p>
        <button 
          className="btn btn-outline" 
          style={{ marginTop: '1rem' }}
          onClick={() => setIsSubmitted(false)}
        >
          Send another message
        </button>
      </div>
    );
  }

  // Check if current course isn't in default list (e.g. custom created course or group training)
  const isCustomOrUnlisted = selectedCourse && 
    selectedCourse !== 'General Inquiry' && 
    selectedCourse !== 'Group Training' && 
    !courses.some(c => c.name.toLowerCase() === selectedCourse.toLowerCase());

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Hidden input to guarantee the course is submitted in form payload */}
      <input type="hidden" name="course" value={selectedCourse} />

      <div className="form-group">
        <label htmlFor="courseSelect" className="form-label">Interested Course / Program</label>
        {selectedCourse && selectedCourse !== 'General Inquiry' ? (
          <div className={styles.selectedCourseCard}>
            <div className={styles.badgeLeft}>
              <div className={styles.badgeIcon}>
                <BookOpen size={16} />
              </div>
              <div className={styles.badgeText}>
                <span className={styles.badgeCourse}>{selectedCourse}</span>
              </div>
            </div>
            <button 
              type="button" 
              onClick={handleClearCourse}
              className={styles.clearBadgeBtn}
              aria-label="Change or clear course selection"
              title="Change course"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <select 
            id="courseSelect" 
            className="form-control"
            value=""
            onChange={handleCourseChange}
          >
            <option value="">General Inquiry (No specific course)</option>
            {isCustomOrUnlisted && (
              <option value={selectedCourse}>{selectedCourse}</option>
            )}
            {courses.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
            <option value="Group Training">Group Training / Corporate Workshop</option>
            <option value="Other">Other</option>
          </select>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="name" className="form-label">Full Name</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          className="form-control" 
          placeholder="Jane Doe"
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">Email Address</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          className="form-control" 
          placeholder="jane@example.com"
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone" className="form-label">Phone Number</label>
        <input 
          type="tel" 
          id="phone" 
          name="phone" 
          className="form-control" 
          placeholder="(555) 555-5555"
        />
      </div>

      <div className="form-group">
        <label htmlFor="message" className="form-label">Message or Course Questions</label>
        <textarea 
          id="message" 
          name="message" 
          className="form-control" 
          rows={5} 
          placeholder="Let us know your preferred dates, location, or questions..."
          required
        ></textarea>
      </div>

      {error && (
        <div style={{ color: 'var(--color-secondary)', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <button 
        type="submit" 
        className={`btn btn-primary ${styles.submitBtn}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};
