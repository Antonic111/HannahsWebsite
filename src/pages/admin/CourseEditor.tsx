import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import type { Course } from '../../data/courses';
import { IconPicker } from '../../components/admin/IconPicker';
import { RichDescriptionEditor } from '../../components/RichDescriptionEditor';
import { ExternalLink } from 'lucide-react';
import styles from './CourseEditor.module.css';

const parsePrice = (raw: string): string => {
  if (!raw || raw.includes('[')) return '';
  const match = raw.match(/(\d+(?:\.\d{1,2})?)/);
  return match ? match[1] : '';
};

const parseDuration = (raw: string): { hours: string; minutes: string } => {
  if (!raw || raw.includes('[')) return { hours: '', minutes: '' };
  
  const hoursMatch = raw.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hour)/i);
  const minutesMatch = raw.match(/(\d+)\s*(?:m|min)/i);

  let h = '';
  let m = '';

  if (hoursMatch) {
    const parsedH = parseFloat(hoursMatch[1]);
    if (!isNaN(parsedH)) {
      const wholeH = Math.floor(parsedH);
      const fracH = parsedH - wholeH;
      h = wholeH > 0 ? wholeH.toString() : '';
      if (fracH > 0 && !minutesMatch) {
        m = Math.round(fracH * 60).toString();
      }
    }
  }

  if (minutesMatch) {
    m = minutesMatch[1];
  }

  if (!hoursMatch && !minutesMatch) {
    const plainNum = raw.match(/^(\d+)/);
    if (plainNum) h = plainNum[1];
  }

  return { hours: h, minutes: m };
};

const formatDuration = (hours: string | number, minutes: string | number): string => {
  const h = parseInt(hours?.toString() || '0', 10);
  const m = parseInt(minutes?.toString() || '0', 10);

  if (h > 0 && m > 0) {
    return `${h} ${h === 1 ? 'Hour' : 'Hours'} ${m} Mins`;
  } else if (h > 0) {
    return `${h} ${h === 1 ? 'Hour' : 'Hours'}`;
  } else if (m > 0) {
    return `${m} Mins`;
  }
  return '';
};

export const CourseEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCourse, addCourse, updateCourse } = useCourses();
  
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<Course>({
    id: '',
    name: '',
    shortDescription: '',
    fullDescription: '',
    audience: '',
    duration: '',
    certification: '',
    price: '',
    icon: 'BookOpen',
  });

  const [priceValue, setPriceValue] = useState<string>('');
  const [durationHours, setDurationHours] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<string>('');

  useEffect(() => {
    if (isEditing && id) {
      const existingCourse = getCourse(id);
      if (existingCourse) {
        setFormData({
          ...existingCourse,
          icon: existingCourse.icon || 'BookOpen',
        });
        setPriceValue(parsePrice(existingCourse.price));
        const parsed = parseDuration(existingCourse.duration);
        setDurationHours(parsed.hours);
        setDurationMinutes(parsed.minutes);
      } else {
        navigate('/admin/courses');
      }
    }
  }, [id, isEditing, getCourse, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty or positive numbers with up to 2 decimal places
    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
      setPriceValue(val);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedDuration = formatDuration(durationHours, durationMinutes);
    if (!formattedDuration) {
      alert('Please specify a duration (hours and/or minutes).');
      return;
    }

    const formattedPrice = priceValue ? `$${priceValue}` : '$0.00';

    const courseToSave: Course = {
      ...formData,
      price: formattedPrice,
      duration: formattedDuration,
    };
    
    setIsSaving(true);
    try {
      if (isEditing && id) {
        await updateCourse(id, courseToSave);
      } else {
        const newId = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await addCourse({ ...courseToSave, id: newId });
      }
      navigate('/admin/courses');
    } catch {
      alert('Could not save to database. Please try again.');
      setIsSaving(false);
    }
  };

  const durationPreview = formatDuration(durationHours, durationMinutes);

  return (
    <div className={styles.editorWrapper}>
      <Helmet>
        <title>{isEditing ? 'Edit Course' : 'New Course'} | Admin | Ready to Respond</title>
      </Helmet>

      <div className={styles.header}>
        <h1 className={styles.title}>{isEditing ? 'Edit Course' : 'Create New Course'}</h1>
        {isEditing && id && (
          <a 
            href={`/classes/${id}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`btn btn-outline ${styles.viewLiveBtn}`}
            title="Open public course page in a new tab"
          >
            <ExternalLink size={15} />
            <span>View Live Page</span>
          </a>
        )}
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          
          <div className={styles.gridTwoCol}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="name" className="form-label">Course Name *</label>
              <input type="text" id="name" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Course Icon *</label>
              <IconPicker
                value={formData.icon}
                onChange={(iconName) => setFormData(prev => ({ ...prev, icon: iconName }))}
              />
            </div>
          </div>

          <div className={styles.gridEqualCol}>
            {/* Price with Fixed Symbol & Number Restriction */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="price" className="form-label">Price (CAD) *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  id="price"
                  name="price"
                  className="form-control"
                  style={{ paddingLeft: '2rem', fontSize: '1rem' }}
                  value={priceValue}
                  onChange={handlePriceChange}
                  placeholder="0.00"
                  required
                />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'block' }}>
                Numbers only. Saves as: <strong>{priceValue ? `$${priceValue}` : '$0.00'}</strong>
              </span>
            </div>
            
            {/* Duration Time Setter for Hours and Minutes */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Duration *</label>
              <div className={styles.durationInputs}>
                <div className={styles.durationField}>
                  <input
                    type="number"
                    id="durationHours"
                    name="durationHours"
                    className="form-control"
                    style={{ paddingRight: '2.5rem' }}
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                  <span className={styles.durationSuffix}>
                    hrs
                  </span>
                </div>

                <div className={styles.durationField}>
                  <input
                    type="number"
                    id="durationMinutes"
                    name="durationMinutes"
                    className="form-control"
                    style={{ paddingRight: '2.75rem' }}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="59"
                    step="5"
                  />
                  <span className={styles.durationSuffix}>
                    mins
                  </span>
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'block' }}>
                Preview: <strong>{durationPreview || 'e.g. 4 Hours or 45 Mins'}</strong>
              </span>
            </div>
          </div>


          <div className="form-group">
            <label htmlFor="certification" className="form-label">Certification Provided</label>
            <input type="text" id="certification" name="certification" className="form-control" value={formData.certification} onChange={handleChange} placeholder="e.g. Heart & Stroke BLS (1 Year)" />
          </div>

          {/* Short Description */}
          <div className="form-group">
            <RichDescriptionEditor
              id="shortDescription"
              name="shortDescription"
              label="Short Description"
              value={formData.shortDescription}
              onChange={(val) => setFormData(prev => ({ ...prev, shortDescription: val }))}
              placeholder="Enter short summary or highlights (e.g. • In-person BLS training...)"
              rows={4}
              required
              helpText="Displayed on course catalog cards and class previews. Use the toolbar to apply colors, font sizes, bold, italic, and bullet lists."
            />
          </div>

          {/* Full Description */}
          <div className="form-group">
            <RichDescriptionEditor
              id="fullDescription"
              name="fullDescription"
              label="Full Description & Course Details"
              value={formData.fullDescription}
              onChange={(val) => setFormData(prev => ({ ...prev, fullDescription: val }))}
              placeholder="Detailed course overview, syllabus, module topics, prerequisites..."
              rows={8}
              helpText="Displayed on the public course page. Use Split View for instant live preview as you format!"
            />
          </div>

          <div className={styles.actionsRow}>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving to Database...' : isEditing ? 'Save Changes' : 'Create Course'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/courses')}>
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
