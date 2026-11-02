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
    price: '$150/yr',
    description: 'For companies & organizations',
    features: ['Multiple employees', 'Event sponsorship', 'Logo placement', 'Priority recognition'],
  },
];

/** SEG Membership Status options */
export const SEG_STATUS_OPTIONS = [
  { id: 'active', label: 'Active Member' },
  { id: 'associate', label: 'Associate Member' },
  { id: 'emeritus', label: 'Emeritus Member' },
  { id: 'student', label: 'Student Member' },
  { id: 'non-member', label: 'Non-Member' },
];

/** Default form field values */
export const INITIAL_FORM = {
  // Personal & Contact
  firstName: '',
  lastName: '',
  nickname: '',
  email: '',
  phone: '',
  homeStreet: '',
  homeCity: '',
  homeState: '',
  homeZip: '',
  // Permissions, Consent & Communication Preferences
  privacyPolicy: false,
  eventAnnouncements: true,
  newsletterOptIn: true,
  directoryVisible: true,

  // Company & Work Details
  isRetired: false,
  companyName: '',
  companyStreet: '',
  companyCity: '',
  companyState: '',
  companyZip: '',
  companyPhone: '',
  boardPosition: '',
  jobTitle: '',

  // Society Affiliations & Education
  segStatus: 'non-member',
  tgsMember: false,
  education: [
    { university: '', degree: '', major: '' },
  ],

  // Membership Tier & Meta
  tier: 'professional',
};

/** Validation regex patterns */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** US 10-digit phone: accepts (555) 555-5555, 555-555-5555, 5555555555, +1xxxxxxxxxx */
export const PHONE_RE = /^(\+1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/;

/** US ZIP code: 5-digit or ZIP+4 */
export const ZIP_RE = /^\d{5}(-\d{4})?$/;

/** Name: letters, spaces, hyphens, apostrophes; min 2 chars */
export const NAME_RE = /^[a-zA-Z][a-zA-Z\s'\-\.]{1,}$/;

/** City: letters, spaces, hyphens, periods; min 2 chars */
export const CITY_RE = /^[a-zA-Z][a-zA-Z\s'\-\.]{1,}$/;

/** US Street address: must begin with a number */
export const STREET_RE = /^\d+\s+\S+/;

export const URL_RE = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}(\/[-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/;

/** All 50 US states + DC */
export const US_STATES = [
  { abbr: 'AL', name: 'Alabama' },
  { abbr: 'AK', name: 'Alaska' },
  { abbr: 'AZ', name: 'Arizona' },
  { abbr: 'AR', name: 'Arkansas' },
  { abbr: 'CA', name: 'California' },
  { abbr: 'CO', name: 'Colorado' },
  { abbr: 'CT', name: 'Connecticut' },
  { abbr: 'DE', name: 'Delaware' },
  { abbr: 'DC', name: 'District of Columbia' },
  { abbr: 'FL', name: 'Florida' },
  { abbr: 'GA', name: 'Georgia' },
  { abbr: 'HI', name: 'Hawaii' },
  { abbr: 'ID', name: 'Idaho' },
  { abbr: 'IL', name: 'Illinois' },
  { abbr: 'IN', name: 'Indiana' },
  { abbr: 'IA', name: 'Iowa' },
  { abbr: 'KS', name: 'Kansas' },
  { abbr: 'KY', name: 'Kentucky' },
  { abbr: 'LA', name: 'Louisiana' },
  { abbr: 'ME', name: 'Maine' },
  { abbr: 'MD', name: 'Maryland' },
  { abbr: 'MA', name: 'Massachusetts' },
  { abbr: 'MI', name: 'Michigan' },
  { abbr: 'MN', name: 'Minnesota' },
  { abbr: 'MS', name: 'Mississippi' },
  { abbr: 'MO', name: 'Missouri' },
  { abbr: 'MT', name: 'Montana' },
  { abbr: 'NE', name: 'Nebraska' },
  { abbr: 'NV', name: 'Nevada' },
  { abbr: 'NH', name: 'New Hampshire' },
  { abbr: 'NJ', name: 'New Jersey' },
  { abbr: 'NM', name: 'New Mexico' },
  { abbr: 'NY', name: 'New York' },
  { abbr: 'NC', name: 'North Carolina' },
  { abbr: 'ND', name: 'North Dakota' },
  { abbr: 'OH', name: 'Ohio' },
  { abbr: 'OK', name: 'Oklahoma' },
  { abbr: 'OR', name: 'Oregon' },
  { abbr: 'PA', name: 'Pennsylvania' },
  { abbr: 'RI', name: 'Rhode Island' },
  { abbr: 'SC', name: 'South Carolina' },
  { abbr: 'SD', name: 'South Dakota' },
  { abbr: 'TN', name: 'Tennessee' },
  { abbr: 'TX', name: 'Texas' },
  { abbr: 'UT', name: 'Utah' },
  { abbr: 'VT', name: 'Vermont' },
  { abbr: 'VA', name: 'Virginia' },
  { abbr: 'WA', name: 'Washington' },
  { abbr: 'WV', name: 'West Virginia' },
  { abbr: 'WI', name: 'Wisconsin' },
  { abbr: 'WY', name: 'Wyoming' },
];

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
