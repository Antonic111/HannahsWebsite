import React from 'react';
import { resolveCourseIcon } from '../utils/iconRegistry';

interface CourseIconProps {
  iconName?: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

/**
 * Reusable, safe course icon component that resolves stored icon names
 * or legacy course IDs into supported Lucide icons with fallback to BookOpen.
 */
export const CourseIcon: React.FC<CourseIconProps> = ({
  iconName,
  size = 20,
  className,
  strokeWidth = 2,
}) => {
  const IconComponent = resolveCourseIcon(iconName);
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
};
