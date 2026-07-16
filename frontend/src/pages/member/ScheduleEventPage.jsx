import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Type, Tag, AlignLeft, MapPin, Monitor, Link as LinkIcon,
  Clock, Check, Save, ArrowLeft, Loader2, CheckCircle2,
  UploadCloud, Trash2
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  'Workshop',
  'Technical Luncheon',
  'Annual Meeting',
  'Social Gathering',
  'Field Trip',
  'Webinar',
  'Other',
];

const INITIAL = {
  title:            '',
  event_type:       'Workshop',
  description:      '',
  speaker_name:     '',
  speaker_org:      '',
  speaker_image_url:'',
  speaker_bio:      '',
  event_date:       '',
  start_time:       '',
  duration_minutes: '',
  rsvp_deadline:    '',
  location_type:    'online',
  location_url:     '',
  location_address: '',
  capacity:         '',
  member_ticket_cost:     '',
  non_member_ticket_cost: '',
  status:           'upcoming',
  video_url:        '',
  gallery:          [],
  keynotes:         [],
};

// ─── DEV ONLY — remove before production ──────────────────────
const DUMMY_DATA = {
  title:            'Q4 Technical Luncheon — Basin Analysis Deep Dive',
  event_type:       'Technical Luncheon',
  description:      'Join us for an in-depth discussion on the latest developments in Tulsa Basin exploration. Our keynote speaker will walk through seismic interpretation techniques and basin modelling workflows used in current production projects.',
  speaker_name:     'Dr. Sarah Mitchell',
  speaker_org:      'University of Tulsa – Geosciences Dept.',
  speaker_image_url:'',
  speaker_bio:      'Dr. Mitchell is an award-winning geoscientist specializing in structural geology and basin modeling.',
  event_date:       (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]; })(),
  start_time:       '11:30',
  duration_minutes: '90',
  rsvp_deadline:    (() => { const d = new Date(); d.setDate(d.getDate() + 25); return d.toISOString().split('T')[0]; })(),
  location_type:    'physical',
  location_url:     '',
  location_address: 'Tulsa Country Club, 701 N Union Ave, Tulsa, OK 74127',
  capacity:         '150',
  member_ticket_cost:     '25.00',
  non_member_ticket_cost: '35.00',
  status:           'upcoming',
  video_url:        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  gallery:          [],
  keynotes:         [],
};
// ─────────────────────────────────────────────────────────────

export default function ScheduleEventPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user }  = useAuth();

  const [form, setForm]       = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [errors, setErrors]   = useState({});
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // ─── DEV ONLY — remove before production ────────────────
  const fillDummy = () => { setForm(DUMMY_DATA); setErrors({}); setApiError(''); };
  // ─────────────────────────────────────────────────────────

  // ── Fetch Event for Editing ─────────────────────────────
  useEffect(() => {
    const loadEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        const event = data.data;
        setForm({
          title:            event.title || '',
          event_type:       event.event_type || 'Workshop',
          description:      event.description || '',
          speaker_name:     event.speaker_name || '',
          speaker_org:      event.speaker_org || '',
          speaker_image_url:event.speaker_image_url || '',
          speaker_bio:      event.speaker_bio || '',
          event_date:       event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : '',
          start_time:       event.start_time || '',
          duration_minutes: event.duration_minutes != null ? String(event.duration_minutes) : '',
          rsvp_deadline:    event.rsvp_deadline ? new Date(event.rsvp_deadline).toISOString().split('T')[0] : '',
          location_type:    event.location_type || 'online',
          location_url:     event.location_url || '',
          location_address: event.location_address || '',
          capacity:         event.capacity || '',
          member_ticket_cost:     event.member_ticket_cost != null ? String(event.member_ticket_cost) : '',
          non_member_ticket_cost: event.non_member_ticket_cost != null ? String(event.non_member_ticket_cost) : '',
          status:           event.status || 'upcoming',
          video_url:        event.video_url || '',
          gallery:          event.gallery?.length ? event.gallery : [],
          keynotes:         event.keynotes?.length ? event.keynotes : [],
        });
      } catch (err) {
        setApiError('Failed to load event details.');
      } finally {
        setInitialLoad(false);
      }
    };

    const loadGlobalFee = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data.data) {
          setForm(prev => ({
            ...prev,
            member_ticket_cost:     data.data.member_ticket_cost     || '0.00',
            non_member_ticket_cost: data.data.non_member_ticket_cost || '0.00',
          }));
        }
      } catch (err) {
        console.error('Could not fetch global fee', err);
      } finally {
        setInitialLoad(false);
      }
    };

    if (id) {
      loadEvent();
    } else {
      loadGlobalFee();
    }
  }, [id]);

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const endpoint = type === 'resource' ? '/events/upload/resource' : '/events/upload/image';
    const formData = new FormData();
    formData.append('file', file);

    setUploadingMedia(true);
    setApiError('');
    try {
      const { data } = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newUrl = data.data.url;
      if (type === 'speaker_image_url') {
        set('speaker_image_url', newUrl);
      } else {
        set(type, [...form[type], newUrl]);
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to upload file.');
    } finally {
      setUploadingMedia(false);
      e.target.value = ''; // Reset input
    }
  };

  // ── Client-side validation ──────────────────────────────
  const validate = () => {
    const next = {};
    if (!form.title.trim())      next.title      = 'Event title is required.';
    if (!form.event_date)        next.event_date  = 'Event date is required.';
    if (!form.event_type.trim()) next.event_type  = 'Category is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────
  const handlePublish = async (e, asDraft = false) => {
    e.preventDefault();
    if (!asDraft && !validate()) return;

    setLoading(true);
    setApiError('');
    try {
      const payload = {
        title:            form.title.trim() || undefined,
        event_type:       form.event_type,
        description:      form.description.trim() || undefined,
        speaker_name:     form.speaker_name.trim() || undefined,
        speaker_org:      form.speaker_org.trim() || undefined,
        speaker_image_url:form.speaker_image_url.trim() || undefined,
        speaker_bio:      form.speaker_bio.trim() || undefined,
        event_date:       form.event_date || undefined,
        location_type:    form.location_type,
        location_url:     ['online', 'hybrid'].includes(form.location_type) ? form.location_url.trim() : undefined,
        location_address: ['physical', 'hybrid'].includes(form.location_type) ? form.location_address.trim() : undefined,
        capacity:         form.capacity ? parseInt(form.capacity, 10) : 0,
        member_ticket_cost:     form.member_ticket_cost ? parseFloat(form.member_ticket_cost) : 0.00,
        non_member_ticket_cost: form.non_member_ticket_cost ? parseFloat(form.non_member_ticket_cost) : 0.00,
        status:           asDraft ? 'draft' : (form.status === 'draft' ? 'upcoming' : form.status),
        rsvp_deadline:    form.rsvp_deadline || undefined,
        duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes, 10) : undefined,
        video_url:        form.video_url.trim() || undefined,
        gallery:          form.gallery.filter(g => g.trim()),
        keynotes:         form.keynotes.filter(k => k.trim()),
      };

      if (id) {
        await api.put(`/events/${id}`, payload);
      } else {
        await api.post('/events', payload);
      }
      setSuccess(true);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────
  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm max-w-md w-full text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9 text-teal-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Event {id ? 'Updated' : 'Published'}!</h2>
          <p className="text-slate-500 text-sm mb-8">Your event has been {id ? 'updated successfully' : 'scheduled and is now visible to members'}.</p>
          <div className="flex gap-3">
            <button
              onClick={() => { setSuccess(false); setForm(INITIAL); }}
              className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              New Event
            </button>
            <button
              onClick={() => navigate(window.location.pathname.startsWith('/admin') ? '/admin/events' : '/dashboard/manage-events')}
              className="flex-1 py-3 bg-teal-600 rounded-xl text-sm font-bold text-white hover:bg-teal-500 transition-all"
            >
              Manage Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (initialLoad) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center gap-4 sticky top-0 z-20">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-black text-slate-900">{id ? 'Edit Event' : 'Schedule New Event'}</h1>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
            {id ? 'Editing as' : 'Scheduling as'} <span className="text-teal-600">{user?.email}</span>
          </p>
        </div>
        {/* ── DEV ONLY: remove before production ── */}
        <button
          type="button"
          onClick={fillDummy}
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all"
          title="DEV ONLY — fills all fields with test data"
        >
          🧪 Fill Dummy Data
        </button>
        {/* ─────────────────────────────────────── */}
      </header>

      <div className="max-w-5xl mx-auto w-full px-8 py-10">
        {/* API error */}
        {apiError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">
            {apiError}
          </div>
        )}

        <form onSubmit={handlePublish} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: main fields ─────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Primary Info */}
            <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <Type className="w-4 h-4 text-teal-500" /> Primary Information
              </h2>
              <div className="space-y-5">

                {/* Title */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                    Event Title *
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="e.g., Q3 Technical Luncheon"
                    className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-300 ${errors.title ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'}`}
                  />
                  {errors.title && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.title}</p>}
                </div>

                {/* Category + Capacity + Ticket Cost */}
                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                      Category *
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={form.event_type}
                        onChange={(e) => set('event_type', e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none"
                      >
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.capacity}
                      onChange={(e) => set('capacity', e.target.value)}
                      placeholder="0 = Unlimited"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                      Member Ticket Cost ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={form.member_ticket_cost}
                      onChange={(e) => set('member_ticket_cost', e.target.value)}
                      placeholder="0.00 = Free"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                      Non-Member Ticket Cost ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={form.non_member_ticket_cost}
                      onChange={(e) => set('non_member_ticket_cost', e.target.value)}
                      placeholder="0.00 = Free"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                {/* Abstract */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                    Abstract
                  </label>
                  <textarea
                    rows={5}
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder="Provide a detailed agenda or abstract..."
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-300 resize-none"
                  />
                </div>

                {/* Speaker Info */}
                <div className="grid grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                      Speaker Name
                    </label>
                    <input
                      value={form.speaker_name}
                      onChange={(e) => set('speaker_name', e.target.value)}
                      placeholder="e.g., Dr. Jane Doe"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                      Speaker Organization
                    </label>
                    <input
                      value={form.speaker_org}
                      onChange={(e) => set('speaker_org', e.target.value)}
                      placeholder="e.g., Tulsa University"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                    Speaker Profile Image
                  </label>
                  <div className="flex gap-4 items-center">
                    {form.speaker_image_url && (
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 flex-shrink-0">
                        <img src={form.speaker_image_url} alt="Speaker" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input
                      value={form.speaker_image_url}
                      onChange={(e) => set('speaker_image_url', e.target.value)}
                      placeholder="Image URL or upload..."
                      className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-300"
                    />
                    <label className="flex-shrink-0 btn-outline-teal px-4 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest cursor-pointer flex items-center gap-2">
                      <UploadCloud className="w-4 h-4" />
                      Upload
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'speaker_image_url')} 
                        className="hidden" 
                        disabled={uploadingMedia}
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 mt-5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                    Speaker Bio / Description
                  </label>
                  <textarea
                    rows={4}
                    value={form.speaker_bio}
                    onChange={(e) => set('speaker_bio', e.target.value)}
                    placeholder="Provide a brief background or bio for the speaker..."
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-300 resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" /> Location &amp; Access
              </h2>
              <div className="space-y-5">
                {/* Toggle */}
                <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
                  {(['online', 'physical', 'hybrid']).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set('location_type', t)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.location_type === t ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {t === 'online' && <Monitor className="w-3.5 h-3.5" />}
                      {t === 'physical' && <MapPin className="w-3.5 h-3.5" />}
                      {t === 'hybrid' && <div className="flex -space-x-1"><Monitor className="w-3.5 h-3.5 z-10 bg-slate-900 rounded-full" /><MapPin className="w-3.5 h-3.5" /></div>}
                      {t === 'online' ? 'Online' : t === 'physical' ? 'In Person' : 'Hybrid'}
                    </button>
                  ))}
                </div>
                <div className="space-y-4">
                  {['online', 'hybrid'].includes(form.location_type) && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                        Meeting URL
                      </label>
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          value={form.location_url}
                          onChange={(e) => set('location_url', e.target.value)}
                          placeholder="https://zoom.us/j/..."
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                  )}
                  
                  {['physical', 'hybrid'].includes(form.location_type) && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                        Venue Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          value={form.location_address}
                          onChange={(e) => set('location_address', e.target.value)}
                          placeholder="Enter in-person address"
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Post-Event Media */}
            {(() => {
              const isPastEvent = form.status === 'past' || (form.event_date && new Date(form.event_date) < new Date(new Date().setHours(0,0,0,0)));
              if (!isPastEvent) return null;
              
              return (
                <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-purple-500" /> Post-Event Media & Resources
                  </h2>
                  <div className="space-y-5">
                    
                    {/* Video URL */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                        Video Recording URL (YouTube/Vimeo)
                      </label>
                      <div className="relative">
                        <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          value={form.video_url}
                          onChange={(e) => set('video_url', e.target.value)}
                          placeholder="https://youtube.com/watch?v=..."
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    {/* Gallery */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                        Gallery Images
                      </label>
                      <div className="space-y-3">
                        {form.gallery.map((url, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <a href={url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-teal-600 truncate hover:underline max-w-[80%]">
                              {url.split('/').pop()}
                            </a>
                            <button type="button" onClick={() => set('gallery', form.gallery.filter((_, idx) => idx !== i))} className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <div>
                          <input
                            type="file"
                            id="gallery-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'gallery')}
                            disabled={uploadingMedia}
                          />
                          <label
                            htmlFor="gallery-upload"
                            className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-dashed border-slate-200 text-slate-500 hover:border-teal-500 hover:text-teal-600 transition-colors ${uploadingMedia ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            {uploadingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                            Upload Image
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Keynotes / Resources */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                        Resources & Presentations
                      </label>
                      <div className="space-y-3">
                        {form.keynotes.map((url, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <a href={url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-teal-600 truncate hover:underline max-w-[80%]">
                              {url.split('/').pop()}
                            </a>
                            <button type="button" onClick={() => set('keynotes', form.keynotes.filter((_, idx) => idx !== i))} className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <div>
                          <input
                            type="file"
                            id="resource-upload"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,text/*"
                            onChange={(e) => handleFileUpload(e, 'keynotes')}
                            disabled={uploadingMedia}
                          />
                          <label
                            htmlFor="resource-upload"
                            className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-dashed border-slate-200 text-slate-500 hover:border-purple-500 hover:text-purple-600 transition-colors ${uploadingMedia ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            {uploadingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                            Upload Resource
                          </label>
                        </div>
                      </div>
                    </div>

                  </div>
                </section>
              );
            })()}
          </div>

          {/* ── Right: timeline + actions ─────────────────── */}
          <div className="space-y-6">

            {/* Timeline */}
            <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> Timeline
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={form.event_date}
                    onChange={(e) => set('event_date', e.target.value)}
                    className={`w-full px-5 py-3.5 bg-slate-50 border rounded-xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 transition-all ${errors.event_date ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-amber-500/20 focus:border-amber-500'}`}
                  />
                  {errors.event_date && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.event_date}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => set('start_time', e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1.5">
                    Duration
                  </label>
                  {/* Quick presets */}
                  <div className="flex gap-2 mb-2">
                    {[30, 60, 90, 120].map(min => (
                      <button
                        key={min}
                        type="button"
                        onClick={() => set('duration_minutes', String(min))}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                          form.duration_minutes === String(min)
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-amber-400 hover:text-amber-600'
                        }`}
                      >
                        {min < 60 ? `${min}m` : `${min / 60}h`}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={1440}
                      value={form.duration_minutes}
                      onChange={(e) => set('duration_minutes', e.target.value)}
                      placeholder="Minutes (e.g. 90)"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                    {form.duration_minutes && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {Math.floor(Number(form.duration_minutes) / 60) > 0
                          ? `${Math.floor(Number(form.duration_minutes) / 60)}h ${Number(form.duration_minutes) % 60}m`
                          : `${form.duration_minutes}m`
                        }
                      </span>
                    )}
                  </div>
                  {form.start_time && form.duration_minutes && (() => {
                    const [h, m] = form.start_time.split(':').map(Number);
                    const total = h * 60 + m + Number(form.duration_minutes);
                    const endH = String(Math.floor(total / 60) % 24).padStart(2, '0');
                    const endM = String(total % 60).padStart(2, '0');
                    return (
                      <p className="mt-1.5 text-[10px] text-teal-600 font-bold uppercase tracking-widest">
                        Ends at {endH}:{endM}
                      </p>
                    );
                  })()}
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <label className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1 block mb-1.5">
                    RSVP Deadline
                  </label>
                  <input
                    type="date"
                    value={form.rsvp_deadline}
                    onChange={(e) => set('rsvp_deadline', e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                  <p className="mt-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Members cannot RSVP after this date.
                  </p>
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-slate-900/20 hover:bg-teal-600 transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {id && form.status !== 'draft' ? 'Update Event' : 'Publish Event'}
                    <Check className="w-4 h-4 group-hover:scale-125 transition-transform" />
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={(e) => handlePublish(e, true)}
                className="w-full py-4 border-2 border-slate-200 text-slate-700 rounded-2xl font-black text-sm uppercase tracking-[0.15em] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
              >
                Save Draft
                <Save className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
