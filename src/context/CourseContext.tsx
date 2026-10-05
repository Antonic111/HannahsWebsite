import React, { createContext, useState, useEffect, useContext } from 'react';
import type { Course } from '../data/courses';
import { courses as initialCourses } from '../data/courses';

interface CourseContextType {
  courses: Course[];
  addCourse: (course: Course) => void;
  updateCourse: (id: string, updatedCourse: Course) => void;
  deleteCourse: (id: string) => void;
  getCourse: (id: string) => Course | undefined;
  reorderCourses: (newCourses: Course[]) => void;
  syncStatus: 'synced' | 'syncing' | 'error' | 'idle';
  isSyncing: boolean;
  refreshCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const LEGACY_DEFAULT_ICONS: Record<string, string> = {
  'bls-provider': 'HeartPulse',
  'bls-renewal': 'RefreshCw',
  'standard-first-aid-cpr-c': 'ShieldCheck',
  'emergency-first-aid': 'Activity',
};

const ADMIN_PASSWORD = 'HTCeleron1?';

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(() => {
    // Load from local storage if available, otherwise use initial static data
    const saved = localStorage.getItem('r2r_courses');
    if (saved) {
      try {
        const parsed: Course[] = JSON.parse(saved);
        // Ensure legacy courses without icon property receive their proper icon
        return parsed.map((course) => ({
          ...course,
          icon: course.icon || LEGACY_DEFAULT_ICONS[course.id] || 'BookOpen',
        }));
      } catch (e) {
        console.error("Failed to parse courses from local storage", e);
        return initialCourses;
      }
    }
    return initialCourses;
  });

  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'idle'>('idle');
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync to Vercel Serverless API & Storage
  const syncToVercel = async (coursesToSync: Course[]) => {
    setIsSyncing(true);
    setSyncStatus('syncing');
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': ADMIN_PASSWORD,
        },
        body: JSON.stringify({ courses: coursesToSync }),
      });

      if (res.ok) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    } catch {
      // Running offline or locally without Vercel CLI runner
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch live courses from Vercel API on startup
  const refreshCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && Array.isArray(data.courses) && data.courses.length > 0) {
            const formatted = data.courses.map((c: Course) => ({
              ...c,
              icon: c.icon || LEGACY_DEFAULT_ICONS[c.id] || 'BookOpen',
            }));
            setCourses(formatted);
            localStorage.setItem('r2r_courses', JSON.stringify(formatted));
            setSyncStatus('synced');
          }
        }
      }
    } catch {
      // Use local storage fallback
    }
  };

  useEffect(() => {
    refreshCourses();
  }, []);

  // Save to local storage whenever courses change
  useEffect(() => {
    localStorage.setItem('r2r_courses', JSON.stringify(courses));
  }, [courses]);

  const addCourse = (course: Course) => {
    const updated = [...courses, course];
    setCourses(updated);
    syncToVercel(updated);
  };

  const updateCourse = (id: string, updatedCourse: Course) => {
    const updated = courses.map(c => c.id === id ? updatedCourse : c);
    setCourses(updated);
    syncToVercel(updated);
  };

  const deleteCourse = (id: string) => {
    const updated = courses.filter(c => c.id !== id);
    setCourses(updated);
    syncToVercel(updated);
  };

  const getCourse = (id: string) => {
    return courses.find(c => c.id === id);
  };

  const reorderCourses = (newCourses: Course[]) => {
    setCourses(newCourses);
    syncToVercel(newCourses);
  };

  return (
    <CourseContext.Provider value={{ 
      courses, 
      addCourse, 
      updateCourse, 
      deleteCourse, 
      getCourse, 
      reorderCourses,
      syncStatus,
      isSyncing,
      refreshCourses
    }}>
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
