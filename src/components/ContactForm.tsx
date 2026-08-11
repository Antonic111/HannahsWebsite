import React, { useState } from 'react';
import styles from './ContactForm.module.css';

export const ContactForm: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
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
        <label htmlFor="message" className="form-label">Message or Course Inquiry</label>
        <textarea 
          id="message" 
          name="message" 
          className="form-control" 
          rows={5} 
          placeholder="How can we help you?"
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
