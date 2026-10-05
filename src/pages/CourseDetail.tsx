import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Award, 
  Calendar, 
  ArrowRight, 
  MapPin, 
  Users 
} from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { FormattedDescription } from '../components/FormattedText';
import styles from './CourseDetail.module.css';

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCourse } = useCourses();

  const course = id ? getCourse(id) : undefined;

  if (!course) {
    return (
      <div className={styles.pageWrapper}>
        <div className="container">
          <div className={styles.notFoundCard}>
            <h2>Course Not Found</h2>
            <p>The course you are looking for does not exist or may have been removed.</p>
            <Link to="/classes" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <ArrowLeft size={16} />
              <span>Back to Classes & Pricing</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${course.name} | Ready to Respond`}</title>
        <meta name="description" content={course.shortDescription || `Detailed information, pricing, and certification details for ${course.name}.`} />
      </Helmet>

      <div className={styles.pageWrapper}>
        <div className="container">
          {/* Course Hero Banner with Top-Right Back Button */}
          <header className={styles.courseHeader}>
            <div className={styles.headerTopRow}>
              <div className={styles.headerTitleArea}>
                <span className={styles.eyebrow}>CERTIFICATION COURSE</span>
                <h1 className={styles.title}>{course.name}</h1>
              </div>
              <Link to="/classes" className={styles.backLink}>
                <ArrowLeft size={16} className={styles.backArrow} />
                <span>Back to Classes & Pricing</span>
              </Link>
            </div>
            <p className={styles.shortDescription}>{course.shortDescription}</p>
          </header>

          {/* 2-Column Layout */}
          <div className={styles.layoutGrid}>
            {/* Left: Detailed Information */}
            <main className={styles.mainContent}>
              {/* In-Depth Overview & Details (Hot Editable from Admin) */}
              <section className={styles.contentCard}>
                <h2 className={styles.sectionHeading}>Course Overview & Additional Information</h2>
                <div className={styles.richTextWrapper}>
                  <FormattedDescription 
                    content={course.fullDescription || course.shortDescription} 
                    className={styles.fullDesc}
                  />
                </div>
              </section>
            </main>

            {/* Right: Sticky Action & Summary Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarCard}>
                <div className={styles.sidebarPriceBlock}>
                  <span className={styles.priceLabel}>Course Fee</span>
                  <div className={styles.priceValue}>{course.price}</div>
                  <span className={styles.priceNote}>Per participant • Group rates available</span>
                </div>

                <div className={styles.detailsList}>
                  <div className={styles.detailRow}>
                    <div className={styles.detailIconWrapper} aria-hidden="true">
                      <Clock size={18} className={styles.detailIcon} />
                    </div>
                    <div className={styles.detailText}>
                      <span className={styles.detailKey}>Duration</span>
                      <span className={styles.detailVal}>{course.duration}</span>
                    </div>
                  </div>

                  <div className={styles.detailRow}>
                    <div className={styles.detailIconWrapper} aria-hidden="true">
                      <Award size={18} className={styles.detailIcon} />
                    </div>
                    <div className={styles.detailText}>
                      <span className={styles.detailKey}>Certification</span>
                      <span className={styles.detailVal}>{course.certification}</span>
                    </div>
                  </div>

                  <div className={styles.detailRow}>
                    <div className={styles.detailIconWrapper} aria-hidden="true">
                      <MapPin size={18} className={styles.detailIcon} />
                    </div>
                    <div className={styles.detailText}>
                      <span className={styles.detailKey}>Location</span>
                      <span className={styles.detailVal}>On-site or at our training site</span>
                    </div>
                  </div>

                  <div className={styles.detailRow}>
                    <div className={styles.detailIconWrapper} aria-hidden="true">
                      <Users size={18} className={styles.detailIcon} />
                    </div>
                    <div className={styles.detailText}>
                      <span className={styles.detailKey}>Class Size</span>
                      <span className={styles.detailVal}>3 student minimum per class</span>
                    </div>
                  </div>
                </div>

                <div className={styles.sidebarActions}>
                  <Link 
                    to="/contact" 
                    className={styles.inquireBtn}
                    aria-label={`Inquire about ${course.name}`}
                  >
                    <Calendar size={18} />
                    <span>Inquire / Register</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};
