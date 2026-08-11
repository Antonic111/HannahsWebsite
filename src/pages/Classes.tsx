import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CourseCard } from '../components/CourseCard';
import { useCourses } from '../context/CourseContext';
import styles from './Classes.module.css';

export const Classes: React.FC = () => {
  const { courses } = useCourses();
  return (
    <>
      <Helmet>
        <title>Classes & Pricing | Ready to Respond</title>
        <meta name="description" content="View our available BLS and CPR courses, pricing, and certification details." />
      </Helmet>

      <section className="section">
        <div className="container">
          <div className={styles.header}>
            <h1>Classes & Pricing</h1>
            <p>
              We offer a range of certification courses to meet your professional or personal needs. 
              Find the right course below and contact us to inquire about availability and scheduling.
            </p>
          </div>

          <div className={styles.grid}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Group Training Callout */}
      <section className="section section-light">
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <h2>Need Group Training?</h2>
          <p>
            We offer on-site training for clinics, dental offices, construction sites, and corporate groups. 
            Group rates and customized scheduling are available.
          </p>
          <a href="/contact" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Request a Group Quote
          </a>
        </div>
      </section>
    </>
  );
};
