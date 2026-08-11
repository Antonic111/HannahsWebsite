import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Award, Users } from 'lucide-react';
import type { Course } from '../data/courses';
import styles from './CourseCard.module.css';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{course.name}</h3>
        <p className={styles.shortDesc}>{course.shortDescription}</p>
      </div>

      <div className={styles.details}>
        <div className={styles.detailItem}>
          <Users size={18} className={styles.detailIcon} />
          <span><strong>For:</strong> {course.audience}</span>
        </div>
        <div className={styles.detailItem}>
          <Clock size={18} className={styles.detailIcon} />
          <span><strong>Duration:</strong> {course.duration}</span>
        </div>
        <div className={styles.detailItem}>
          <Award size={18} className={styles.detailIcon} />
          <span><strong>Certification:</strong> {course.certification}</span>
        </div>
      </div>

      <div className={styles.price}>{course.price}</div>

      <div className={styles.footer}>
        <Link to="/contact" className="btn btn-primary">
          Inquire Now
        </Link>
      </div>
    </div>
  );
};
