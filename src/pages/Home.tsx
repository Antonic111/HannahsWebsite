import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  HeartPulse, 
  ShieldCheck, 
  Clock, 
  Users, 
  BookOpen, 
  Award, 
  RefreshCw,
  ArrowRight,
  Mail,
  Calendar
} from 'lucide-react';
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
        <div className="container">
          <div className={styles.heroGrid}>
            {/* Left Column: Content & Actions */}
            <div className={styles.heroContent}>
              <span className={styles.heroEyebrow}>
                LIFE-SAVING SKILLS FOR A SAFER TOMORROW
              </span>
              <h1 className={styles.heroTitle}>
                Professional BLS & CPR Training in Ontario
              </h1>
              <p className={styles.heroSubtitle}>
                Learn the skills and confidence needed to respond when it matters most. Expert instruction designed for healthcare professionals and the general public.
              </p>
              <div className={styles.heroActions}>
                <Link to="/classes" className="btn btn-secondary">
                  View Classes & Pricing
                  <ArrowRight size={18} />
                </Link>
                <Link to="/contact" className="btn btn-outline">
                  Contact Us
                  <Mail size={18} />
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Image with Floating Accreditation Card */}
            <div className={styles.heroVisual}>
              <div className={styles.imageWrapper}>
                <img 
                  src="/header.jpg" 
                  alt="Hands-on CPR and AED training session with instruction manikins and emergency response gear" 
                  className={styles.heroImage}
                />
                
                {/* Floating Heart & Stroke Accreditation Card */}
                <div className={styles.accreditationCard}>
                  <div className={styles.accreditationHeader}>
                    <span className={styles.accreditationLabel}>Proud Training Partner</span>
                  </div>
                  <div className={styles.accreditationLogos}>
                    <img 
                      src="/french_heart_and_stroke.png" 
                      alt="Heart and Stroke Foundation Accredited Trainer (English)" 
                      className={styles.accreditationLogo} 
                    />
                    <img 
                      src="/english_heart_and_stroke.png" 
                      alt="Coeur + AVC Formateur Agréé (French)" 
                      className={styles.accreditationLogo} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              <h3>CPR/AED Training</h3>
              <p>Comprehensive CPR and AED training courses equipped for workplace compliance and lifesaving emergency response.</p>
            </div>
            <div className={styles.serviceCard}>
              <RefreshCw size={48} className={styles.serviceIcon} />
              <h3>Renewal Certification</h3>
              <p>Fast-track recertification courses for individuals needing to renew their current BLS or CPR credentials before expiry.</p>
            </div>
            <div className={styles.serviceCard}>
              <BookOpen size={48} className={styles.serviceIcon} />
              <h3>Group Training</h3>
              <p>Flexible group training for businesses, clinics, and organizations at your location or a training site we provide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section">
        <div className="container">
          <div className={styles.whyUsHeader}>
            <span className={styles.whyUsEyebrow}>WHY READY TO RESPOND</span>
            <h2>Training Built Around Real-World Readiness</h2>
          </div>
          
          <div className={styles.whyUsGrid}>
            <div className={styles.whyUsCard}>
              <div className={styles.whyUsIconWrapper}>
                <Award size={28} className={styles.whyUsIcon} />
              </div>
              <div className={styles.whyUsContent}>
                <h3>Experienced, Certified Instruction</h3>
                <p>Learn from certified instructors with hands-on healthcare and emergency response experience. Training focuses on practical skills, clear instruction, and confidence in real-world situations.</p>
              </div>
            </div>

            <div className={styles.whyUsCard}>
              <div className={styles.whyUsIconWrapper}>
                <ShieldCheck size={28} className={styles.whyUsIcon} />
              </div>
              <div className={styles.whyUsContent}>
                <h3>Recognized Certification</h3>
                <p>Complete training designed to meet applicable certification standards, with courses for healthcare professionals, workplaces, and individuals.</p>
              </div>
            </div>

            <div className={styles.whyUsCard}>
              <div className={styles.whyUsIconWrapper}>
                <Clock size={28} className={styles.whyUsIcon} />
              </div>
              <div className={styles.whyUsContent}>
                <h3>Flexible Training Options</h3>
                <p>Choose from available weekday, evening, and weekend classes, with group training options for workplaces, clinics, and organizations.</p>
              </div>
            </div>

            <div className={styles.whyUsCard}>
              <div className={styles.whyUsIconWrapper}>
                <HeartPulse size={28} className={styles.whyUsIcon} />
              </div>
              <div className={styles.whyUsContent}>
                <h3>Hands-On, Practical Training</h3>
                <p>Practice CPR, AED use, and emergency-response scenarios using professional training equipment so you're prepared to respond when it matters.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div className={styles.ctaCard}>
            {/* Subtle Medical Background Watermark (Right side, aria-hidden, pointer-events none) */}
            <div className={styles.ctaDecorations} aria-hidden="true">
              <svg 
                className={styles.decorSvg} 
                viewBox="0 0 500 240" 
                fill="none" 
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="ecgStrokeFade" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity="0" />
                    <stop offset="18%" stopColor="var(--color-secondary)" stopOpacity="1" />
                    <stop offset="78%" stopColor="var(--color-secondary)" stopOpacity="1" />
                    <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Large Abstract Heart Outline (Partially cropped by right edge) */}
                <path 
                  className={styles.decorHeartPath}
                  d="M 410, 60 C 380, 12, 305, 22, 305, 102 C 305, 155, 372, 198, 410, 228 C 448, 198, 515, 155, 515, 102 C 515, 22, 440, 12, 410, 60 Z" 
                  stroke="var(--color-secondary)" 
                  strokeWidth="2.25" 
                />

                {/* Continuous Subtle ECG Heartbeat Pulse Line */}
                <path 
                  className={styles.decorEcgPath}
                  d="M 10 130 L 130 130 Q 145 122 160 130 L 180 130 L 190 137 L 202 68 L 216 162 L 228 130 L 250 130 Q 268 116 286 130 L 490 130" 
                  stroke="url(#ecgStrokeFade)" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </div>

            {/* Main Content Area */}
            <div className={styles.ctaMain}>
              <span className={styles.ctaEyebrow}>READY TO TAKE THE NEXT STEP?</span>
              <h2 className={styles.ctaHeading}>Ready to Get Certified?</h2>
              <p className={styles.ctaDescription}>
                Explore our available BLS and CPR courses and find the perfect fit for your needs.
              </p>
            </div>

            {/* Right Action */}
            <div className={styles.ctaActionWrapper}>
              <Link to="/classes" className={`btn ${styles.ctaButton}`}>
                <Calendar size={18} className={styles.ctaBtnIcon} />
                <span>View Classes & Pricing</span>
                <ArrowRight size={18} className={styles.ctaBtnArrow} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
