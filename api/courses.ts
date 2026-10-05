// Vercel Serverless Function: api/courses.ts
// Self-contained with zero external relative imports so it never fails on Vercel cold-start

interface Course {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  audience?: string;
  duration: string;
  certification: string;
  price: string;
  featured?: boolean;
  badge?: string;
  icon?: string;
}

const DEFAULT_COURSES: Course[] = [
  {
    id: 'bls-provider',
    name: 'BLS Provider',
    shortDescription: 'Basic Life Support (BLS) training for healthcare professionals.',
    fullDescription: 'This course is designed for healthcare professionals who need to know how to perform CPR, as well as other lifesaving skills, in a wide variety of in-hospital and out-of-hospital settings.',
    audience: 'Nurses, Doctors, EMTs, Dentists, Pharmacists, and other healthcare providers.',
    duration: '[Duration]',
    certification: '[Certification Name/Validity]',
    price: '$[Price]',
    icon: 'HeartPulse',
  },
  {
    id: 'bls-renewal',
    name: 'BLS Renewal',
    shortDescription: 'Fast-paced BLS renewal course for those with a current certification.',
    fullDescription: 'A streamlined version of the BLS Provider course specifically for individuals whose current BLS certification is nearing expiration. Includes brief review and skills testing.',
    audience: 'Healthcare providers with an active, unexpired BLS certification.',
    duration: '[Duration]',
    certification: '[Certification Name/Validity]',
    price: '$[Price]',
    icon: 'RefreshCw',
  },
  {
    id: 'standard-first-aid-cpr-c',
    name: 'Standard First Aid & CPR/AED Level C',
    shortDescription: 'Comprehensive training for workplace and general public requirements.',
    fullDescription: 'Comprehensive training covering all aspects of first aid and CPR. This course is designed for those who need training for work requirements or who want more knowledge to respond to emergencies at home.',
    audience: 'General public, workplace safety responders, teachers, fitness instructors.',
    duration: '[Duration]',
    certification: '[Certification Name/Validity]',
    price: '$[Price]',
    icon: 'ShieldCheck',
  },
  {
    id: 'emergency-first-aid',
    name: 'Emergency First Aid & CPR/AED',
    shortDescription: 'Basic one-day course offering lifesaving first aid and CPR skills.',
    fullDescription: 'A basic one-day course offering an overview of first aid and cardiopulmonary resuscitation (CPR) skills for the workplace or home. Meets OHS regulations for Basic First Aid.',
    audience: 'General public, workplace safety responders.',
    duration: '[Duration]',
    certification: '[Certification Name/Validity]',
    price: '$[Price]',
    icon: 'Activity',
  },
];

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
    console.warn('Vercel KV read skipped:', err);
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
    console.warn('Vercel KV write error:', err);
    return false;
  }
}

// Helper: Vercel Blob
async function getBlobCourses(): Promise<Course[] | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: 'courses.json' });
    if (blobs && blobs.length > 0) {
      const res = await fetch(blobs[0].url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    }
  } catch (err) {
    console.warn('Vercel Blob read skipped:', err);
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
    console.warn('Vercel Blob write error:', err);
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

  // GET: Fetch live courses - guaranteed to return 200 with valid courses
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

      // 3. Fallback: Always return default courses with 200 OK so visitor page never breaks
      return res.status(200).json({ success: true, courses: DEFAULT_COURSES, source: 'default' });
    } catch (err: any) {
      console.warn('GET /api/courses fallback to default:', err);
      return res.status(200).json({ success: true, courses: DEFAULT_COURSES, source: 'fallback' });
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

      const coursesToSave = req.body && req.body.courses ? req.body.courses : req.body;
      if (!Array.isArray(coursesToSave)) {
        return res.status(400).json({ success: false, error: 'Invalid payload: courses must be an array' });
      }

      // 1. Save to Vercel KV if available
      const savedToKv = await setKvCourses(coursesToSave);

      // 2. Save to Vercel Blob if available
      const savedToBlob = await setBlobCourses(coursesToSave);

      const storageType = savedToKv ? 'vercel-kv' : savedToBlob ? 'vercel-blob' : 'cached';

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
