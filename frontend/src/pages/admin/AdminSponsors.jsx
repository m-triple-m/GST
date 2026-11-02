import { useState, useEffect, useRef } from 'react';
import {
  Plus, Pencil, Trash2, Check, X, AlertTriangle,
  Loader2, RefreshCw, Building2, Globe, ExternalLink,
  ToggleLeft, ToggleRight, ChevronDown, Upload, Link2, ImageIcon,
  GripVertical, Sparkles, Layers, Mail, Search, Inbox, Phone, Eye
} from 'lucide-react';
import { Reorder } from 'motion/react';
import api from '../../api';
import { gstToast } from '../../utils/toast';

// ── Constants ─────────────────────────────────────────────────────────────────
const TIERS = ['platinum', 'gold', 'silver', 'bronze'];

const TIER_PRIORITY = {
  platinum: 1,
  gold:     2,
  silver:   3,
  bronze:   4,
};

const TIER_STYLES = {
  platinum: { badge: 'bg-teal-100 text-teal-700 border-teal-200',      dot: 'bg-teal-500'  },
  gold:     { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  silver:   { badge: 'bg-slate-100 text-slate-600 border-slate-300',   dot: 'bg-slate-400' },
  bronze:   { badge: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-500' },
  custom:   { badge: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
};

const ENQUIRY_STATUS_STYLES = {
  new:       { label: 'New',       bg: 'bg-rose-100 text-rose-700' },
  read:      { label: 'Read',      bg: 'bg-slate-100 text-slate-600' },
  in_review: { label: 'In Review', bg: 'bg-amber-100 text-amber-700' },
  approved:  { label: 'Approved',  bg: 'bg-emerald-100 text-emerald-700' },
  declined:  { label: 'Declined',  bg: 'bg-slate-100 text-slate-500' },
};

const EMPTY_FORM = { name: '', logo_url: '', website_url: '', tier: 'bronze', is_active: 1, sort_order: 0 };

// ── Small helpers ─────────────────────────────────────────────────────────────
function TierBadge({ tier }) {
  const s = TIER_STYLES[tier] ?? TIER_STYLES.bronze;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {tier}
    </span>
  );
}

function Input({ label, id, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
      />
    </div>
  );
}

// ── Add / Edit Form ───────────────────────────────────────────────────────────
function SponsorForm({ initial = EMPTY_FORM, onSave, onCancel, saving }) {
  const [form, setForm]           = useState(initial);
  const [logoTab, setLogoTab]     = useState('upload'); // 'upload' | 'url'
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver]   = useState(false);
  const [error, setError]         = useState('');
  const fileInputRef = useRef(null);

  const set = (key) => (e) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
    setError('');
  };

  // Upload logo file to backend → receive a URL
  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are accepted (PNG, JPG, SVG, WebP…)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File must be under 5 MB.');
      return;
    }
    try {
      setUploading(true);
      setUploadError('');
      const fd = new FormData();
      fd.append('logo', file);
      const { data } = await api.post('/sponsors/upload-logo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(prev => ({ ...prev, logo_url: data.data.logo_url }));
    } catch (err) {
      setUploadError(err.response?.data?.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim())    { setError('Sponsor name is required.'); return; }
    if (!form.logo_url.trim()){ setError('A logo is required — upload a file or enter a URL.'); return; }
    onSave({ ...form, is_active: Number(form.is_active), sort_order: Number(form.sort_order) || 0 });
  };

  const backendBase = import.meta.env.VITE_API_URL?.replace('/api', '') ?? '';
  const previewSrc  = form.logo_url
    ? (form.logo_url.startsWith('http') ? form.logo_url : `${backendBase}${form.logo_url}`)
    : null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-teal-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {initial.id ? 'Edit Sponsor' : 'Add New Sponsor'}
          </h2>
        </div>
        <button onClick={onCancel} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name + Tier */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Sponsor Name" id="sp-name" required
            value={form.name} onChange={set('name')} placeholder="e.g. ExxonMobil"
          />
          <div>
            <label htmlFor="sp-tier" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Tier<span className="text-red-400 ml-0.5">*</span>
            </label>
            <div className="relative">
              <select
                id="sp-tier"
                value={form.tier}
                onChange={set('tier')}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
              >
                {TIERS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Logo section ── */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Logo<span className="text-red-400 ml-0.5">*</span>
          </p>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-4 w-fit">
            {[{ key: 'upload', label: 'Upload File', icon: Upload },
              { key: 'url',    label: 'Enter URL',   icon: Link2  }].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => { setLogoTab(key); setUploadError(''); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  logoTab === key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          {/* Upload tab */}
          {logoTab === 'upload' && (
            <div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                  dragOver
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-slate-200 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/50'
                }`}
              >
                {uploading ? (
                  <><Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                  <p className="text-xs font-bold text-teal-600">Uploading…</p></>
                ) : form.logo_url && !form.logo_url.startsWith('http') ? (
                  /* Uploaded file — show preview inline */
                  <>
                    <img src={previewSrc} alt="Logo" className="max-h-16 object-contain" />
                    <p className="text-[10px] text-teal-600 font-bold">✓ Uploaded — click to replace</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-700">Drop logo here or <span className="text-teal-600">browse</span></p>
                      <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, SVG, WebP — max 5 MB</p>
                    </div>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files?.[0])}
                />
              </div>
              {uploadError && (
                <p className="flex items-center gap-1.5 text-xs text-red-500 font-semibold mt-2">
                  <AlertTriangle className="w-3.5 h-3.5" /> {uploadError}
                </p>
              )}
            </div>
          )}

          {/* URL tab */}
          {logoTab === 'url' && (
            <input
              id="sp-logo"
              type="url"
              value={form.logo_url.startsWith('/') ? '' : form.logo_url}
              onChange={(e) => { setForm(prev => ({ ...prev, logo_url: e.target.value })); setError(''); }}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            />
          )}

          {/* Logo preview (always shown when a logo_url exists) */}
          {previewSrc && logoTab === 'url' && (
            <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
              <img src={previewSrc} alt="Preview" className="max-h-10 object-contain"
                onError={(e) => { e.target.style.display = 'none'; }} />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Preview</p>
            </div>
          )}
        </div>

        {/* Website URL */}
        <Input
          label="Website URL" id="sp-website"
          value={form.website_url} onChange={set('website_url')}
          placeholder="https://example.com"
        />

        {/* Sort order + Active toggle */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Sort Order
            </label>
            <input
              type="number" min="0"
              value={form.sort_order}
              onChange={set('sort_order')}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            />
            <p className="text-[10px] text-slate-400 mt-1">Lower = appears first. Automatically updated when dragged.</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Visible on Site
            </label>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, is_active: prev.is_active ? 0 : 1 }))}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                form.is_active
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
            >
              {form.is_active
                ? <><ToggleRight className="w-5 h-5 text-teal-500" /> Active</>
                : <><ToggleLeft className="w-5 h-5 text-slate-400" /> Hidden</>}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button type="submit" disabled={saving || uploading}
            className="flex-1 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-sm font-bold transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? 'Saving…' : (initial.id ? 'Save Changes' : 'Add Sponsor')}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ sponsor, onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
          <Trash2 className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">Remove Sponsor?</h3>
        <p className="text-sm text-slate-500 mb-6">
          <span className="font-bold text-slate-700">{sponsor.name}</span> will be permanently removed from the site.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {deleting ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminSponsors() {
  const [viewMode, setViewMode]         = useState('sponsors'); // 'sponsors' | 'enquiries'
  const [sponsors, setSponsors]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [activeTab, setActiveTab]       = useState('all'); // 'all' | 'platinum' | 'gold' | 'silver' | 'bronze'
  const [autoArranging, setAutoArranging] = useState(false);

  // Sponsor Enquiries state
  const [enquiries, setEnquiries]               = useState([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [enquiryFilter, setEnquiryFilter]       = useState('all'); // 'all' | 'new' | 'in_review' | 'approved' | 'declined'
  const [enquirySearch, setEnquirySearch]       = useState('');
  const [selectedEnquiry, setSelectedEnquiry]   = useState(null);
  const [updatingEnquiryId, setUpdatingEnquiryId] = useState(null);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/sponsors/all');
      setSponsors(data.data ?? []);
    } catch (err) {
      console.error('Failed to load sponsors', err);
      gstToast.error('Failed to load sponsors.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnquiries = async () => {
    try {
      setEnquiriesLoading(true);
      const { data } = await api.get('/sponsors/enquiries?limit=100');
      setEnquiries(data.data ?? []);
    } catch (err) {
      console.error('Failed to load sponsor enquiries', err);
    } finally {
      setEnquiriesLoading(false);
    }
  };

  useEffect(() => { 
    fetchSponsors(); 
    fetchEnquiries();
  }, []);

  const handleUpdateEnquiryStatus = async (id, status) => {
    try {
      setUpdatingEnquiryId(id);
      await api.patch(`/sponsors/enquiries/${id}/status`, { status });
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry(prev => ({ ...prev, status }));
      }
      gstToast.success(`Enquiry marked as ${status.replace('_', ' ')}.`);
    } catch (err) {
      console.error('Failed to update status', err);
      gstToast.error('Failed to update enquiry status.');
    } finally {
      setUpdatingEnquiryId(null);
    }
  };

  const handleOpenEnquiry = async (enquiry) => {
    setSelectedEnquiry(enquiry);
    if (enquiry.status === 'new') {
      try {
        await api.patch(`/sponsors/enquiries/${enquiry.id}/status`, { status: 'read' });
        setEnquiries(prev => prev.map(e => e.id === enquiry.id ? { ...e, status: 'read' } : e));
        setSelectedEnquiry(prev => prev && prev.id === enquiry.id ? { ...prev, status: 'read' } : prev);
      } catch (err) {
        console.error('Failed to mark enquiry as read', err);
      }
    }
  };

  const handleAdd    = () => { setEditTarget(null); setShowForm(true); };
  const handleEdit   = (s) => { setEditTarget(s); setShowForm(true); };
  const handleCancel = () => { setShowForm(false); setEditTarget(null); };

  const handleSave = async (form) => {
    try {
      setSaving(true);
      if (editTarget) {
        await api.put(`/sponsors/${editTarget.id}`, form);
        gstToast.success(`${form.name} updated successfully.`);
      } else {
        await api.post('/sponsors', form);
        gstToast.success(`${form.name} added successfully.`);
      }
      setShowForm(false);
      setEditTarget(null);
      fetchSponsors();
    } catch (err) {
      console.error(err);
      gstToast.error(err.response?.data?.message ?? 'Failed to save sponsor.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (s) => {
    try {
      await api.put(`/sponsors/${s.id}`, { is_active: s.is_active ? 0 : 1 });
      setSponsors(prev => prev.map(sp => sp.id === s.id ? { ...sp, is_active: sp.is_active ? 0 : 1 } : sp));
      gstToast.success(s.is_active ? `${s.name} hidden from site.` : `${s.name} is now visible.`);
    } catch (err) {
      console.error(err);
      gstToast.error('Failed to update sponsor visibility.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/sponsors/${deleteTarget.id}`);
      gstToast.success(`${deleteTarget.name} removed.`);
      setDeleteTarget(null);
      fetchSponsors();
    } catch (err) {
      console.error(err);
      gstToast.error('Failed to remove sponsor.');
    } finally {
      setDeleting(false);
    }
  };

  // Reorder the entire unified list
  const handleReorderAll = async (newOrder) => {
    const updated = newOrder.map((s, idx) => ({ ...s, sort_order: idx }));
    setSponsors(updated);

    try {
      const itemsToUpdate = updated.map(s => ({ id: s.id, sort_order: s.sort_order }));
      await api.post('/sponsors/reorder', { items: itemsToUpdate });
    } catch (err) {
      console.error(err);
      gstToast.error('Failed to save sponsor sequence.');
    }
  };

  // Auto-arrange all sponsors by tier hierarchy (Platinum → Gold → Silver → Bronze)
  const handleAutoArrange = async () => {
    if (sponsors.length <= 1) {
      gstToast.info('Need at least 2 sponsors to auto-arrange.');
      return;
    }

    try {
      setAutoArranging(true);

      const sorted = [...sponsors].sort((a, b) => {
        const pA = TIER_PRIORITY[a.tier] ?? 99;
        const pB = TIER_PRIORITY[b.tier] ?? 99;
        if (pA !== pB) return pA - pB;
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      });

      const updated = sorted.map((s, idx) => ({ ...s, sort_order: idx }));
      setSponsors(updated);

      const itemsToUpdate = updated.map(s => ({ id: s.id, sort_order: s.sort_order }));
      await api.post('/sponsors/reorder', { items: itemsToUpdate });

      gstToast.success('Sponsors auto-arranged by tier (Platinum → Bronze)');
    } catch (err) {
      console.error(err);
      gstToast.error('Failed to save auto-arranged order.');
    } finally {
      setAutoArranging(false);
    }
  };

  const displayedSponsors = activeTab === 'all'
    ? sponsors
    : sponsors.filter(s => s.tier === activeTab);

  const filteredEnquiries = enquiries.filter(e => {
    const matchesFilter = enquiryFilter === 'all' || e.status === enquiryFilter;
    const matchesSearch = !enquirySearch || 
      e.company_name?.toLowerCase().includes(enquirySearch.toLowerCase()) ||
      e.contact_name?.toLowerCase().includes(enquirySearch.toLowerCase()) ||
      e.email?.toLowerCase().includes(enquirySearch.toLowerCase()) ||
      e.tier_interest?.toLowerCase().includes(enquirySearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const newEnquiriesCount = enquiries.filter(e => e.status === 'new').length;

  return (
    <main className="flex-1 min-w-0 flex flex-col">
      {/* Delete confirm modal */}
      {deleteTarget && (
        <DeleteConfirm
          sponsor={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <Building2 className="w-4 h-4" />
          <span className="mx-1">/</span>
          <span className="text-slate-900">Sponsors</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { fetchSponsors(); fetchEnquiries(); }} 
            title="Refresh"
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all border border-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {viewMode === 'sponsors' && (
            <button onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-xs font-bold transition-all shadow-lg shadow-teal-500/20">
              <Plus className="w-4 h-4" /> Add Sponsor
            </button>
          )}
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Top View Mode Switcher */}
        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setViewMode('sponsors')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewMode === 'sponsors'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Active Sponsors ({sponsors.length})
          </button>
          <button
            onClick={() => setViewMode('enquiries')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewMode === 'enquiries'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            Sponsorship Enquiries
            {newEnquiriesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {newEnquiriesCount} new
              </span>
            )}
          </button>
        </div>

        {viewMode === 'sponsors' ? (
          <>
            {/* Title & Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Sponsors</h1>
                <p className="text-slate-500 text-sm mt-1">
                  Drag any sponsor up or down to customize the display sequence, or use Auto-Arrange to sort by tier.
                </p>
              </div>
              
              {/* Action buttons */}
              {sponsors.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAutoArrange}
                    disabled={autoArranging || sponsors.length <= 1}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/70 text-teal-800 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                    title="Automatically organize sponsors in order: Platinum → Gold → Silver → Bronze"
                  >
                    {autoArranging ? (
                      <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-teal-600" />
                    )}
                    Auto-Arrange by Tier
                  </button>
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            {sponsors.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-100">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  All Sponsors
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {sponsors.length}
                  </span>
                </button>

                {TIERS.map(tier => {
                  const count = sponsors.filter(s => s.tier === tier).length;
                  if (!count) return null;
                  const isSelected = activeTab === tier;
                  return (
                    <button
                      key={tier}
                      onClick={() => setActiveTab(tier)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${TIER_STYLES[tier]?.dot ?? 'bg-slate-400'}`} />
                      {tier}
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Form modal */}
            {showForm && (
              <SponsorForm
                initial={editTarget ?? EMPTY_FORM}
                onSave={handleSave}
                onCancel={handleCancel}
                saving={saving}
              />
            )}

            {/* Content */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading sponsors…</p>
              </div>
            ) : sponsors.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto text-teal-500">
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">No sponsors yet</h3>
                  <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                    Add your society partners and corporate supporters to display them across the site.
                  </p>
                </div>
                <button onClick={handleAdd}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-xs font-bold transition-all shadow-lg shadow-teal-500/20">
                  <Plus className="w-4 h-4" /> Add First Sponsor
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {activeTab === 'all' ? (
                  <Reorder.Group
                    axis="y"
                    values={sponsors}
                    onReorder={handleReorderAll}
                    className="divide-y divide-slate-100"
                  >
                    {sponsors.map((s, idx) => (
                      <Reorder.Item
                        key={s.id}
                        value={s}
                        className={`px-8 py-4 flex items-center gap-4 sm:gap-5 hover:bg-slate-50/80 transition-colors bg-white select-none ${!s.is_active ? 'opacity-50' : ''}`}
                      >
                        <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors p-1" title="Drag to reorder">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <span className="w-7 text-center text-xs font-black text-slate-400 shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="w-16 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                          {s.logo_url
                            ? <img src={s.logo_url.startsWith('http') ? s.logo_url : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') ?? ''}${s.logo_url}`} alt={s.name} className="max-h-9 max-w-full object-contain p-1"
                                onError={e => { e.target.style.display = 'none'; }} />
                            : <Building2 className="w-5 h-5 text-slate-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-slate-900 truncate">{s.name}</p>
                            <TierBadge tier={s.tier} />
                          </div>
                          {s.website_url && (
                            <a href={s.website_url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-teal-500 hover:text-teal-600 transition-colors mt-0.5">
                              <Globe className="w-3 h-3" />
                              <span className="truncate max-w-[180px] sm:max-w-[280px]">{s.website_url.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => handleToggleActive(s)}
                          title={s.is_active ? 'Click to hide' : 'Click to show'}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            s.is_active
                              ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {s.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          <span className="hidden sm:inline">{s.is_active ? 'Active' : 'Hidden'}</span>
                        </button>
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                          <button
                            onClick={() => handleEdit(s)}
                            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {displayedSponsors.map((s, idx) => (
                      <div
                        key={s.id}
                        className={`px-8 py-4 flex items-center gap-4 sm:gap-5 hover:bg-slate-50/80 transition-colors bg-white ${!s.is_active ? 'opacity-50' : ''}`}
                      >
                        <span className="w-7 text-center text-xs font-black text-slate-400 shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="w-16 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                          {s.logo_url
                            ? <img src={s.logo_url.startsWith('http') ? s.logo_url : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') ?? ''}${s.logo_url}`} alt={s.name} className="max-h-9 max-w-full object-contain p-1"
                                onError={e => { e.target.style.display = 'none'; }} />
                            : <Building2 className="w-5 h-5 text-slate-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-slate-900 truncate">{s.name}</p>
                            <TierBadge tier={s.tier} />
                          </div>
                          {s.website_url && (
                            <a href={s.website_url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-teal-500 hover:text-teal-600 transition-colors mt-0.5">
                              <Globe className="w-3 h-3" />
                              <span className="truncate max-w-[180px] sm:max-w-[280px]">{s.website_url.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => handleToggleActive(s)}
                          title={s.is_active ? 'Click to hide' : 'Click to show'}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            s.is_active
                              ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {s.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          <span className="hidden sm:inline">{s.is_active ? 'Active' : 'Hidden'}</span>
                        </button>
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                          <button
                            onClick={() => handleEdit(s)}
                            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* ── Sponsorship Enquiries View ── */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sponsorship Enquiries</h1>
                <p className="text-slate-500 text-sm mt-1">
                  Manage incoming partnership proposals submitted from the public sponsorship page.
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={enquirySearch}
                  onChange={e => setEnquirySearch(e.target.value)}
                  placeholder="Search company, contact, tier..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-100">
              {[
                { id: 'all',       label: 'All Enquiries', count: enquiries.length },
                { id: 'new',       label: 'New',           count: enquiries.filter(e => e.status === 'new').length },
                { id: 'read',      label: 'Read',          count: enquiries.filter(e => e.status === 'read').length },
                { id: 'in_review', label: 'In Review',     count: enquiries.filter(e => e.status === 'in_review').length },
                { id: 'approved',  label: 'Approved',      count: enquiries.filter(e => e.status === 'approved').length },
                { id: 'declined',  label: 'Declined',      count: enquiries.filter(e => e.status === 'declined').length },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setEnquiryFilter(f.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    enquiryFilter === f.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {f.label}
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${enquiryFilter === f.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Enquiries List */}
            {enquiriesLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading enquiries…</p>
              </div>
            ) : filteredEnquiries.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto text-amber-500">
                  <Inbox className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No sponsorship enquiries found</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">
                  {enquirySearch ? 'No enquiries matched your search query.' : 'Incoming sponsor proposals will appear here.'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                {filteredEnquiries.map((enquiry) => {
                  const tierStyle = TIER_STYLES[enquiry.tier_interest?.toLowerCase()] || TIER_STYLES.custom;
                  const statusStyle = ENQUIRY_STATUS_STYLES[enquiry.status] || ENQUIRY_STATUS_STYLES.new;
                  return (
                    <div
                      key={enquiry.id}
                      onClick={() => handleOpenEnquiry(enquiry)}
                      className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center font-black shrink-0 transition-all text-sm group-hover:scale-105">
                          {enquiry.company_name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm truncate ${enquiry.status === 'new' ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                              {enquiry.company_name}
                            </span>
                            {enquiry.status === 'new' && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="New unread enquiry" />
                            )}
                            <span className="text-xs text-slate-500 font-semibold">
                              · {enquiry.contact_name}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${tierStyle.badge}`}>
                              {enquiry.tier_interest || 'Custom'}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${statusStyle.bg}`}>
                              {statusStyle.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {enquiry.message || 'No additional message provided.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline-block">
                          {new Date(enquiry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEnquiry(enquiry);
                          }}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Selected Sponsor Enquiry Modal */}
        {selectedEnquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
              <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-lg font-black text-slate-900">{selectedEnquiry.company_name}</h3>
                    {(() => {
                      const sStyle = ENQUIRY_STATUS_STYLES[selectedEnquiry.status] || ENQUIRY_STATUS_STYLES.new;
                      return (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${sStyle.bg}`}>
                          {sStyle.label}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Contact: <span className="font-bold text-slate-800">{selectedEnquiry.contact_name}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedEnquiry(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Status Switcher Toolbar */}
                <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Change Status</span>
                  <div className="flex items-center gap-1.5">
                    {['new', 'read', 'in_review', 'approved', 'declined'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateEnquiryStatus(selectedEnquiry.id, st)}
                        disabled={updatingEnquiryId === selectedEnquiry.id || selectedEnquiry.status === st}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                          selectedEnquiry.status === st
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Tier Interest</span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      {selectedEnquiry.tier_interest || 'Custom'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Received</span>
                    <span className="text-xs font-bold text-slate-800">
                      {new Date(selectedEnquiry.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Email Address</span>
                    <a href={`mailto:${selectedEnquiry.email}`} className="text-xs font-bold text-teal-600 hover:underline truncate block">
                      {selectedEnquiry.email}
                    </a>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Phone Number</span>
                    {selectedEnquiry.phone ? (
                      <a href={`tel:${selectedEnquiry.phone}`} className="text-xs font-bold text-slate-800 hover:text-teal-600">
                        {selectedEnquiry.phone}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Not provided</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Enquiry Message</span>
                  <div className="p-4 bg-slate-50 rounded-2xl text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-100 max-h-48 overflow-y-auto">
                    {selectedEnquiry.message || 'No additional message was included in this enquiry.'}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Close
                </button>
                <a
                  href={`mailto:${selectedEnquiry.email}?subject=GST Sponsorship Partnership - ${selectedEnquiry.company_name}`}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-600/20 flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Reply via Email
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

