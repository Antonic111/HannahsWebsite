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

function getBlobToken(): string | undefined {
  return (
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.VERCEL_BLOB_READ_WRITE_TOKEN ||
    process.env.READ_WRITE_TOKEN
  );
}

// Helper: Vercel Blob (supports both Public and Private stores)
async function getBlobCourses(): Promise<Course[] | null> {
  const token = getBlobToken();
  if (!token) return null;

  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: 'courses.json', token });
    if (blobs && blobs.length > 0) {
      // Sort newest first by uploadedAt timestamp!
      const sortedBlobs = [...blobs].sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
      const latestBlob = sortedBlobs[0];
      const targetUrl = (latestBlob as any).downloadUrl || latestBlob.url;
      // Add cache buster and cache: 'no-store' so we always fetch the newest saved courses
      const fetchUrl = targetUrl.includes('?') 
        ? `${targetUrl}&_t=${Date.now()}` 
        : `${targetUrl}?_t=${Date.now()}`;
      const res = await fetch(fetchUrl, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
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
  const token = getBlobToken();
  if (!token) return false;

  try {
    const { put, list, del } = await import('@vercel/blob');
    let newBlobUrl: string | null = null;

    // Try public access first with allowOverwrite: true and zero cache
    try {
      const res = await put('courses.json', JSON.stringify(courses), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        token,
        cacheControlMaxAge: 0,
      });
      newBlobUrl = res.url;
    } catch (pubErr) {
      console.warn('Vercel Blob public write failed, trying private:', pubErr);
      const res = await put('courses.json', JSON.stringify(courses), {
        access: 'private' as any,
        addRandomSuffix: false,
        allowOverwrite: true,
        token,
        cacheControlMaxAge: 0,
      });
      newBlobUrl = res.url;
    }

    // Clean up any stale or duplicated older blobs matching courses.json
    try {
      const { blobs } = await list({ prefix: 'courses.json', token });
      if (blobs && blobs.length > 1 && newBlobUrl) {
        const staleUrls = blobs
          .filter(b => b.url !== newBlobUrl)
          .map(b => b.url);
        if (staleUrls.length > 0) {
          await del(staleUrls, { token });
        }
      }
    } catch (cleanupErr) {
      console.warn('Stale blob cleanup warning:', cleanupErr);
    }

    return true;
  } catch (err) {
    console.error('Vercel Blob write error:', err);
    return false;
  }
}

export default async function handler(req: any, res: any) {
  // CORS & caching headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hasKv = Boolean(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL);
  const hasBlob = Boolean(getBlobToken());
  const isCloudStorageAvailable = hasKv || hasBlob;

  // GET: Fetch live courses
  if (req.method === 'GET') {
    try {
      // 1. Try Vercel KV / Redis first
      const kvCourses = await getKvCourses();
      if (kvCourses) {
        return res.status(200).json({
          success: true,
          courses: kvCourses,
          source: 'vercel-kv',
          storageConnected: true,
        });
      }

      // 2. Try Vercel Blob next
      const blobCourses = await getBlobCourses();
      if (blobCourses) {
        return res.status(200).json({
          success: true,
          courses: blobCourses,
          source: 'vercel-blob',
          storageConnected: true,
        });
      }

      // 3. If Cloud Storage token is connected but no courses have been uploaded yet (new store)
      if (isCloudStorageAvailable) {
        return res.status(200).json({
          success: true,
          courses: DEFAULT_COURSES,
          source: hasBlob ? 'vercel-blob-ready' : 'vercel-kv-ready',
          storageConnected: true,
        });
      }

      // 4. Fallback: Storage not configured in Vercel yet
      return res.status(200).json({
        success: true,
        courses: DEFAULT_COURSES,
        source: 'default',
        storageConnected: false,
      });
    } catch (err: any) {
      console.warn('GET /api/courses fallback to default:', err);
      return res.status(200).json({
        success: true,
        courses: DEFAULT_COURSES,
        source: 'fallback',
        storageConnected: isCloudStorageAvailable,
      });
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

      if (isCloudStorageAvailable && !savedToKv && !savedToBlob) {
        console.error('Failed to write to connected cloud storage');
        return res.status(500).json({
          success: false,
          error: 'Failed to write to Vercel Blob. Please check permissions.',
        });
      }

      const storageType = savedToKv ? 'vercel-kv' : savedToBlob ? 'vercel-blob' : 'local-browser';

      return res.status(200).json({
        success: true,
        message: 'Courses saved successfully',
        count: coursesToSave.length,
        storage: storageType,
        storageConnected: isCloudStorageAvailable && (savedToKv || savedToBlob),
      });
    } catch (err: any) {
      console.error('Error saving courses:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
