import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { HeartPulse, ShieldCheck, Clock, Users, BookOpen, Award } from 'lucide-react';
import styles from './Home.module.css';

export const Home: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Ready to Respond - Professional BLS & CPR Training in Ontario</title>
        <meta name="description" content="Learn the skills and confidence needed to respond when it matters most. Professional BLS and CPR training in Ontario, Canada." />
      </Helmet>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <h1 className={styles.heroTitle}>
            Professional BLS & CPR Training in Ontario
          </h1>
          <p className={styles.heroSubtitle}>
            Learn the skills and confidence needed to respond when it matters most. Expert instruction designed for healthcare professionals and the general public.
          </p>
          <div className={styles.heroActions}>
            <Link to="/classes" className="btn btn-primary">View Classes & Pricing</Link>
            <Link to="/contact" className="btn btn-outline">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* Partner Banner Section */}
      <section className={styles.partnerBanner}>
        <div className="container">
          <p>Proud Training Partner</p>
          <img 
            src="/heart_and_stroke.png" 
            alt="Heart and Stroke Foundation Logo" 
            className={styles.partnerLogo} 
          />
          <p className={styles.partnerSubtext}>
            Authorized training delivered by certified instructors
          </p>
        </div>
      </section>

      {/* Services Overview Section */}
      <section className="section section-light">
        <div className="container">
          <h2 style={{ textAlign: 'center' }}>Comprehensive Training Programs</h2>
          <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            We offer a variety of certification courses tailored to meet your specific workplace or personal requirements.
          </p>

          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <HeartPulse size={48} className={styles.serviceIcon} />
              <h3>BLS Training</h3>
              <p>Basic Life Support training specialized for healthcare professionals, covering high-quality CPR and team dynamics.</p>
            </div>
            <div className={styles.serviceCard}>
              <Users size={48} className={styles.serviceIcon} />
              <h3>First Aid & CPR</h3>
              <p>Standard and Emergency First Aid courses equipped with CPR/AED training for workplace compliance.</p>
            </div>
            <div className={styles.serviceCard}>
              <BookOpen size={48} className={styles.serviceIcon} />
              <h3>Group Training</h3>
              <p>Convenient on-site training solutions for businesses, clinics, and organizations across Ontario.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section">
        <div className="container">
          <h2 style={{ textAlign: 'center' }}>Why Choose Ready to Respond?</h2>
          
          <div className={styles.whyUsGrid}>
            <div className={styles.whyUsItem}>
              <Award size={32} className={styles.whyUsIcon} />
              <div>
                <h3>Experienced Instruction</h3>
                <p>Learn from certified instructors with real-world experience in emergency medical response and healthcare.</p>
              </div>
            </div>
            <div className={styles.whyUsItem}>
              <ShieldCheck size={32} className={styles.whyUsIcon} />
              <div>
                <h3>Certification Focused</h3>
                <p>Our courses meet rigorous provincial and national standards, ensuring your certification is recognized.</p>
              </div>
            </div>
            <div className={styles.whyUsItem}>
              <Clock size={32} className={styles.whyUsIcon} />
              <div>
                <h3>Convenient Options</h3>
                <p>We offer flexible scheduling, including weekend and evening classes, to accommodate your busy life.</p>
              </div>
            </div>
            <div className={styles.whyUsItem}>
              <HeartPulse size={32} className={styles.whyUsIcon} />
              <div>
                <h3>Practical Hands-On Learning</h3>
                <p>Gain confidence through scenario-based training using modern, well-maintained equipment.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section-dark" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2>Ready to Get Certified?</h2>
          <p className={styles.ctaText}>
            Explore our available BLS and CPR courses and find the perfect fit for your needs.
          </p>
          <Link to="/classes" className="btn btn-secondary">
            View Classes & Pricing
          </Link>
        </div>
      </section>
    </>
  );
};
