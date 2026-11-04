import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users, Search, Download, FileText,
  CheckCircle2, XCircle, AlertCircle, Star, StarOff,
  ChevronLeft, ChevronRight, RefreshCw, Loader2, Trash2,
  ShieldAlert, ShieldCheck, X, KeyRound, Copy, Eye, Pencil,
  MapPin, Building, GraduationCap, Phone, Mail, Award, Check
} from 'lucide-react';
import api from '../../api';
import { gstToast } from '../../utils/toast';
import { US_STATES } from '../public/membership.config';
import MembershipCertificateModal from '../../components/modals/MembershipCertificateModal';

// ─────────────────────────────────────────────────────────
//  Confirm Modal
// ─────────────────────────────────────────────────────────
function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger' }) {
  if (!open) return null;

  const btnCls = {
    danger:  'bg-rose-600 hover:bg-rose-500 text-white',
    success: 'bg-teal-600 hover:bg-teal-500 text-white',
    warning: 'bg-amber-500 hover:bg-amber-400 text-white',
  }[variant] ?? 'bg-slate-800 hover:bg-slate-700 text-white';

  const iconCls = {
    danger:  'bg-rose-100 text-rose-600',
    success: 'bg-teal-100 text-teal-600',
    warning: 'bg-amber-100 text-amber-600',
  }[variant] ?? 'bg-slate-100 text-slate-600';

  const Icon = {
    danger:  ShieldAlert,
    success: ShieldCheck,
    warning: AlertCircle,
  }[variant] ?? ShieldAlert;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${iconCls}`}>
          <Icon className="w-6 h-6" />
        </div>

        <h3 className="text-base font-black text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${btnCls}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  Full Member Details Modal
// ─────────────────────────────────────────────────────────
function MemberDetailsModal({ member, onClose, onRenew, onActivate, onDeactivate, onEdit, onViewCert }) {
  if (!member) return null;

  let educationList = [];
  if (Array.isArray(member.education)) {
    educationList = member.education;
  } else if (typeof member.education === 'string') {
    try { educationList = JSON.parse(member.education); } catch { educationList = []; }
  }
  if (educationList.length === 0 && (member.university || member.degree || member.major)) {
    educationList = [{ university: member.university, degree: member.degree, major: member.major }];
  }

  const initials = `${member.first_name?.[0] ?? ''}${member.last_name?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center font-black text-xl text-teal-300 shrink-0 overflow-hidden">
              {member.avatar_url ? (
                <img src={member.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white">
                  {member.first_name} {member.last_name}
                </h2>
                {member.nickname && (
                  <span className="text-xs font-bold text-teal-300">"{member.nickname}"</span>
                )}
                {member.is_executive === 1 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
                    Executive
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <p className="text-xs text-slate-400">{member.email}</p>
                <span className="font-mono text-[10px] font-bold text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60">
                  Member ID: #{member.member_id || member.id}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-all relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6 overflow-y-auto flex-1 text-xs">
          
          {/* Quick Badges */}
          <div className="flex items-center gap-2 flex-wrap pb-4 border-b border-slate-100">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              Tier: {member.tier || 'Professional'}
            </span>
            <span className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] ${
              member.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              Status: {member.status}
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold uppercase tracking-wider text-[10px] border border-blue-200">
              SEG: {member.seg_status || 'non-member'}
            </span>
            {member.tgs_member ? (
              <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 font-bold uppercase tracking-wider text-[10px] border border-teal-200 flex items-center gap-1">
                <Check className="w-3 h-3 text-teal-600" /> TGS Member
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Not TGS Member
              </span>
            )}
          </div>

          {/* Personal & Home Address */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600" /> Personal &amp; Home Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div><span className="font-bold text-slate-500">Phone:</span> <span className="text-slate-800 font-semibold">{member.phone || '—'}</span></div>
              <div><span className="font-bold text-slate-500">Joined:</span> <span className="text-slate-800 font-semibold">{member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '—'}</span></div>
              <div className="sm:col-span-2">
                <span className="font-bold text-slate-500">Membership Expiration:</span>{' '}
                <span className={`font-black ${member.status === 'expired' ? 'text-rose-600' : 'text-teal-700'}`}>
                  {member.expires_at ? new Date(member.expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No Expiry Set'}
                  {member.status === 'expired' && ' (Expired)'}
                </span>
              </div>
              <div className="sm:col-span-2"><span className="font-bold text-slate-500">Home Street:</span> <span className="text-slate-800 font-semibold">{member.home_street || '—'}</span></div>
              <div><span className="font-bold text-slate-500">City:</span> <span className="text-slate-800 font-semibold">{member.home_city || '—'}</span></div>
              <div><span className="font-bold text-slate-500">State / ZIP:</span> <span className="text-slate-800 font-semibold">{[member.home_state, member.home_zip].filter(Boolean).join(' ') || '—'}</span></div>
            </div>
          </div>

          {/* Company & Office Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-teal-600" /> Company &amp; Professional Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div><span className="font-bold text-slate-500">Company:</span> <span className="text-slate-800 font-semibold">{member.company_name || member.company || '—'}</span></div>
              <div><span className="font-bold text-slate-500">Job Title:</span> <span className="text-slate-800 font-semibold">{member.job_title || '—'}</span></div>
              <div><span className="font-bold text-slate-500">Board Position:</span> <span className="text-slate-800 font-semibold">{member.board_position || '—'}</span></div>
              <div><span className="font-bold text-slate-500">Company Phone:</span> <span className="text-slate-800 font-semibold">{member.company_phone || '—'}</span></div>
              <div className="sm:col-span-2"><span className="font-bold text-slate-500">Company Street:</span> <span className="text-slate-800 font-semibold">{member.company_street || '—'}</span></div>
              <div><span className="font-bold text-slate-500">Company City:</span> <span className="text-slate-800 font-semibold">{member.company_city || '—'}</span></div>
              <div><span className="font-bold text-slate-500">Company State / ZIP:</span> <span className="text-slate-800 font-semibold">{[member.company_state, member.company_zip].filter(Boolean).join(' ') || '—'}</span></div>
            </div>
          </div>

          {/* Education Records */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-teal-600" /> Education &amp; Academic Degrees ({educationList.length})
            </h3>
            <div className="space-y-2">
              {educationList.length === 0 ? (
                <p className="text-slate-400 p-3 bg-slate-50 rounded-xl">No degrees recorded.</p>
              ) : (
                educationList.map((edu, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-black text-slate-900">{edu.degree || 'Degree'}</span>
                      {edu.major && <span className="text-slate-600"> in {edu.major}</span>}
                    </div>
                    <div className="text-slate-500 font-semibold">{edu.university || 'University / College'}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Permissions & Communication Preferences */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Permissions &amp; Privacy Preferences
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div><span className="font-bold text-slate-500">Privacy Policy:</span> <span className="text-emerald-700 font-bold">{member.privacy_policy ? 'Accepted' : 'Not Accepted'}</span></div>
              <div><span className="font-bold text-slate-500">Member Directory:</span> <span className="text-slate-800 font-semibold">{member.directory_visible !== 0 ? 'Visible to Members' : 'Hidden'}</span></div>
              <div><span className="font-bold text-slate-500">Event Announcements:</span> <span className="text-slate-800 font-semibold">{member.event_announcements !== 0 ? 'Subscribed' : 'Opted out'}</span></div>
              <div><span className="font-bold text-slate-500">Newsletters &amp; Updates:</span> <span className="text-slate-800 font-semibold">{member.newsletter_opt_in !== 0 ? 'Subscribed' : 'Opted out'}</span></div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {member.status === 'inactive' && onActivate && (
              <button
                onClick={() => {
                  onActivate(member);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Reactivate Member
              </button>
            )}
            {member.status === 'active' && onDeactivate && (
              <button
                onClick={() => {
                  onDeactivate(member);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <XCircle className="w-3.5 h-3.5" />
                Deactivate
              </button>
            )}
            {(member.status === 'active' || member.status === 'expired') && onRenew && (
              <button
                onClick={() => {
                  onRenew(member);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Renew (+1 Year)
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(member);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Pencil className="w-3.5 h-3.5 text-teal-400" />
                Edit Profile
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors ml-auto"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  Edit Member Profile Modal
// ─────────────────────────────────────────────────────────
function EditMemberModal({ member, onClose, onSave }) {
  if (!member) return null;

  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    memberId: member.member_id || '',
    firstName: member.first_name || '',
    lastName: member.last_name || '',
    nickname: member.nickname || '',
    email: member.email || '',
    phone: member.phone || '',
    tier: member.tier || 'professional',
    status: member.status || 'active',
    expiresAt: member.expires_at ? member.expires_at.split('T')[0] : '',
    segStatus: member.seg_status || 'non-member',
    tgsMember: Boolean(member.tgs_member),
    isExecutive: Boolean(member.is_executive),
    eventAnnouncements: member.event_announcements !== undefined ? Boolean(member.event_announcements) : true,
    newsletterOptIn: member.newsletter_opt_in !== undefined ? Boolean(member.newsletter_opt_in) : true,
    directoryVisible: member.directory_visible !== undefined ? Boolean(member.directory_visible) : true,
    companyName: member.company_name || member.company || '',
    jobTitle: member.job_title || '',
    boardPosition: member.board_position || '',
    companyPhone: member.company_phone || '',
    companyStreet: member.company_street || '',
    companyCity: member.company_city || '',
    companyState: member.company_state || '',
    companyZip: member.company_zip || '',
    homeStreet: member.home_street || '',
    homeCity: member.home_city || '',
    homeState: member.home_state || '',
    homeZip: member.home_zip || '',
  });

  const update = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!form.email.trim()) newErrors.email = 'Email address is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        nickname: form.nickname.trim() || null,
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        tier: form.tier,
        status: form.status,
        expiresAt: form.expiresAt ? `${form.expiresAt} 23:59:59` : null,
        segStatus: form.segStatus,
        tgsMember: form.tgsMember,
        isExecutive: form.isExecutive,
        companyName: form.companyName.trim() || null,
        jobTitle: form.jobTitle.trim() || null,
        boardPosition: form.boardPosition.trim() || null,
        companyPhone: form.companyPhone.trim() || null,
        companyStreet: form.companyStreet.trim() || null,
        companyCity: form.companyCity.trim() || null,
        companyState: form.companyState.trim() || null,
        companyZip: form.companyZip.trim() || null,
        homeStreet: form.homeStreet.trim() || null,
        homeCity: form.homeCity.trim() || null,
        homeState: form.homeState.trim() || null,
        homeZip: form.homeZip.trim() || null,
      };

      const res = await api.put(`/members/${member.id}`, payload);
      gstToast.success('Member profile updated successfully');
      onSave?.(res.data.data);
      onClose();
    } catch (err) {
      console.error('Failed to update member profile:', err);
      gstToast.error(err.response?.data?.message || 'Failed to update member profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Edit Member Profile</h2>
              <p className="text-xs text-slate-400">Member ID #{member.member_id || member.id} · {member.first_name} {member.last_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-all relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 px-8 gap-2 pt-3 shrink-0 overflow-x-auto">
          {[
            { id: 'personal', label: 'Personal & Contact' },
            { id: 'membership', label: 'Membership & Status' },
            { id: 'company', label: 'Company & Work' },
            { id: 'home', label: 'Home Address' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 font-bold text-xs border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-700 bg-white rounded-t-xl shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-8 space-y-4 overflow-y-auto flex-1 text-xs">
            {activeTab === 'personal' && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">First Name *</label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => update('firstName', e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 ${
                        errors.firstName ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/20'
                      }`}
                    />
                    {errors.firstName && <p className="text-[11px] text-rose-600 mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => update('lastName', e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 ${
                        errors.lastName ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/20'
                      }`}
                    />
                    {errors.lastName && <p className="text-[11px] text-rose-600 mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Nickname / Preferred Name</label>
                    <input
                      type="text"
                      value={form.nickname}
                      onChange={(e) => update('nickname', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 ${
                        errors.email ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/20'
                      }`}
                    />
                    {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Member ID (Membership #)
                    </label>
                    <input
                      type="text"
                      value={form.memberId}
                      onChange={(e) => update('memberId', e.target.value)}
                      placeholder="e.g. 51307957"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Unique 8-digit membership ID or legacy Wild Apricot ID.</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Personal Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="(918) 555-0199"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'membership' && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Membership Tier</label>
                    <select
                      value={form.tier}
                      onChange={(e) => update('tier', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="student">Student</option>
                      <option value="professional">Professional</option>
                      <option value="corporate">Corporate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Account Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => update('status', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Expiration Date</label>
                    <input
                      type="date"
                      value={form.expiresAt}
                      onChange={(e) => update('expiresAt', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">SEG Status</label>
                    <select
                      value={form.segStatus}
                      onChange={(e) => update('segStatus', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="active">Active Member</option>
                      <option value="associate">Associate Member</option>
                      <option value="emeritus">Emeritus Member</option>
                      <option value="student">Student Member</option>
                      <option value="non-member">Non-Member</option>
                    </select>
                  </div>

                  <div className="space-y-3 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.tgsMember}
                        onChange={(e) => update('tgsMember', e.target.checked)}
                        className="w-4 h-4 accent-teal-600 rounded"
                      />
                      <span>Active Tulsa Geological Society (TGS) Member</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.isExecutive}
                        onChange={(e) => update('isExecutive', e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Executive Board Member
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Communication &amp; Directory Permissions
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-bold p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <input
                        type="checkbox"
                        checked={form.eventAnnouncements}
                        onChange={(e) => update('eventAnnouncements', e.target.checked)}
                        className="w-4 h-4 accent-teal-600 rounded"
                      />
                      <span className="text-[11px]">Event Announcements</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-bold p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <input
                        type="checkbox"
                        checked={form.newsletterOptIn}
                        onChange={(e) => update('newsletterOptIn', e.target.checked)}
                        className="w-4 h-4 accent-teal-600 rounded"
                      />
                      <span className="text-[11px]">Newsletters &amp; Emails</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-bold p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <input
                        type="checkbox"
                        checked={form.directoryVisible}
                        onChange={(e) => update('directoryVisible', e.target.checked)}
                        className="w-4 h-4 accent-teal-600 rounded"
                      />
                      <span className="text-[11px]">Directory Visibility</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Company Name</label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) => update('companyName', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Job Title</label>
                    <input
                      type="text"
                      value={form.jobTitle}
                      onChange={(e) => update('jobTitle', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Board Position</label>
                    <input
                      type="text"
                      value={form.boardPosition}
                      onChange={(e) => update('boardPosition', e.target.value)}
                      placeholder="e.g. Secretary"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Company Phone</label>
                  <input
                    type="tel"
                    value={form.companyPhone}
                    onChange={(e) => update('companyPhone', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Company Street Address</label>
                  <input
                    type="text"
                    value={form.companyStreet}
                    onChange={(e) => update('companyStreet', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Company City</label>
                    <input
                      type="text"
                      value={form.companyCity}
                      onChange={(e) => update('companyCity', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Company State</label>
                    <select
                      value={form.companyState}
                      onChange={(e) => update('companyState', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="">— Select State —</option>
                      {US_STATES.map((s) => (
                        <option key={s.abbr} value={s.abbr}>{s.abbr} — {s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Company ZIP</label>
                    <input
                      type="text"
                      value={form.companyZip}
                      onChange={(e) => update('companyZip', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'home' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Home Street Address</label>
                  <input
                    type="text"
                    value={form.homeStreet}
                    onChange={(e) => update('homeStreet', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Home City</label>
                    <input
                      type="text"
                      value={form.homeCity}
                      onChange={(e) => update('homeCity', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Home State</label>
                    <select
                      value={form.homeState}
                      onChange={(e) => update('homeState', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="">— Select State —</option>
                      {US_STATES.map((s) => (
                        <option key={s.abbr} value={s.abbr}>{s.abbr} — {s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Home ZIP Code</label>
                    <input
                      type="text"
                      value={form.homeZip}
                      onChange={(e) => update('homeZip', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs flex items-center gap-2 transition-all shadow-md shadow-teal-600/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  Status & Tier Badges
// ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    active:   { dot: 'bg-teal-500',  text: 'text-teal-600',  label: 'Active'   },
    pending:  { dot: 'bg-amber-500', text: 'text-amber-600', label: 'Pending'  },
    expired:  { dot: 'bg-rose-500',  text: 'text-rose-600',  label: 'Expired'  },
    inactive: { dot: 'bg-slate-300', text: 'text-slate-400', label: 'Inactive' },
  }[status] ?? { dot: 'bg-slate-300', text: 'text-slate-400', label: status };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
    </div>
  );
}

function TierBadge({ tier }) {
  const cfg = {
    corporate:    'bg-purple-100 text-purple-700',
    professional: 'bg-blue-100 text-blue-700',
    student:      'bg-teal-100 text-teal-700',
  }[tier] ?? 'bg-slate-100 text-slate-500';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${cfg}`}>
      {tier}
    </span>
  );
}

function ActionBtn({ onClick, disabled, title, children, variant = 'default' }) {
  const variants = {
    default: 'text-slate-400 hover:text-slate-900 hover:bg-slate-100',
    success: 'text-slate-400 hover:text-teal-600 hover:bg-teal-50',
    danger:  'text-slate-400 hover:text-rose-600 hover:bg-rose-50',
    gold:    'text-slate-400 hover:text-amber-500 hover:bg-amber-50',
    warning: 'text-slate-400 hover:text-orange-500 hover:bg-orange-50',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = [];
  pages.push(1);
  if (currentPage > 3) {
    pages.push('ellipsis-1');
  }
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (currentPage < totalPages - 2) {
    pages.push('ellipsis-2');
  }
  pages.push(totalPages);
  return pages;
}

// ─────────────────────────────────────────────────────────
//  Main AdminMembers Component
// ─────────────────────────────────────────────────────────
export default function AdminMembers() {
  const [searchParams]                    = useSearchParams();
  const [limit, setLimit]                 = useState(() => parseInt(searchParams.get('limit') || '10', 10));
  const [page, setPage]                   = useState(() => Math.max(1, parseInt(searchParams.get('page') || '1', 10)));
  const [search, setSearch]               = useState(() => searchParams.get('search') || '');
  const [statusFilter, setStatusFilter]   = useState(() => searchParams.get('status') || '');
  const [tierFilter, setTierFilter]       = useState(() => searchParams.get('tier') || '');
  const [segFilter, setSegFilter]         = useState(() => searchParams.get('seg_status') || '');

  const [members, setMembers]             = useState([]);
  const [pagination, setPagination]       = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading]             = useState(true);
  const [acting, setActing]               = useState({});
  const [exporting, setExporting]         = useState(false);
  const [certModal, setCertModal]         = useState({ open: false, member: null });

  // ── Modals state ──────────────────────────────────────
  const [selectedMemberDetails, setSelectedMemberDetails] = useState(null);
  const [editingMember, setEditingMember]                 = useState(null);
  const [modal, setModal] = useState({
    open: false, title: '', message: '', confirmLabel: '', variant: 'danger', onConfirm: null,
  });
  const [pwModal, setPwModal] = useState({ open: false, name: '', password: '' });
  const [copied, setCopied] = useState(false);

  const showConfirm = (opts) => setModal({ open: true, ...opts });
  const closeModal  = () => setModal((m) => ({ ...m, open: false }));

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (search)       params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (tierFilter)   params.set('tier',   tierFilter);
      if (segFilter)    params.set('seg_status', segFilter);

      const response = await api.get(`/members/export?${params}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `GST_Members_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      gstToast.success('Member list exported to CSV successfully.');
    } catch (err) {
      console.error('Export failed:', err);
      gstToast.error(err.response?.data?.message || 'Failed to export members.');
    } finally {
      setExporting(false);
    }
  };

  // Sync with URL query params if changed externally
  useEffect(() => {
    const s = searchParams.get('status');
    if (s !== null && s !== statusFilter) {
      setStatusFilter(s);
      setPage(1);
    }
  }, [searchParams]);

  // ── Fetch ────────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (search)       params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (tierFilter)   params.set('tier',   tierFilter);
      if (segFilter)    params.set('seg_status', segFilter);
      const { data } = await api.get(`/members?${params}`);
      setMembers(data.data || []);
      const p = data.pagination || {};
      const total = p.total ?? (data.data || []).length;
      const totalPages = p.totalPages || p.pages || Math.ceil(total / limit) || 1;
      setPagination({
        page: p.page || page,
        limit: p.limit || limit,
        total,
        totalPages,
      });
    } catch (err) {
      gstToast.error(err.response?.data?.message || 'Failed to load members.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, tierFilter, segFilter]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  // ── Actions ──────────────────────────────────────────
  const setMemberActing = (id, val) => setActing((a) => ({ ...a, [id]: val }));

  const updateStatus = async (id, status) => {
    setMemberActing(id, true);
    const member = members.find(m => m.id === id);
    const prevStatus = member?.status;
    try {
      await api.patch(`/members/${id}/status`, { status });
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
      const name = member ? `${member.first_name} ${member.last_name}` : 'Member';
      const actionText = status === 'active' 
        ? (prevStatus === 'inactive' ? 'reactivated' : 'approved')
        : (status === 'inactive' ? 'deactivated' : 'set to pending');
      gstToast.success(`${name} has been ${actionText}.`);
    } catch (err) {
      gstToast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setMemberActing(id, false);
    }
  };

  const toggleExecutive = async (id, isExecutive) => {
    setMemberActing(id, true);
    const member = members.find(m => m.id === id);
    const name   = member ? `${member.first_name} ${member.last_name}` : 'Member';
    try {
      await api.patch(`/members/${id}/executive`, { is_executive: isExecutive });
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_executive: isExecutive ? 1 : 0 } : m))
      );
      if (isExecutive) {
        gstToast.success(`${name} has been promoted to Executive Member.`);
      } else {
        gstToast.warning(`Executive status removed from ${name}.`);
      }
    } catch (err) {
      gstToast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setMemberActing(id, false);
    }
  };

  const deleteMember = async (id) => {
    setMemberActing(id, true);
    const member = members.find(m => m.id === id);
    const name   = member ? `${member.first_name} ${member.last_name}` : 'Member';
    try {
      await api.delete(`/members/${id}`);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setPagination((p) => ({ ...p, total: p.total - 1 }));
      gstToast.success(`${name} has been permanently deleted.`);
    } catch (err) {
      gstToast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setMemberActing(id, false);
    }
  };

  const renewMember = async (id) => {
    setMemberActing(id, true);
    try {
      await api.patch(`/members/${id}/renew`, { months: 12 });
      gstToast.success('Membership renewed successfully (+1 Year).');
      fetchMembers();
    } catch (err) {
      gstToast.error(err.response?.data?.message || 'Renewal failed.');
    } finally {
      setMemberActing(id, false);
    }
  };

  const confirmRenew = (m) =>
    showConfirm({
      title:        'Renew Membership',
      message:      `Renew ${m.first_name} ${m.last_name}'s membership for 1 year? Their status will be set to active and expiration date extended.`,
      confirmLabel: 'Renew (+1 Year)',
      variant:      'success',
      onConfirm:    () => renewMember(m.id),
    });

  const resetPassword = async (id, name) => {
    setMemberActing(id, true);
    try {
      const { data } = await api.patch(`/members/${id}/reset-password`);
      setPwModal({ open: true, name, password: data.data.newPassword });
      gstToast.success(`Password reset for ${name}.`);
    } catch (err) {
      gstToast.error(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setMemberActing(id, false);
    }
  };

  const confirmApprove = (m) =>
    showConfirm({
      title:        'Approve Membership',
      message:      `Approve ${m.first_name} ${m.last_name}'s membership application? They will become an active member.`,
      confirmLabel: 'Approve',
      variant:      'success',
      onConfirm:    () => updateStatus(m.id, 'active'),
    });

  const confirmActivate = (m) =>
    showConfirm({
      title:        'Reactivate Member',
      message:      `Reactivate ${m.first_name} ${m.last_name}? Their membership and user account will be restored to active status.`,
      confirmLabel: 'Reactivate',
      variant:      'success',
      onConfirm:    () => updateStatus(m.id, 'active'),
    });

  const confirmDeactivate = (m) =>
    showConfirm({
      title:        'Deactivate Member',
      message:      `Deactivate ${m.first_name} ${m.last_name}? Their account will be suspended.`,
      confirmLabel: 'Deactivate',
      variant:      'danger',
      onConfirm:    () => updateStatus(m.id, 'inactive'),
    });

  const confirmSetPending = (m) =>
    showConfirm({
      title:        'Reset to Pending',
      message:      `Move ${m.first_name} ${m.last_name} back to pending status? This will require a new review.`,
      confirmLabel: 'Reset',
      variant:      'warning',
      onConfirm:    () => updateStatus(m.id, 'pending'),
    });

  const confirmMakeExecutive = (m) =>
    showConfirm({
      title:        'Promote to Executive',
      message:      `Promote ${m.first_name} ${m.last_name} to executive member? They will appear on the Executive Board page.`,
      confirmLabel: 'Promote',
      variant:      'success',
      onConfirm:    () => toggleExecutive(m.id, true),
    });

  const confirmRemoveExecutive = (m) =>
    showConfirm({
      title:        'Remove Executive Status',
      message:      `Remove executive status from ${m.first_name} ${m.last_name}? They will no longer appear on the Executive Board.`,
      confirmLabel: 'Remove',
      variant:      'warning',
      onConfirm:    () => toggleExecutive(m.id, false),
    });

  const confirmDelete = (m) =>
    showConfirm({
      title:        'Delete Member',
      message:      `Permanently delete ${m.first_name} ${m.last_name}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant:      'danger',
      onConfirm:    () => deleteMember(m.id),
    });

  const confirmResetPassword = (m) =>
    showConfirm({
      title:        'Reset Password',
      message:      `Reset ${m.first_name} ${m.last_name}'s password to default?`,
      confirmLabel: 'Reset Password',
      variant:      'warning',
      onConfirm:    () => resetPassword(m.id, `${m.first_name} ${m.last_name}`),
    });

  const pendingCount = members.filter((m) => m.status === 'pending').length;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      {/* Confirm modal */}
      <ConfirmModal
        open={modal.open}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        variant={modal.variant}
      />

      {/* Member Full Details Modal */}
      {selectedMemberDetails && (
        <MemberDetailsModal
          member={selectedMemberDetails}
          onClose={() => setSelectedMemberDetails(null)}
          onRenew={confirmRenew}
          onActivate={confirmActivate}
          onDeactivate={confirmDeactivate}
          onEdit={(m) => setEditingMember(m)}
          onViewCert={(m) => setCertModal({ open: true, member: m })}
        />
      )}

      {/* Edit Member Profile Modal */}
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={(updated) => {
            setMembers((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
            if (selectedMemberDetails?.id === updated.id) {
              setSelectedMemberDetails(updated);
            }
          }}
        />
      )}

      {/* Password Reset Modal */}
      {pwModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPwModal({ open: false, name: '', password: '' })} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <button
              onClick={() => setPwModal({ open: false, name: '', password: '' })}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-teal-100 text-teal-600">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">Password Reset</h3>
            <p className="text-sm text-slate-500 mb-5">
              The password for <strong>{pwModal.name}</strong> has been reset to default:
            </p>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-5">
              <Eye className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <code className="text-sm font-black text-teal-600 tracking-widest flex-1 select-all">{pwModal.password}</code>
              <button
                onClick={() => copyToClipboard(pwModal.password)}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-all"
                title="Copy to clipboard"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            {copied && (
              <p className="text-xs text-teal-600 font-bold text-center mb-3">✓ Copied to clipboard!</p>
            )}

            <button
              onClick={() => setPwModal({ open: false, name: '', password: '' })}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 flex flex-col pb-12">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Users className="w-4 h-4 text-teal-600" />
            <span className="mx-2">/</span>
            <span className="text-slate-900">Member Directory</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
              title="Export filtered members to CSV"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" /> : <Download className="w-3.5 h-3.5 text-teal-400" />}
              <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>
            <button
              onClick={fetchMembers}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <div className="p-8 space-y-6 animate-fade-in">
          
          {/* Title + Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Members</h1>
              <p className="text-xs text-slate-400 mt-1">
                {pagination.total} total members ·{' '}
                {pendingCount > 0 && (
                  <span className="text-amber-600 font-bold">{pendingCount} pending review</span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative group min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search name, email, company…"
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="py-2 pl-3 pr-7 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="">Status: All</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={tierFilter}
                onChange={(e) => { setTierFilter(e.target.value); setPage(1); }}
                className="py-2 pl-3 pr-7 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="">Tier: All</option>
                <option value="student">Student</option>
                <option value="professional">Professional</option>
                <option value="corporate">Corporate</option>
              </select>

              <select
                value={segFilter}
                onChange={(e) => { setSegFilter(e.target.value); setPage(1); }}
                className="py-2 pl-3 pr-7 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="">SEG: All</option>
                <option value="active">SEG Active</option>
                <option value="associate">SEG Associate</option>
                <option value="emeritus">SEG Emeritus</option>
                <option value="student">SEG Student</option>
                <option value="non-member">SEG Non-Member</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Member Name &amp; Contact</th>
                    <th className="px-6 py-4">Company &amp; Position</th>
                    <th className="px-6 py-4">SEG Status</th>
                    <th className="px-6 py-4">Tier</th>
                    <th className="px-6 py-4">Status &amp; Expiration</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-teal-500 mx-auto" />
                      </td>
                    </tr>
                  )}
                  {!loading && members.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400 text-xs">
                        No members found matching your search.
                      </td>
                    </tr>
                  )}
                  {!loading && members.map((m) => {
                    const isActing = !!acting[m.id];
                    const initials = `${m.first_name?.[0] ?? ''}${m.last_name?.[0] ?? ''}`.toUpperCase();

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs group-hover:bg-teal-500 group-hover:text-white transition-all shrink-0 overflow-hidden">
                              {m.avatar_url ? (
                                <img src={m.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span>{initials}</span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 text-sm">{m.first_name} {m.last_name}</span>
                                {m.nickname && <span className="text-slate-400 text-[11px]">({m.nickname})</span>}
                                {m.is_executive === 1 && (
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" title="Executive Member" />
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span>{m.email}</span>
                                <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                  #{m.member_id || m.id}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{m.company_name || m.company || '—'}</div>
                          <div className="text-[10px] text-slate-400">{m.job_title || m.board_position || '—'}</div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                            {m.seg_status || 'non-member'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <TierBadge tier={m.tier} />
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={m.status} />
                          {m.expires_at ? (
                            <div className={`text-[10px] mt-1 font-medium ${
                              m.status === 'expired' ? 'text-rose-600 font-bold' : 'text-slate-400'
                            }`}>
                              {m.status === 'expired' ? 'Expired ' : 'Exp: '}
                              {new Date(m.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          ) : (
                            <div className="text-[10px] mt-1 text-slate-400">No expiration</div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-1">
                            {/* View Full Details */}
                            <ActionBtn
                              title="View full member profile"
                              onClick={() => setSelectedMemberDetails(m)}
                            >
                              <Eye className="w-4 h-4 text-teal-600" />
                            </ActionBtn>

                            {/* Edit Member Profile */}
                            <ActionBtn
                              title="Edit member profile"
                              onClick={() => setEditingMember(m)}
                            >
                              <Pencil className="w-4 h-4 text-blue-600" />
                            </ActionBtn>

                            {isActing ? (
                              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                            ) : (
                              <>
                                {(m.status === 'active' || m.status === 'expired') && (
                                  <ActionBtn variant="success" title="Renew (+1 Year)" onClick={() => confirmRenew(m)}>
                                    <RefreshCw className="w-4 h-4 text-emerald-600" />
                                  </ActionBtn>
                                )}
                                {m.status === 'pending' && (
                                  <ActionBtn variant="success" title="Approve membership" onClick={() => confirmApprove(m)}>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  </ActionBtn>
                                )}
                                {m.status === 'inactive' && (
                                  <ActionBtn variant="success" title="Reactivate membership" onClick={() => confirmActivate(m)}>
                                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                                  </ActionBtn>
                                )}
                                {m.status === 'active' && (
                                  <ActionBtn variant="danger" title="Deactivate membership" onClick={() => confirmDeactivate(m)}>
                                    <XCircle className="w-4 h-4 text-rose-500" />
                                  </ActionBtn>
                                )}
                                {(m.status === 'active' || m.status === 'inactive') && (
                                  <ActionBtn title="Reset to pending" onClick={() => confirmSetPending(m)}>
                                    <AlertCircle className="w-4 h-4" />
                                  </ActionBtn>
                                )}
                                {m.status === 'active' && (m.is_executive ? (
                                  <ActionBtn variant="gold" title="Remove executive status" onClick={() => confirmRemoveExecutive(m)}>
                                    <StarOff className="w-4 h-4" />
                                  </ActionBtn>
                                ) : (
                                  <ActionBtn variant="gold" title="Promote to executive" onClick={() => confirmMakeExecutive(m)}>
                                    <Star className="w-4 h-4" />
                                  </ActionBtn>
                                ))}
                                <ActionBtn variant="warning" title="Reset password" onClick={() => confirmResetPassword(m)}>
                                  <KeyRound className="w-4 h-4" />
                                </ActionBtn>
                                <ActionBtn variant="danger" title="Delete member" onClick={() => confirmDelete(m)}>
                                  <Trash2 className="w-4 h-4" />
                                </ActionBtn>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination & Results Bar */}
            {(() => {
              const total = pagination.total || members.length || 0;
              const totalPages = pagination.totalPages || pagination.pages || Math.ceil(total / limit) || 1;
              const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
              const endItem = Math.min(page * limit, total);

              return (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xs text-slate-500 font-medium">
                      Showing <span className="font-bold text-slate-900">{startItem}–{endItem}</span> of <span className="font-bold text-slate-900">{total}</span> members
                    </p>
                    <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                      <label htmlFor="member-limit-select" className="text-xs text-slate-400 font-medium">Rows:</label>
                      <select
                        id="member-limit-select"
                        value={limit}
                        onChange={(e) => {
                          setLimit(Number(e.target.value));
                          setPage(1);
                        }}
                        className="py-1 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      >
                        <option value={10}>10 / page</option>
                        <option value={25}>25 / page</option>
                        <option value={50}>50 / page</option>
                        <option value={100}>100 (All) / page</option>
                      </select>
                    </div>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1.5 px-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {getPageNumbers(page, totalPages).map((pNum, idx) => {
                          if (typeof pNum === 'string') {
                            return (
                              <span key={`el-${idx}`} className="px-1 text-xs font-bold text-slate-400">
                                …
                              </span>
                            );
                          }
                          const isActive = pNum === page;
                          return (
                            <button
                              key={pNum}
                              onClick={() => setPage(pNum)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                isActive
                                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                                  : 'text-slate-600 hover:bg-white border border-transparent hover:border-slate-200'
                              }`}
                            >
                              {pNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-1.5 px-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

        </div>
      </main>
      <MembershipCertificateModal
        open={certModal.open}
        onClose={() => setCertModal({ open: false, member: null })}
        member={certModal.member}
      />
    </>
  );
}
