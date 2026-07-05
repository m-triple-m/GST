import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Edit3, Loader2,
  Tag, Plus, AlertCircle, Trash2
} from 'lucide-react';
import api from '../../api';

export default function ManageEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Fetch events regardless of status for management
      const { data } = await api.get('/events?limit=50');
      setEvents(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft': return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-lg">Draft</span>;
      case 'upcoming': return <span className="px-2.5 py-1 bg-teal-100 text-teal-700 text-[10px] font-black uppercase tracking-widest rounded-lg">Upcoming</span>;
      case 'past': return <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-lg">Past</span>;
      case 'cancelled': return <span className="px-2.5 py-1 bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-widest rounded-lg">Cancelled</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
      <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Events</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">View and edit your events and drafts</p>
        </div>
        <Link to="/dashboard/events/new" className="btn-teal px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Schedule Event
        </Link>
      </header>

      <main className="p-8 max-w-6xl mx-auto w-full">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {events.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-900 mb-2">No Events Found</h3>
              <p className="text-slate-500 text-sm mb-6">You haven't scheduled any events yet.</p>
              <Link to="/dashboard/events/new" className="btn-teal inline-flex px-5 py-2.5 rounded-xl text-white text-xs font-bold items-center gap-2">
                <Plus className="w-4 h-4" /> Schedule Your First Event
              </Link>
            </div>
          ) : (
            events.map(event => {
              const isPastEvent = (event.status || '').toLowerCase() === 'past';
              return (
                <div key={event.id} className={`rounded-2xl border p-6 flex flex-col md:flex-row gap-6 items-center shadow-sm transition-all duration-200 ${
                  isPastEvent
                    ? 'bg-slate-50/70 border-slate-200/60 opacity-60'
                    : 'bg-white border-slate-200 hover:shadow-md'
                }`}>

                  {/* Date Square */}
                  <div className={`w-24 h-24 rounded-2xl border flex flex-col items-center justify-center shrink-0 ${
                    isPastEvent ? 'bg-slate-100 border-slate-200/80' : 'bg-slate-50 border-slate-100'
                  }`}>
                    {event.event_date ? (
                      <>
                        <span className={`text-2xl font-black ${isPastEvent ? 'text-slate-400' : 'text-slate-900'}`}>{new Date(event.event_date).getDate()}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(event.event_date).toLocaleString('default', { month: 'short' })}</span>
                      </>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">TBD</span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(event.status)}
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <Tag className="w-3.5 h-3.5" />
                      {event.event_type || 'Uncategorized'}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900">{event.title || 'Untitled Draft'}</h2>
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {event.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.location_type === 'online' ? 'Online Meeting' : event.location}
                      </span>
                    )}
                    {event.start_time && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {event.start_time}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                  <Link
                    to={`/dashboard/events/${event.id}/edit`}
                    className="flex-1 md:flex-none px-4 py-2 bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
          )}
        </div>
      </main>
    </div>
  );
}
