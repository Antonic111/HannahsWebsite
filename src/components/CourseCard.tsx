import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Award, 
  Calendar, 
  ArrowRight 
} from 'lucide-react';
import type { Course } from '../data/courses';
import { FormattedDescription } from './FormattedText';
import { CourseIcon } from './CourseIcon';
import styles from './CourseCard.module.css';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  // Support future featured/badge data if present in business data, otherwise equally styled
  const isFeatured = Boolean(course.featured || course.badge);
  const badgeText = course.badge || (isFeatured ? 'Most Popular' : null);

  return (
    <div className={`${styles.card} ${isFeatured ? styles.featuredCard : ''}`}>
      {badgeText && <span className={styles.featuredBadge}>{badgeText}</span>}

      {/* A. COURSE HEADER */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.iconContainer} aria-hidden="true">
            <CourseIcon iconName={course.icon || course.id} size={20} className={styles.headerIcon} />
          </div>
          <div className={styles.titleWrapper}>
            <h3 className={styles.title}>{course.name}</h3>
          </div>
        </div>
        <div className={styles.descWrapper}>
          <FormattedDescription content={course.shortDescription} className={styles.shortDesc} />
        </div>
      </div>

      {/* B. ALIGNED BOTTOM SECTION (Duration, Certification, Divider, Price, Button) */}
      <div className={styles.bottomSection}>
        <div className={styles.details}>
          <div className={styles.detailRow}>
            <div className={styles.detailIconWrapper} aria-hidden="true">
              <Clock size={16} className={styles.detailIcon} />
            </div>
            <div className={styles.detailContent}>
              <span className={styles.detailLabel}>Duration</span>
              <span className={styles.detailValue}>{course.duration}</span>
            </div>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.detailIconWrapper} aria-hidden="true">
              <Award size={16} className={styles.detailIcon} />
            </div>
            <div className={styles.detailContent}>
              <span className={styles.detailLabel}>Certification</span>
              <span className={styles.detailValue}>{course.certification}</span>
            </div>
          </div>
        </div>

        <div className={styles.priceAction}>
          <div className={styles.priceRow}>
            <div className={styles.price}>{course.price}</div>
            <Link 
              to={`/classes/${course.id}`} 
              className={styles.moreInfoBtn}
              aria-label={`More information about ${course.name}`}
            >
              <span>More Information</span>
              <ArrowRight size={13} className={styles.moreInfoArrow} />
            </Link>
          </div>
          <Link 
            to={`/contact?course=${encodeURIComponent(course.name)}`} 
            className={styles.inquireBtn} 
            aria-label={`Inquire about ${course.name}`}
          >
            <span className={styles.btnMain}>
              <Calendar size={17} className={styles.btnCalendar} />
              <span>Inquire Now</span>
            </span>
            <ArrowRight size={17} className={styles.btnArrow} />
          </Link>
        </div>
      </div>
    </div>
  );
};
