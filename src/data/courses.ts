export interface Course {
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

export const courses: Course[] = [
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
  }
];
