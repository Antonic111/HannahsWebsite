import React, { createContext, useState, useEffect, useContext } from 'react';
import type { Course } from '../data/courses';
import { courses as initialCourses } from '../data/courses';

interface CourseContextType {
  courses: Course[];
  addCourse: (course: Course) => void;
  updateCourse: (id: string, updatedCourse: Course) => void;
  deleteCourse: (id: string) => void;
  getCourse: (id: string) => Course | undefined;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(() => {
    // Load from local storage if available, otherwise use initial static data
    const saved = localStorage.getItem('r2r_courses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse courses from local storage", e);
        return initialCourses;
      }
    }
    return initialCourses;
  });

  // Save to local storage whenever courses change
  useEffect(() => {
    localStorage.setItem('r2r_courses', JSON.stringify(courses));
  }, [courses]);

  const addCourse = (course: Course) => {
    setCourses(prev => [...prev, course]);
  };

  const updateCourse = (id: string, updatedCourse: Course) => {
    setCourses(prev => prev.map(c => c.id === id ? updatedCourse : c));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const getCourse = (id: string) => {
    return courses.find(c => c.id === id);
  };

  return (
    <CourseContext.Provider value={{ courses, addCourse, updateCourse, deleteCourse, getCourse }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};
