import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Users, Tag, Search,
  Filter, ChevronRight, ExternalLink, Loader2
} from 'lucide-react';
import api from '../../api';

const categories = ['All', 'Workshop', 'Technical Luncheon', 'Annual Meeting', 'Social Gathering', 'Field Trip', 'Webinar', 'Other'];
const statuses = ['All', 'Upcoming', 'Past'];

const colorMap = {
  teal: { badge: 'bg-teal-100 text-teal-700', border: 'border-teal-500', dot: 'bg-teal-500' },
  blue: { badge: 'bg-blue-100 text-blue-700', border: 'border-blue-500', dot: 'bg-blue-500' },
  green: { badge: 'bg-green-100 text-green-700', border: 'border-green-500', dot: 'bg-green-500' },
  purple: { badge: 'bg-purple-100 text-purple-700', border: 'border-purple-500', dot: 'bg-purple-500' },
};

function formatEventTime(timeStr) {
  if (!timeStr) return null;
  const parts = String(timeStr).split(':');
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0], 10);
  const m = parts[1];
  if (isNaN(h)) return timeStr;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = ((h % 12) || 12);
  return `${hour}:${m} ${period}`;
}

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const statusParam = searchParams.get('status');
  const activeStatus = statusParam ? statusParam.charAt(0).toUpperCase() + statusParam.slice(1) : 'All';

  const setActiveStatus = (status) => {
    if (status === 'All') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status.toLowerCase());
    }
    setSearchParams(searchParams);
  };
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/events?limit=100');
        setEvents((data.data || []).filter(e => e.status !== 'draft'));
      } catch (err) {
        console.error('Failed to load events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = events
    .filter((e) => {
      const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.category && e.category.toLowerCase().includes(search.toLowerCase())) ||
        (e.speaker_name && e.speaker_name.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = activeCategory === 'All' || e.event_type === activeCategory || e.category === activeCategory;
      const matchStatus = activeStatus === 'All' || (activeStatus === 'Upcoming' && e.status === 'upcoming') || (activeStatus === 'Past' && e.status === 'past');
      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
      if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
      if (a.status === 'upcoming') return new Date(a.event_date) - new Date(b.event_date);
      return new Date(b.event_date) - new Date(a.event_date);
    });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* ── Page Hero ── */}
      <div className="bg-slate-900 pt-28 pb-14 relative overflow-hidden">
        <div className="absolute inset-0 seismic-pattern opacity-20" />
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-teal-400 text-xs font-bold tracking-widest uppercase mb-2">Events &amp; Programs</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3">Society Events &amp; Workshops</h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
            Explore upcoming technical talks, networking luncheons, and industry workshops hosted by the Geophysical Society of Tulsa.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, topic, or speaker..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeStatus === status
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Event List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500 mb-3" />
            <p className="text-slate-400 font-medium text-sm">Loading events...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg font-medium">No events found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((event) => {
              const colors = colorMap[event.color] || colorMap.teal;
              const formattedDate = event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD';
              const startTimeFormatted = formatEventTime(event.start_time);
              const endTimeFormatted = formatEventTime(event.end_time);
              const formattedTime = startTimeFormatted
                ? `${startTimeFormatted}${endTimeFormatted ? ` – ${endTimeFormatted}` : ''}`
                : 'TBD';
              const locationDisplay = event.location_name || (event.location_type === 'online' ? 'Online' : (event.location_address || (event.location_type === 'hybrid' ? 'Hybrid (In Person & Online)' : 'In Person')));
              
              return (
                <div
                  key={event.id}
                  className={`event-card bg-white rounded-2xl overflow-hidden border-t-4 ${colors.border} shadow-sm hover:shadow-xl flex flex-col`}
                >
                  {event.featured === 1 && (
                    <div className="bg-teal-500 text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5">
                      ★ Featured Event
                    </div>
                  )}
                  {event.status === 'past' && (
                    <div className="bg-slate-100 text-slate-500 text-xs font-bold tracking-widest uppercase px-4 py-1.5">
                      Past Event
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colors.badge}`}>{event.event_type}</span>
                      {event.category && <span className="flex items-center gap-1 text-xs text-slate-400"><Tag className="w-3 h-3" />{event.category}</span>}
                    </div>
                    <h3 className="text-slate-900 font-bold text-base leading-snug mb-3 line-clamp-3">{event.title}</h3>
                    {event.speaker_name && (
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{event.speaker_name}</p>
                          <p className="text-xs text-slate-400">{event.speaker_org}</p>
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2 flex-1">{event.description}</p>
                    <div className="space-y-2 mb-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-teal-500 shrink-0" />
                        <span className="font-medium">{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-teal-500 shrink-0" />
                        <span>{formattedTime}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">{locationDisplay}</p>
                          {event.location_address && event.location_name && (
                            <p className="text-xs text-slate-400">{event.location_address}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/events/${event.id}`}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-teal-600 border border-teal-500 hover:bg-teal-500 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        View Details <ChevronRight className="w-4 h-4" />
                      </Link>
                      {event.status === 'upcoming' && (
                        <Link
                          to={`/events/${event.id}/register`}
                          className="btn-teal px-4 py-3 rounded-xl text-sm font-semibold text-white flex items-center gap-1"
                        >
                          <span className="flex items-center gap-1">Register <ExternalLink className="w-3.5 h-3.5" /></span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
