import { useState, useEffect } from 'react';
import {
  Calendar, MapPin, Clock, Users, ArrowRight,
  ChevronRight, Tag, Monitor, Loader2, CalendarX
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

// Cycle through a palette based on index
const PALETTE = [
  { badge: 'bg-teal-100 text-teal-700', border: 'border-teal-500' },
  { badge: 'bg-blue-100 text-blue-700', border: 'border-blue-400' },
  { badge: 'bg-purple-100 text-purple-700', border: 'border-purple-400' },
  { badge: 'bg-amber-100 text-amber-700', border: 'border-amber-400' },
];

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatTime(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = ((h % 12) || 12);
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

function EventCard({ event, index }) {
  const colors = PALETTE[index % PALETTE.length];
  const eventDate = formatDate(event.event_date);
  const startTime = formatTime(event.start_time);

  return (
    <div className={`event-card bg-white rounded-2xl overflow-hidden border-t-4 ${colors.border} shadow-sm hover:shadow-xl flex flex-col`}>
      {event.featured ? (
        <div className="bg-teal-500 text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5">
          ★ Featured Event
        </div>
      ) : null}

      <div className="p-6 flex flex-col flex-1">
        {/* Type & Location type */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colors.badge}`}>
            {event.event_type || 'Event'}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400 capitalize">
            {event.location_type === 'online' ? (
              <Monitor className="w-3 h-3" />
            ) : (
              <MapPin className="w-3 h-3" />
            )}
            {event.location_type || 'TBD'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-slate-900 font-bold text-base leading-snug mb-3 line-clamp-3">
          {event.title}
        </h3>

        {/* Speaker */}
        {event.speaker_name && (
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {event.speaker_image_url ? (
                <img src={event.speaker_image_url} alt={event.speaker_name} className="w-full h-full object-cover" />
              ) : (
                <Users className="w-3.5 h-3.5 text-slate-500" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">{event.speaker_name}</p>
              {event.speaker_org && <p className="text-xs text-slate-400">{event.speaker_org}</p>}
            </div>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 mb-5 mt-auto">
          {eventDate && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-teal-500 shrink-0" />
              <span className="font-medium">{eventDate}</span>
            </div>
          )}
          {startTime && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4 text-teal-500 shrink-0" />
              <span>{startTime}</span>
            </div>
          )}
          {(event.location_name || event.location_address) && (
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <div>
                {event.location_name && <p className="font-medium">{event.location_name}</p>}
                {event.location_address && <p className="text-xs text-slate-400">{event.location_address}</p>}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          to={`/events/${event.id}`}
          className="btn-teal w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
        >
          View Details <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border-t-4 border-slate-200 shadow-sm animate-pulse">
      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <div className="h-5 bg-slate-200 rounded-full w-28" />
          <div className="h-5 bg-slate-200 rounded-full w-16" />
        </div>
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-5/6" />
        <div className="space-y-2 pt-2">
          <div className="h-3 bg-slate-200 rounded w-1/2" />
          <div className="h-3 bg-slate-200 rounded w-1/3" />
        </div>
        <div className="h-10 bg-slate-200 rounded-xl w-full mt-4" />
      </div>
    </div>
  );
}

export default function NewsAndEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get('/events', {
          params: { status: 'upcoming', limit: 4, sort: 'event_date', order: 'asc' },
        });
        setEvents(data.data || []);
      } catch (err) {
        console.error('Failed to fetch events for homepage', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <section id="news-events" className="py-24 bg-slate-50 seismic-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div>
            <p className="text-teal-600 text-sm font-semibold tracking-widest uppercase mb-2">
              Stay Connected
            </p>
            <h2 className="text-4xl font-black text-slate-900 section-heading">Upcoming Events</h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-teal-500 text-teal-600 font-semibold text-sm hover:bg-teal-500 hover:text-white transition-all duration-200 self-start sm:self-auto"
          >
            View All Events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <CalendarX className="w-14 h-14 mb-4 opacity-30" />
            <p className="text-lg font-bold mb-1">No Upcoming Events</p>
            <p className="text-sm">Check back soon — new events are added regularly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-fade-in">
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
