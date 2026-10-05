import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import type { Course } from '../../data/courses';
import { FormattedDescription } from '../../components/FormattedText';
import { IconPicker } from '../../components/admin/IconPicker';
import { Bold, Italic, List, Plus, ExternalLink } from 'lucide-react';

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

  const [previewMode, setPreviewMode] = useState<{ shortDescription: boolean; fullDescription: boolean }>({
    shortDescription: false,
    fullDescription: false,
  });

  const shortDescRef = useRef<HTMLTextAreaElement>(null);
  const fullDescRef = useRef<HTMLTextAreaElement>(null);

  const handleFormat = (field: 'shortDescription' | 'fullDescription', type: 'bold' | 'italic' | 'bullet' | 'addBullet') => {
    const ref = field === 'shortDescription' ? shortDescRef : fullDescRef;
    const textarea = ref.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData[field] || '';
    const selected = text.substring(start, end);

    let replacement = '';
    let cursorOffset = 0;

    if (type === 'bold') {
      replacement = `**${selected || 'bold text'}**`;
      cursorOffset = selected ? replacement.length : 2;
    } else if (type === 'italic') {
      replacement = `*${selected || 'italic text'}*`;
      cursorOffset = selected ? replacement.length : 1;
    } else if (type === 'bullet') {
      if (selected) {
        replacement = selected
          .split('\n')
          .map(line => (line.trim().startsWith('•') ? line : `• ${line}`))
          .join('\n');
        cursorOffset = replacement.length;
      } else {
        const needsNewline = start > 0 && text[start - 1] !== '\n';
        replacement = `${needsNewline ? '\n' : ''}• `;
        cursorOffset = replacement.length;
      }
    } else if (type === 'addBullet') {
      const needsNewline = start > 0 && text[start - 1] !== '\n';
      replacement = `${needsNewline ? '\n' : ''}• `;
      cursorOffset = replacement.length;
    }

    const updatedText = text.substring(0, start) + replacement + text.substring(end);
    setFormData(prev => ({ ...prev, [field]: updatedText }));

    setTimeout(() => {
      textarea.focus();
      const newPos = start + cursorOffset;
      textarea.setSelectionRange(newPos, newPos);
    }, 10);
  };

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
    <div>
      <Helmet>
        <title>{isEditing ? 'Edit Course' : 'New Course'} | Admin | Ready to Respond</title>
      </Helmet>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', maxWidth: '800px' }}>
        <h1 style={{ margin: 0 }}>{isEditing ? 'Edit Course' : 'Create New Course'}</h1>
        {isEditing && id && (
          <a 
            href={`/classes/${id}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
            title="Open public course page in a new tab"
          >
            <ExternalLink size={15} />
            <span>View Live Page</span>
          </a>
        )}
      </div>

      <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '0.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'start' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
                  <span
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      color: 'var(--color-text-muted)',
                      fontSize: '0.85rem',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
                    hrs
                  </span>
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
                  <span
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      color: 'var(--color-text-muted)',
                      fontSize: '0.85rem',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label htmlFor="shortDescription" className="form-label" style={{ margin: 0 }}>
                Short Description *
              </label>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setPreviewMode(p => ({ ...p, shortDescription: false }))}
                  style={{
                    background: !previewMode.shortDescription ? 'var(--color-primary)' : '#f1f5f9',
                    color: !previewMode.shortDescription ? '#fff' : 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    padding: '0.2rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(p => ({ ...p, shortDescription: true }))}
                  style={{
                    background: previewMode.shortDescription ? 'var(--color-primary)' : '#f1f5f9',
                    color: previewMode.shortDescription ? '#fff' : 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    padding: '0.2rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Preview
                </button>
              </div>
            </div>

            {!previewMode.shortDescription ? (
              <div>
                <div style={{
                  display: 'flex',
                  gap: '0.35rem',
                  padding: '0.4rem 0.6rem',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid var(--color-border)',
                  borderBottom: 'none',
                  borderTopLeftRadius: 'var(--radius-md)',
                  borderTopRightRadius: 'var(--radius-md)',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button
                    type="button"
                    onClick={() => handleFormat('shortDescription', 'bold')}
                    title="Bold (**text**)"
                    style={{
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '3px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Bold size={13} />
                    <span>Bold</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormat('shortDescription', 'italic')}
                    title="Italic (*text*)"
                    style={{
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '3px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                      fontStyle: 'italic',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Italic size={13} />
                    <span>Italic</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormat('shortDescription', 'bullet')}
                    title="Convert selection or line to Bullet Points"
                    style={{
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '3px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <List size={13} />
                    <span>Bullet List</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormat('shortDescription', 'addBullet')}
                    title="Insert bullet point item"
                    style={{
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '3px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Plus size={13} />
                    <span>• Bullet</span>
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                    Tip: Use <strong>**bold**</strong> or lines starting with <strong>•</strong>
                  </span>
                </div>
                <textarea
                  ref={shortDescRef}
                  id="shortDescription"
                  name="shortDescription"
                  className="form-control"
                  rows={4}
                  value={formData.shortDescription}
                  onChange={handleChange}
                  style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, fontFamily: 'inherit' }}
                  placeholder="Enter short description or bullet points (e.g. • In-person training...)"
                  required
                ></textarea>
              </div>
            ) : (
              <div style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                minHeight: '110px'
              }}>
                {formData.shortDescription ? (
                  <FormattedDescription content={formData.shortDescription} />
                ) : (
                  <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>No description entered yet.</span>
                )}
              </div>
            )}
          </div>

          {/* Full Description */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label htmlFor="fullDescription" className="form-label" style={{ margin: 0 }}>
                Full Description
              </label>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setPreviewMode(p => ({ ...p, fullDescription: false }))}
                  style={{
                    background: !previewMode.fullDescription ? 'var(--color-primary)' : '#f1f5f9',
                    color: !previewMode.fullDescription ? '#fff' : 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    padding: '0.2rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(p => ({ ...p, fullDescription: true }))}
                  style={{
                    background: previewMode.fullDescription ? 'var(--color-primary)' : '#f1f5f9',
                    color: previewMode.fullDescription ? '#fff' : 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    padding: '0.2rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Preview
                </button>
              </div>
            </div>

            {!previewMode.fullDescription ? (
              <div>
                <div style={{
                  display: 'flex',
                  gap: '0.35rem',
                  padding: '0.4rem 0.6rem',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid var(--color-border)',
                  borderBottom: 'none',
                  borderTopLeftRadius: 'var(--radius-md)',
                  borderTopRightRadius: 'var(--radius-md)',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button
                    type="button"
                    onClick={() => handleFormat('fullDescription', 'bold')}
                    title="Bold (**text**)"
                    style={{
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '3px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Bold size={13} />
                    <span>Bold</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormat('fullDescription', 'italic')}
                    title="Italic (*text*)"
                    style={{
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '3px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                      fontStyle: 'italic',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Italic size={13} />
                    <span>Italic</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormat('fullDescription', 'bullet')}
                    title="Convert selection or line to Bullet Points"
                    style={{
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '3px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <List size={13} />
                    <span>Bullet List</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormat('fullDescription', 'addBullet')}
                    title="Insert bullet point item"
                    style={{
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '3px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Plus size={13} />
                    <span>• Bullet</span>
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                    Tip: Use <strong>**bold**</strong> or lines starting with <strong>•</strong>
                  </span>
                </div>
                <textarea
                  ref={fullDescRef}
                  id="fullDescription"
                  name="fullDescription"
                  className="form-control"
                  rows={6}
                  value={formData.fullDescription}
                  onChange={handleChange}
                  style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, fontFamily: 'inherit' }}
                  placeholder="Detailed course overview, syllabus, or module topics..."
                ></textarea>
              </div>
            ) : (
              <div style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                minHeight: '140px'
              }}>
                {formData.fullDescription ? (
                  <FormattedDescription content={formData.fullDescription} />
                ) : (
                  <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>No full description entered yet.</span>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
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
