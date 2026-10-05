import React, { createContext, useState, useEffect, useContext } from 'react';
import type { Course } from '../data/courses';
import { courses as initialCourses } from '../data/courses';

interface CourseContextType {
  courses: Course[];
  addCourse: (course: Course) => Promise<boolean>;
  updateCourse: (id: string, updatedCourse: Course) => Promise<boolean>;
  deleteCourse: (id: string) => Promise<boolean>;
  getCourse: (id: string) => Course | undefined;
  reorderCourses: (newCourses: Course[]) => Promise<boolean>;
  syncStatus: 'synced' | 'syncing' | 'error' | 'idle';
  isSyncing: boolean;
  storageConnected: boolean | null;
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
  const [storageConnected, setStorageConnected] = useState<boolean | null>(null);

  // Sync to Vercel Serverless API & Storage
  const syncToVercel = async (coursesToSync: Course[]): Promise<boolean> => {
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
        const data = await res.json();
        setStorageConnected(Boolean(data && data.storageConnected));
        setSyncStatus('synced');
        localStorage.setItem('r2r_courses', JSON.stringify(coursesToSync));
        return true;
      } else {
        setSyncStatus('error');
        return false;
      }
    } catch {
      // Running offline or locally without Vercel CLI runner
      setSyncStatus('error');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch live courses from Vercel API on startup
  const refreshCourses = async () => {
    try {
      const res = await fetch(`/api/courses?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache',
        },
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          const isConnected = Boolean(data && data.storageConnected);
          setStorageConnected(isConnected);

          // CRITICAL: Only overwrite local courses if cloud storage (KV or Blob) is actively connected!
          // If cloud storage is not yet connected, NEVER wipe out courses saved in browser localStorage!
          if (isConnected && data && Array.isArray(data.courses)) {
            const formatted = data.courses.map((c: Course) => ({
              ...c,
              icon: c.icon || LEGACY_DEFAULT_ICONS[c.id] || 'BookOpen',
            }));
            setCourses(formatted);
            localStorage.setItem('r2r_courses', JSON.stringify(formatted));
            setSyncStatus('synced');
          } else {
            setSyncStatus('idle');
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

  const addCourse = async (course: Course): Promise<boolean> => {
    const updated = [...courses, course];
    setCourses(updated);
    localStorage.setItem('r2r_courses', JSON.stringify(updated));
    return await syncToVercel(updated);
  };

  const updateCourse = async (id: string, updatedCourse: Course): Promise<boolean> => {
    const updated = courses.map(c => c.id === id ? updatedCourse : c);
    setCourses(updated);
    localStorage.setItem('r2r_courses', JSON.stringify(updated));
    return await syncToVercel(updated);
  };

  const deleteCourse = async (id: string): Promise<boolean> => {
    const updated = courses.filter(c => c.id !== id);
    setCourses(updated);
    localStorage.setItem('r2r_courses', JSON.stringify(updated));
    return await syncToVercel(updated);
  };

  const getCourse = (id: string) => {
    return courses.find(c => c.id === id);
  };

  const reorderCourses = async (newCourses: Course[]): Promise<boolean> => {
    setCourses(newCourses);
    localStorage.setItem('r2r_courses', JSON.stringify(newCourses));
    return await syncToVercel(newCourses);
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
      storageConnected,
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
