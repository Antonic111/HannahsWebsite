import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Users, Mail, ArrowRight, MapPin } from 'lucide-react';
import { CourseCard } from '../components/CourseCard';
import { useCourses } from '../context/CourseContext';
import styles from './Classes.module.css';

export const Classes: React.FC = () => {
  const { courses } = useCourses();

  const gridRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const syncHeights = () => {
      if (!gridRef.current) return;
      const cards = Array.from(gridRef.current.children) as HTMLElement[];
      if (cards.length === 0) return;

      // 1. Reset min-height first to measure unconstrained content height
      cards.forEach((card) => {
        card.style.minHeight = '';
      });

      // 2. Synchronize heights on multi-column layouts (tablets & desktops >= 768px)
      if (window.innerWidth >= 768) {
        let maxHeight = 0;
        cards.forEach((card) => {
          const height = card.getBoundingClientRect().height;
          if (height > maxHeight) {
            maxHeight = height;
          }
        });

        if (maxHeight > 0) {
          const targetHeight = `${Math.ceil(maxHeight)}px`;
          cards.forEach((card) => {
            card.style.minHeight = targetHeight;
          });
        }
      }
    };

    // Synchronize immediately
    syncHeights();

    // Re-synchronize once custom fonts have finished loading
    if (document.fonts) {
      document.fonts.ready.then(() => {
        syncHeights();
      });
    }

    // Observe width changes without triggering loop on height updates
    let lastWidth = gridRef.current ? gridRef.current.clientWidth : 0;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = Math.round(entry.contentRect.width);
        if (newWidth !== lastWidth) {
          lastWidth = newWidth;
          syncHeights();
        }
      }
    });

    if (gridRef.current) {
      resizeObserver.observe(gridRef.current);
    }

    window.addEventListener('resize', syncHeights);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncHeights);
    };
  }, [courses]);

  return (
    <>
      <Helmet>
        <title>Classes & Pricing | Ready to Respond</title>
        <meta name="description" content="View our available BLS and CPR courses, pricing, and certification details." />
      </Helmet>

      <div className={styles.pageWrapper}>
        <div className={styles.classesContainer}>
          {/* Page Header */}
          <div className={styles.header}>
            <span className={styles.eyebrow}>CLASSES & PRICING</span>
            <h1 className={styles.title}>Classes & Pricing</h1>
            <p className={styles.description}>
              We offer a range of certification courses to meet your professional or personal needs. 
              Find the right course below and contact us to inquire about availability and scheduling.
            </p>
            <div className={styles.headerDivider} aria-hidden="true" />
          </div>

          {/* Courses Grid */}
          <div className={styles.grid} ref={gridRef}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* Training Requirements & Options Information Strip */}
          <div className={styles.infoStrip}>
            <div className={styles.infoItem}>
              <div className={styles.infoIconWrapper} aria-hidden="true">
                <MapPin size={22} className={styles.infoIcon} />
              </div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoTitle}>Flexible Training Location</h3>
                <p className={styles.infoText}>We can come to you or provide a training space.</p>
              </div>
            </div>

            <div className={styles.infoDivider} aria-hidden="true" />

            <div className={styles.infoItem}>
              <div className={styles.infoIconWrapper} aria-hidden="true">
                <Users size={22} className={styles.infoIcon} />
              </div>
              <div className={styles.infoContent}>
                <h3 className={styles.infoTitle}>3 Student Minimum</h3>
                <p className={styles.infoText}>A minimum of 3 students is required per class.</p>
              </div>
            </div>
          </div>

          {/* Group Training Contained CTA Banner */}
          <div className={styles.groupBannerWrapper}>
            <div className={styles.groupCtaCard}>
              {/* Left Content Area with Group Icon */}
              <div className={styles.groupCtaLeft}>
                <div className={styles.groupIconContainer} aria-hidden="true">
                  <Users size={24} className={styles.groupIcon} />
                </div>
                <div className={styles.groupCtaContent}>
                  <span className={styles.groupEyebrow}>ORGANIZATIONS & WORKPLACES</span>
                  <h2 className={styles.groupHeading}>Need Group Training?</h2>
                  <p className={styles.groupDescription}>
                    Flexible group training for clinics, dental offices, construction sites, and corporate groups, at your location or a training space we provide.
                  </p>
                </div>
              </div>

              {/* Right Action Button */}
              <div className={styles.groupCtaAction}>
                <Link to="/contact?course=Group%20Training" className={styles.groupCtaBtn}>
                  <Mail size={18} className={styles.groupBtnIcon} />
                  <span>Request a Group Quote</span>
                  <ArrowRight size={18} className={styles.groupBtnArrow} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
