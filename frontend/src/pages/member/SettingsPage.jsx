import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Link2, Briefcase, Building, Loader2, Save, CheckCircle, KeyRound, ShieldCheck, Eye, EyeOff, RefreshCw } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    phone: '',
    linkedin_url: '',
    company: '',
    job_title: '',
    avatar_url: '',
    email: '', // read-only
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/members/me');
        if (data.data) {
          const m = data.data;
          setFormData({
            first_name: m.first_name || '',
            last_name: m.last_name || '',
            phone: m.phone || '',
            linkedin_url: m.linkedin_url || '',
            company: m.company || '',
            job_title: m.job_title || '',
            avatar_url: m.avatar_url || '',
            email: m.email || '',
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('avatar', file);

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.post('/members/me/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, avatar_url: data.data?.avatar_url || prev.avatar_url }));
      setSuccess('Avatar uploaded successfully.');
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
      await api.put('/members/me', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        linkedin_url: formData.linkedin_url,
        company: formData.company,
        job_title: formData.job_title,
        avatar_url: formData.avatar_url,
      });
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
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black text-slate-800 mb-6">Profile Settings</h1>
        
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-xl text-sm text-teal-700 font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> {success}
            </div>
          )}

          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-200">
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>
            <div>
              <label className="btn-outline-teal px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-teal-50 transition-colors inline-block">
                Upload New Image
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={saving} />
              </label>
              <p className="text-xs text-slate-500 mt-2">JPG, PNG or WebP. Max 2MB.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="email"
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Company</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="job_title"
                    type="text"
                    value={formData.job_title}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Links & Media */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">LinkedIn URL</label>
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="linkedin_url"
                    type="url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Avatar Image URL (Fallback)</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="avatar_url"
                    type="url"
                    value={formData.avatar_url}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-teal px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg shadow-teal-500/20"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* ── Password Reset Card ── */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Change Password</h2>
              <p className="text-xs text-slate-500">We'll send a one-time code to your email to verify it's you.</p>
            </div>
          </div>

          {pwError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 font-medium">{pwError}</div>
          )}
          {pwSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-sm text-teal-700 font-medium flex items-center gap-2"><CheckCircle className="w-4 h-4" />{pwSuccess}</div>
          )}

          {/* Idle: show Send OTP button */}
          {pwStep === 'idle' && (
            <button
              id="send-reset-otp-btn"
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
              className="btn-teal px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow shadow-teal-500/20"
            >
              {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Send OTP to my Email
            </button>
          )}

          {/* Verify OTP then set new password */}
          {pwStep === 'verify' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">A 6-digit code was sent to <span className="font-semibold text-teal-600">{user?.email || formData.email}</span>. Enter it below.</p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enter OTP</label>
                <div className="flex gap-2">
                  <input
                    id="pw-otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pwOtp}
                    onChange={(e) => setPwOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="flex-1 text-center text-2xl font-black tracking-[0.4em] py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                    placeholder="――――――"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      setPwLoading(true);
                      try { await api.post('/auth/forgot-password', { email: user?.email || formData.email }); }
                      catch { /* silent */ } finally { setPwLoading(false); }
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-slate-500 hover:border-teal-400 hover:text-teal-600 transition-all"
                    title="Resend OTP"
                  >
                    <RefreshCw className={`w-4 h-4 ${pwLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <input
                    id="pw-new"
                    type={showPwNew ? 'text' : 'password'}
                    value={pwNew}
                    onChange={(e) => setPwNew(e.target.value)}
                    className="w-full pr-12 pl-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                    placeholder="Minimum 8 characters"
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowPwNew(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-500">
                    {showPwNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <input
                    id="pw-confirm"
                    type={showPwConfirm ? 'text' : 'password'}
                    value={pwConfirm}
                    onChange={(e) => setPwConfirm(e.target.value)}
                    className={`w-full pr-12 pl-4 py-3 rounded-xl border focus:ring-2 focus:ring-teal-500/20 outline-none transition-all ${
                      pwConfirm && pwConfirm !== pwNew ? 'border-rose-400 focus:border-rose-400' : 'border-slate-200 focus:border-teal-500'
                    }`}
                    placeholder="Re-enter new password"
                  />
                  <button type="button" onClick={() => setShowPwConfirm(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-500">
                    {showPwConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwConfirm && pwConfirm !== pwNew && (
                  <p className="text-xs text-rose-500">Passwords do not match</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  id="reset-pw-submit"
                  disabled={pwLoading || pwOtp.length !== 6 || !pwNew || pwNew !== pwConfirm}
                  onClick={async () => {
                    if (pwNew.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
                    setPwLoading(true); setPwError('');
                    try {
                      await api.post('/auth/reset-password', { email: user?.email || formData.email, otp: pwOtp, newPassword: pwNew });
                      setPwSuccess('Password updated! All other sessions have been logged out.');
                      setPwStep('idle'); setPwOtp(''); setPwNew(''); setPwConfirm('');
                    } catch (e) {
                      setPwError(e.response?.data?.message || 'Failed to reset password.');
                    } finally { setPwLoading(false); }
                  }}
                  className="btn-teal px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow shadow-teal-500/20 disabled:opacity-50"
                >
                  {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => { setPwStep('idle'); setPwOtp(''); setPwNew(''); setPwConfirm(''); setPwError(''); }}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
