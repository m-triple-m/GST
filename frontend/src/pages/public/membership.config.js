/**
 * membership.config.js
 * All static configuration for the Membership application form.
 * Import from here instead of defining inline in MembershipPage.jsx.
 */


/** Available membership tiers */
export const TIERS = [
  {
    id: 'student',
    name: 'Student',
    price: '$15/yr',
    description: 'For full-time geoscience students',
    features: ['Monthly luncheon access', 'Scholarship eligibility', 'Student networking'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$75/yr',
    description: 'For working geophysical professionals',
    features: ['All luncheon discounts', 'Voting rights', 'Directory listing', 'SEG affiliate discounts'],
    popular: true,
  },
  {
    id: 'corporate',
    name: 'Corporate',
    price: 'Custom',
    description: 'For companies & organizations',
    features: ['Multiple employees', 'Event sponsorship', 'Logo placement', 'Priority recognition'],
  },
];

/** Default form field values */
export const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  linkedin: '',
  company: '',
  title: '',
  experience: '',
  industry: '',
  tier: 'professional',
  motivation: '',
  referral: false,
};

/** Validation regex patterns */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{3,4}[-\s.]?[0-9]{3,6}$/;
export const URL_RE = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}(\/[-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/;

/** Years-of-experience options for the select input */
export const EXPERIENCE_OPTIONS = [
  'Student (0)',
  '0-2 years',
  '2-5 years',
  '5-10 years',
  '10-20 years',
  '20+ years',
];

/** Primary industry options for the select input */
export const INDUSTRY_OPTIONS = [
  'Oil & Gas Exploration',
  'Mining & Minerals',
  'Carbon Capture & Storage',
  'Geothermal Energy',
  'Academia / Research',
  'Environmental',
  'Technology / Software',
  'Other',
];
