import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Briefcase, Building, Loader2, Save,
  CheckCircle, KeyRound, ShieldCheck, Eye, EyeOff, RefreshCw,
  MapPin, GraduationCap, Plus, Trash2, Award
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import ImageCropModal from '../../components/ImageCropModal';
import { SEG_STATUS_OPTIONS } from '../public/membership.config';
import { gstToast } from '../../utils/toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [memberProfile, setMemberProfile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Password reset via OTP ─────────────────────────────
  const [pwStep, setPwStep] = useState('idle'); // 'idle' | 'otp_sent' | 'verify' | 'new_pw' | 'done'
  const [pwOtp, setPwOtp] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [showPwNew, setShowPwNew] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  // ─────────────────────────────────────────────────────

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    nickname: '',
    email: '', // read-only
    phone: '',
    home_street: '',
    home_city: '',
    home_state: '',
    home_zip: '',
    avatar_url: '',
    privacy_policy: 0,
    event_announcements: 1,
    newsletter_opt_in: 1,
    directory_visible: 1,

    company_name: '',
    company_street: '',
    company_city: '',
    company_state: '',
    company_zip: '',
    company_phone: '',
    board_position: '',
    job_title: '',

    seg_status: 'non-member',
    tgs_member: 0,
    education: [
      { university: '', degree: '', major: '' }
    ],
  });

  // ── Avatar crop states ────────────────────────────────
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(null);
  // ──────────────────────────────────────────────────────

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/members/me');
        if (data.data) {
          const m = data.data;
          setMemberProfile(m);
          let parsedEdu = [];
          if (Array.isArray(m.education)) {
            parsedEdu = m.education;
          } else if (typeof m.education === 'string') {
            try { parsedEdu = JSON.parse(m.education); } catch { parsedEdu = []; }
          }
          if (parsedEdu.length === 0 && (m.university || m.degree || m.major)) {
            parsedEdu = [{ university: m.university || '', degree: m.degree || '', major: m.major || '' }];
          }
          if (parsedEdu.length === 0) {
            parsedEdu = [{ university: '', degree: '', major: '' }];
          }

          setFormData({
            first_name: m.first_name || '',
            last_name: m.last_name || '',
            nickname: m.nickname || '',
            email: m.email || '',
            phone: m.phone || '',
            home_street: m.home_street || '',
            home_city: m.home_city || '',
            home_state: m.home_state || '',
            home_zip: m.home_zip || '',
            avatar_url: m.avatar_url || '',
            privacy_policy: m.privacy_policy || 0,
            event_announcements: m.event_announcements !== undefined && m.event_announcements !== null ? Number(m.event_announcements) : 1,
            newsletter_opt_in: m.newsletter_opt_in !== undefined && m.newsletter_opt_in !== null ? Number(m.newsletter_opt_in) : 1,
            directory_visible: m.directory_visible !== undefined && m.directory_visible !== null ? Number(m.directory_visible) : 1,

            company_name: m.company_name || m.company || '',
            company_street: m.company_street || '',
            company_city: m.company_city || '',
            company_state: m.company_state || '',
            company_zip: m.company_zip || '',
            company_phone: m.company_phone || '',
            board_position: m.board_position || '',
            job_title: m.job_title || '',

            seg_status: m.seg_status || 'non-member',
            tgs_member: m.tgs_member ? 1 : 0,
            education: parsedEdu,
          });
        }
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
    setError('');
    setSuccess('');
  };

  const handleEducationChange = (index, field, val) => {
    setFormData((prev) => {
      const eduList = [...prev.education];
      eduList[index] = { ...eduList[index], [field]: val };
      return { ...prev, education: eduList };
    });
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, { university: '', degree: '', major: '' }]
    }));
  };

  const removeEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedFormats.includes(file.type)) {
      setError('Unsupported format. Please upload JPG, PNG or WebP.');
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError('File size too large. Maximum size is 5MB.');
      return;
    }

    setError('');
    setSuccess('');

    const objectUrl = URL.createObjectURL(file);
    setTempImageSrc(objectUrl);
    setCropModalOpen(true);
    e.target.value = '';
  };

  const handleCancelCrop = () => {
    setCropModalOpen(false);
    if (tempImageSrc) {
      URL.revokeObjectURL(tempImageSrc);
      setTempImageSrc(null);
    }
  };

  const handleSaveCrop = async (croppedBlob) => {
    setCropModalOpen(false);
    if (tempImageSrc) {
      URL.revokeObjectURL(tempImageSrc);
      setTempImageSrc(null);
    }

    const fd = new FormData();
    const croppedFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
    fd.append('avatar', croppedFile);

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.post('/members/me/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData((prev) => ({ ...prev, avatar_url: data.data?.avatar_url || prev.avatar_url }));
      setSuccess('Avatar updated successfully.');
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload avatar.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        nickname: formData.nickname,
        phone: formData.phone,
        home_street: formData.home_street,
        home_city: formData.home_city,
        home_state: formData.home_state,
        home_zip: formData.home_zip,

        company_name: formData.company_name,
        company: formData.company_name,
        company_street: formData.company_street,
        company_city: formData.company_city,
        company_state: formData.company_state,
        company_zip: formData.company_zip,
        company_phone: formData.company_phone,
        board_position: formData.board_position,
        job_title: formData.job_title,

        seg_status: formData.seg_status,
        tgs_member: formData.tgs_member ? 1 : 0,
        education: formData.education.filter(e => e.university?.trim() || e.degree?.trim() || e.major?.trim()),
      };

      await api.put('/members/me', payload);
      setSuccess('Profile updated successfully.');
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Member Profile &amp; Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your contact information, workplace, society affiliations, and education.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs font-semibold text-teal-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* ── Card 0: Membership Standing & Expiration ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Membership Details</span>
                {(memberProfile?.member_id || memberProfile?.id) && (
                  <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    Member ID: #{memberProfile?.member_id || memberProfile?.id}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-slate-900 capitalize mt-0.5">
                {memberProfile?.tier || 'Professional'} Membership
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                memberProfile?.status === 'expired'
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : memberProfile?.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {memberProfile?.status === 'expired' ? 'Expired' : memberProfile?.status === 'active' ? 'Active' : (memberProfile?.status || 'Pending')}
              </span>
              <button
                type="button"
                disabled={renewing}
                onClick={async () => {
                  setRenewing(true);
                  try {
                    await api.post('/members/me/renew', { months: 12 });
                    gstToast.success('Membership renewed successfully (+1 Year)!');
                    const { data } = await api.get('/members/me');
                    if (data.data) setMemberProfile(data.data);
                    window.dispatchEvent(new Event('profileUpdated'));
                  } catch (err) {
                    gstToast.error(err.response?.data?.message || 'Renewal failed.');
                  } finally {
                    setRenewing(false);
                  }
                }}
                className="px-4 py-2 rounded-xl btn-teal text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${renewing ? 'animate-spin' : ''}`} />
                {renewing ? 'Renewing…' : 'Renew (+1 Year)'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Member Since</span>
              <span className="font-bold text-slate-800 text-sm">
                {memberProfile?.joined_at ? new Date(memberProfile.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Expiration Date</span>
              <span className={`font-black text-sm ${memberProfile?.status === 'expired' ? 'text-rose-600' : 'text-slate-900'}`}>
                {memberProfile?.expires_at ? new Date(memberProfile.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Expiry Set'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status / Standing</span>
              <span className={`font-black text-sm ${
                memberProfile?.status === 'expired'
                  ? 'text-rose-600'
                  : 'text-teal-600'
              }`}>
                {memberProfile?.status === 'expired' ? 'Expired — Renewal required' : 'In Good Standing'}
              </span>
            </div>
          </div>
        </div>
        
        {/* ── Card 1: Avatar & Personal Info ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-6 flex-wrap sm:flex-nowrap pb-6 border-b border-slate-100">
            <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-200 shrink-0 shadow-inner">
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>
            <div>
              <label className="btn-outline-teal px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-teal-50 transition-colors inline-block shadow-sm">
                Upload New Image
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={saving} />
              </label>
              <p className="text-xs text-slate-400 mt-1.5">JPG, PNG or WebP. Max 5MB with interactive cropper.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" /> Personal Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">First Name *</label>
                <input
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Last Name *</label>
                <input
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Nickname / Preferred</label>
                <input
                  name="nickname"
                  type="text"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="e.g. Alex"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email Address (Account ID)</label>
                <input
                  name="email"
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(918) 555-0100"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Home Address */}
            <div className="pt-3 border-t border-slate-100 space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" /> Home Address
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Home Street</label>
                <input
                  name="home_street"
                  type="text"
                  value={formData.home_street}
                  onChange={handleChange}
                  placeholder="1234 Main Street"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Home City</label>
                  <input
                    name="home_city"
                    type="text"
                    value={formData.home_city}
                    onChange={handleChange}
                    placeholder="Tulsa"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Home State</label>
                  <input
                    name="home_state"
                    type="text"
                    value={formData.home_state}
                    onChange={handleChange}
                    placeholder="OK"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Home ZIP Code</label>
                  <input
                    name="home_zip"
                    type="text"
                    value={formData.home_zip}
                    onChange={handleChange}
                    placeholder="74103"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Card 2: Company & Work Details ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Company &amp; Work Information</h2>
              <p className="text-xs text-slate-400">Your organization, role, and office location.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Company Name</label>
              <input
                name="company_name"
                type="text"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="e.g. Energy Partners LLC"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Job Title</label>
              <input
                name="job_title"
                type="text"
                value={formData.job_title}
                onChange={handleChange}
                placeholder="e.g. Exploration Geophysicist"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Board Position</label>
              <input
                name="board_position"
                type="text"
                value={formData.board_position}
                onChange={handleChange}
                placeholder="e.g. Secretary / Committee Chair"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Company Phone</label>
            <input
              name="company_phone"
              type="tel"
              value={formData.company_phone}
              onChange={handleChange}
              placeholder="(918) 555-0200"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          {/* Company Address */}
          <div className="pt-3 border-t border-slate-100 space-y-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600" /> Company Address
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Company Street</label>
              <input
                name="company_street"
                type="text"
                value={formData.company_street}
                onChange={handleChange}
                placeholder="100 E 2nd St, Suite 1200"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Company City</label>
                <input
                  name="company_city"
                  type="text"
                  value={formData.company_city}
                  onChange={handleChange}
                  placeholder="Tulsa"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Company State</label>
                <input
                  name="company_state"
                  type="text"
                  value={formData.company_state}
                  onChange={handleChange}
                  placeholder="OK"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Company ZIP Code</label>
                <input
                  name="company_zip"
                  type="text"
                  value={formData.company_zip}
                  onChange={handleChange}
                  placeholder="74103"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Card 3: Societies & Education ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Society Affiliations &amp; Education</h2>
              <p className="text-xs text-slate-400">Manage SEG status, TGS membership, and degrees.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                SEG Status (Society of Exploration Geophysicists)
              </label>
              <select
                name="seg_status"
                value={formData.seg_status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                {SEG_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Tulsa Geological Society (TGS)
              </label>
              <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-xl border border-slate-200 hover:border-teal-300 transition-colors">
                <input
                  name="tgs_member"
                  type="checkbox"
                  checked={formData.tgs_member === 1}
                  onChange={handleChange}
                  className="w-4 h-4 accent-teal-600 rounded"
                />
                <span className="text-xs font-bold text-slate-700">
                  Current active member of Tulsa Geological Society (TGS)
                </span>
              </label>
            </div>
          </div>

          {/* Education list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-teal-600" /> Education &amp; Degrees
              </h3>
              <button
                type="button"
                onClick={addEducation}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Degree
              </button>
            </div>

            {formData.education.map((edu, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-teal-700 uppercase tracking-wider">
                    Degree #{idx + 1}
                  </span>
                  {formData.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                      title="Remove this degree"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">University / College</label>
                    <input
                      type="text"
                      value={edu.university}
                      onChange={(e) => handleEducationChange(idx, 'university', e.target.value)}
                      placeholder="e.g. University of Oklahoma"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                      placeholder="e.g. B.S., M.S., Ph.D."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Major / Subject</label>
                    <input
                      type="text"
                      value={edu.major}
                      onChange={(e) => handleEducationChange(idx, 'major', e.target.value)}
                      placeholder="e.g. Geophysics"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Card 4: Permissions & Privacy Preferences ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Permissions &amp; Communication Preferences</h2>
              <p className="text-xs text-slate-400">Control your directory presence, email subscriptions, and announcements.</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
              <input
                type="checkbox"
                checked={Boolean(formData.directory_visible)}
                onChange={(e) => setFormData(prev => ({ ...prev, directory_visible: e.target.checked ? 1 : 0 }))}
                className="w-4 h-4 mt-0.5 accent-teal-600 rounded"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Member Directory Visibility
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Allow other active GST members to view your name, professional title, and company in the member directory.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
              <input
                type="checkbox"
                checked={Boolean(formData.event_announcements)}
                onChange={(e) => setFormData(prev => ({ ...prev, event_announcements: e.target.checked ? 1 : 0 }))}
                className="w-4 h-4 mt-0.5 accent-teal-600 rounded"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Event Announcements
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Receive email invitations and updates for monthly technical luncheons, symposiums, and short courses.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
              <input
                type="checkbox"
                checked={Boolean(formData.newsletter_opt_in)}
                onChange={(e) => setFormData(prev => ({ ...prev, newsletter_opt_in: e.target.checked ? 1 : 0 }))}
                className="w-4 h-4 mt-0.5 accent-teal-600 rounded"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Member Emails &amp; Newsletters
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Receive GST newsletters, president&rsquo;s message, and election/annual meeting notices.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-teal px-8 py-3 rounded-2xl font-bold text-white text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile Changes
          </button>
        </div>
      </form>

      {/* ── Card 4: Password Reset via OTP ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Change Password</h2>
            <p className="text-xs text-slate-400">Request an authentication code via email to update your account password.</p>
          </div>
        </div>

        {pwError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">{pwError}</div>
        )}
        {pwSuccess && (
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {pwSuccess}
          </div>
        )}

        {pwStep === 'idle' && (
          <button
            id="send-reset-otp-btn"
            type="button"
            onClick={async () => {
              setPwLoading(true); setPwError(''); setPwSuccess('');
              try {
                await api.post('/auth/forgot-password', { email: user?.email || formData.email });
                setPwStep('verify');
              } catch (e) {
                setPwError(e.response?.data?.message || 'Failed to send OTP.');
              } finally { setPwLoading(false); }
            }}
            disabled={pwLoading}
            className="btn-teal px-6 py-2.5 rounded-xl font-bold text-white text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Send OTP to my Email
          </button>
        )}

        {pwStep === 'verify' && (
          <div className="space-y-4 max-w-md">
            <p className="text-xs text-slate-600">
              A 6-digit verification code was dispatched to <strong>{user?.email || formData.email}</strong>.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Enter 6-Digit Code</label>
              <div className="flex gap-2">
                <input
                  id="pw-otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pwOtp}
                  onChange={(e) => setPwOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="flex-1 text-center text-xl font-black tracking-[0.3em] py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  placeholder="――――――"
                />
                <button
                  type="button"
                  onClick={async () => {
                    setPwLoading(true);
                    try { await api.post('/auth/forgot-password', { email: user?.email || formData.email }); }
                    catch { /* silent */ } finally { setPwLoading(false); }
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:border-teal-400 hover:text-teal-600"
                  title="Resend OTP"
                >
                  <RefreshCw className={`w-4 h-4 ${pwLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPwNew ? 'text' : 'password'}
                  value={pwNew}
                  onChange={(e) => setPwNew(e.target.value)}
                  className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  placeholder="Min. 8 characters"
                />
                <button type="button" onClick={() => setShowPwNew(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPwNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPwConfirm ? 'text' : 'password'}
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target.value)}
                  className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  placeholder="Re-enter new password"
                />
                <button type="button" onClick={() => setShowPwConfirm(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPwConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={pwLoading || pwOtp.length !== 6 || !pwNew || pwNew !== pwConfirm}
                onClick={async () => {
                  if (pwNew.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
                  setPwLoading(true); setPwError('');
                  try {
                    await api.post('/auth/reset-password', { email: user?.email || formData.email, otp: pwOtp, newPassword: pwNew });
                    setPwSuccess('Password updated successfully!');
                    setPwStep('idle'); setPwOtp(''); setPwNew(''); setPwConfirm('');
                  } catch (e) {
                    setPwError(e.response?.data?.message || 'Failed to reset password.');
                  } finally { setPwLoading(false); }
                }}
                className="btn-teal px-6 py-2.5 rounded-xl font-bold text-white text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                Update Password
              </button>
              <button
                type="button"
                onClick={() => { setPwStep('idle'); setPwOtp(''); setPwNew(''); setPwConfirm(''); setPwError(''); }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={tempImageSrc}
        onCancel={handleCancelCrop}
        onSave={handleSaveCrop}
      />
    </div>
  );
}
