import type { Course } from '../src/data/courses';
import { courses as defaultCourses } from '../src/data/courses';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'HTCeleron1?';

// Helper: Vercel KV / Upstash Redis
async function getKvCourses(): Promise<Course[] | null> {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!kvUrl || !kvToken) return null;

  try {
    const res = await fetch(`${kvUrl}/get/r2r_courses`, {
      headers: { Authorization: `Bearer ${kvToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.result) {
      const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Vercel KV read error:', err);
  }
  return null;
}

async function setKvCourses(courses: Course[]): Promise<boolean> {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!kvUrl || !kvToken) return false;

  try {
    const res = await fetch(`${kvUrl}/set/r2r_courses`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}` },
      body: JSON.stringify(courses),
    });
    return res.ok;
  } catch (err) {
    console.error('Vercel KV write error:', err);
    return false;
  }
}

// Helper: Vercel Blob
async function getBlobCourses(): Promise<Course[] | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: 'courses.json' });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    }
  } catch (err) {
    console.error('Vercel Blob read error:', err);
  }
  return null;
}

async function setBlobCourses(courses: Course[]): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;

  try {
    const { put } = await import('@vercel/blob');
    await put('courses.json', JSON.stringify(courses), {
      access: 'public',
      addRandomSuffix: false,
    });
    return true;
  } catch (err) {
    console.error('Vercel Blob write error:', err);
    return false;
  }
}

export default async function handler(req: any, res: any) {
  // CORS & headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Fetch live courses
  if (req.method === 'GET') {
    try {
      // 1. Try Vercel KV / Redis first
      const kvCourses = await getKvCourses();
      if (kvCourses) {
        return res.status(200).json({ success: true, courses: kvCourses, source: 'vercel-kv' });
      }

      // 2. Try Vercel Blob next
      const blobCourses = await getBlobCourses();
      if (blobCourses) {
        return res.status(200).json({ success: true, courses: blobCourses, source: 'vercel-blob' });
      }

      // 3. Fallback to default courses in code
      return res.status(200).json({ success: true, courses: defaultCourses, source: 'default' });
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      return res.status(500).json({ success: false, error: err.message, courses: defaultCourses });
    }
  }

  // POST: Save courses (admin only)
  if (req.method === 'POST') {
    try {
      // Authentication check
      const authHeader = req.headers['x-admin-password'];
      const bodyPassword = req.body && req.body.adminPassword;
      const providedPassword = authHeader || bodyPassword;

      if (providedPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid admin password' });
      }

      const coursesToSave = req.body.courses || req.body;
      if (!Array.isArray(coursesToSave)) {
        return res.status(400).json({ success: false, error: 'Invalid payload: courses must be an array' });
      }

      // 1. Save to Vercel KV if available
      const savedToKv = await setKvCourses(coursesToSave);

      // 2. Save to Vercel Blob if available
      const savedToBlob = await setBlobCourses(coursesToSave);

      const storageType = savedToKv ? 'vercel-kv' : savedToBlob ? 'vercel-blob' : 'local-ready';

      return res.status(200).json({
        success: true,
        message: 'Courses saved successfully',
        count: coursesToSave.length,
        storage: storageType,
      });
    } catch (err: any) {
      console.error('Error saving courses:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
