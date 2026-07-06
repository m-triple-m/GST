import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Users, ArrowLeft,
  ExternalLink, Share2, Download, ChevronRight, Tag, Info,
  PlayCircle, Image as ImageIcon, CheckCircle2,
  ChevronLeft, Loader2, X, ShoppingCart, CheckCircle
} from 'lucide-react';
import api from '../../api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [attendeeType, setAttendeeType] = useState('member');
  const [isRegistered, setIsRegistered] = useState(false);
  const { addToCart, items } = useCart();
  const { isAuthenticated } = useAuth();
  const [globalSettings, setGlobalSettings] = useState({});

  // Check if this event is already in the cart
  const inCart = items.some(i => i.eventId === Number(id));

  const isYouTube = (url) => url?.includes('youtube.com') || url?.includes('youtu.be');

  // Convert youtube URL to embed if needed (basic check)
  const getEmbedUrl = (url) => {
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        // Fetch event and global settings in parallel
        const [eventRes, settingsRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get('/settings').catch(() => ({ data: { data: {} } })),
        ]);
        setEvent(eventRes.data.data);
        setGlobalSettings(settingsRes.data.data || {});

        // Fetch related events
        try {
          const relatedData = await api.get(`/events?limit=4`);
          setRelated((relatedData.data.data || []).filter(e => e.id !== Number(id) && e.status !== 'draft').slice(0, 2));
        } catch (err) {
          // Ignore related events error
        }

        // If authenticated, check if already registered
        if (isAuthenticated) {
          try {
            const myEventsData = await api.get('/members/me/events');
            const myEvents = myEventsData.data.data || [];
            if (myEvents.some(e => e.event_id === Number(id))) {
              setIsRegistered(true);
            }
          } catch (err) {
            // Ignore if checking registrations fails
          }
        }

      } catch (err) {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center px-4">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
        <p className="text-slate-400">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center px-4">
        <Calendar className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Event Not Found</h2>
        <p className="text-slate-400 mb-6">This event doesn't exist or may have been removed.</p>
        <Link to="/events" className="btn-teal px-6 py-3 rounded-xl text-white font-semibold text-sm">
          <span>Back to Events</span>
        </Link>
      </div>
    );
  }

  const agenda = event.event_type === 'Technical Luncheon'
    ? [
        { time: '11:30 AM', item: 'Registration & Networking' },
        { time: '12:00 PM', item: 'Lunch Served' },
        { time: '12:15 PM', item: 'GST Announcements & Updates' },
        { time: '12:30 PM', item: 'Technical Presentation' },
        { time: '1:00 PM', item: 'Q&A Session' },
        { time: '1:15 PM', item: 'Adjourn' },
      ]
    : [
        { time: '7:00 AM', item: 'Shotgun Start — Registration & Check-In' },
        { time: '7:30 AM', item: 'Welcome & Sponsor Recognition' },
        { time: '8:00 AM', item: 'Tournament Begins' },
        { time: '1:00 PM', item: 'Lunch & Awards Ceremony' },
        { time: '2:30 PM', item: 'Scholarship Presentation' },
        { time: '3:00 PM', item: 'Closing Remarks' },
      ];

  const nextImage = () => {
    if (event.gallery && event.gallery.length) {
      setActiveImage((prev) => (prev + 1) % event.gallery.length);
    }
  };

  const prevImage = () => {
    if (event.gallery && event.gallery.length) {
      setActiveImage((prev) => (prev - 1 + event.gallery.length) % event.gallery.length);
    }
  };

  const formattedDate = event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD';
  const formattedTime = event.start_time ? `${event.start_time} ${event.end_time ? `– ${event.end_time}` : ''}` : 'TBD';
  const locName = event.location_name || (event.location_type === 'online' ? 'Online' : event.location_type === 'hybrid' ? 'Hybrid (In Person & Online)' : 'In Person');

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Hero banner */}
      <div className="bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 seismic-pattern opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/events" className="hover:text-teal-400 transition-colors">Events</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-300 truncate max-w-xs">{event.title}</span>
          </div>

          <div className="flex flex-wrap items-start gap-3 mb-5">
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
              {event.event_type}
            </span>
            {event.category && (
              <span className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                <Tag className="w-3 h-3" />{event.category}
              </span>
            )}
            {event.status === 'past' && (
              <span className="px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-xs font-semibold">Past Event</span>
            )}
            {event.featured === 1 && (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">★ Featured</span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6 max-w-4xl">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-6 text-sm text-slate-300">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-teal-400" />{formattedDate}</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-teal-400" />{formattedTime}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-teal-400" />{locName}</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Back btn */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Events
            </button>

            {/* Video Recording (Conditional) */}
            {event.status === 'past' && event.video_url && (
              <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-fade-in-up">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-teal-500" />
                    <span className="text-sm font-bold text-white">Event Recording</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 py-1 bg-white/5 rounded">4K Quality</span>
                </div>
                <div className="aspect-video w-full bg-black relative group flex items-center justify-center">
                  {isYouTube(event.video_url) ? (
                    <iframe
                      className="w-full h-full"
                      src={getEmbedUrl(event.video_url)}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <>
                      {/* Generic Thumbnail / Placeholder for direct video */}
                      {event.gallery?.length ? (
                        <img src={event.gallery[0]} alt="Video Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                      )}
                      
                      <button 
                        onClick={() => setIsVideoModalOpen(true)}
                        className="relative z-10 w-20 h-20 rounded-full bg-teal-500/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform hover:bg-teal-400"
                      >
                        <PlayCircle className="w-10 h-10 ml-1" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Image Gallery / Carousel (Conditional) */}
            {event.status === 'past' && event.gallery && event.gallery.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-teal-500" />
                  Event Gallery
                </h2>
                <div className="relative group">
                  <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={event.gallery[activeImage]}
                      alt={`Event photo ${activeImage + 1}`}
                      className="w-full h-full object-cover transition-all duration-500"
                    />
                  </div>
                  
                  {/* Controls */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-teal-500"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-teal-500"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Indicators */}
                  <div className="flex justify-center gap-2 mt-4">
                    {event.gallery.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === activeImage ? 'bg-teal-500 w-6' : 'bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Overview / Detailed Summary */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-teal-500" />
                {event.status === 'past' ? 'Technical Summary' : 'Abstract'}
              </h2>
              <p className="text-slate-600 leading-relaxed text-base">
                {event.status === 'past' && event.detailed_summary ? event.detailed_summary : event.description}
              </p>
              {event.event_type === 'Technical Luncheon' && event.status !== 'past' && (
                <p className="text-slate-600 leading-relaxed mt-4">
                  The Geophysical Society of Tulsa hosts monthly technical luncheons during the season 
                  (September through May). These events bring together geophysicists, geologists, engineers, 
                  and students from across the Tulsa area for expert presentations on cutting-edge topics 
                  in exploration and production geophysics.
                </p>
              )}
            </div>

            {/* Important Keynotes (Conditional) */}
            {event.status === 'past' && event.keynotes && event.keynotes.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-500" />
                  Important Keynotes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.keynotes.map((note, i) => (
                     <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-teal-700">{i + 1}</span>
                      </div>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Speaker (if exists) */}
            {event.speaker_name && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Featured Speaker</h2>
                <div className="flex items-start gap-5">
                  {event.speaker_image_url ? (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-slate-100">
                      <img src={event.speaker_image_url} alt={event.speaker_name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shrink-0 shadow-lg">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{event.speaker_name}</h3>
                    <p className="text-teal-600 font-medium text-sm mb-3">{event.speaker_org}</p>
                    {event.speaker_bio ? (
                      <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap">
                        {event.speaker_bio}
                      </p>
                    ) : (
                      <p className="text-slate-500 text-sm leading-relaxed">
                        Speaker biography and professional background will be provided closer to the event date.
                        Please check back or subscribe to our newsletter for updates.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Agenda */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-500" />
                Event Agenda
              </h2>
              <div className="relative">
                <div className="absolute left-[4.5rem] top-0 bottom-0 w-px bg-gradient-to-b from-teal-500 to-slate-200" />
                <div className="space-y-5">
                  {agenda.map(({ time, item }, i) => (
                    <div key={i} className="flex items-start gap-5">
                      <div className="w-16 text-right text-xs font-bold text-teal-600 pt-1 shrink-0">{time}</div>
                      <div className="relative flex items-start gap-4 pl-6">
                        <div className="absolute -left-2.5 w-5 h-5 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center shadow">
                          <div className="w-2 h-2 rounded-full bg-teal-500" />
                        </div>
                        <p className="text-slate-700 text-sm font-medium">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-500" />
                Location
              </h2>
              <p className="font-bold text-slate-800">{locName}</p>
              {event.location_address && <p className="text-slate-500 text-sm mt-1 mb-5">{event.location_address}</p>}
              
              {event.location_type !== 'online' && event.location_address && (
                <div className="h-48 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-2">
                  <MapPin className="w-8 h-8 text-teal-500" />
                  <p className="text-sm text-slate-500 font-medium">{locName}</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(event.location_address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-teal-600 hover:underline flex items-center gap-1"
                  >
                    Get Directions <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <h3 className="font-bold text-slate-800 text-lg mb-5">Event Details</h3>
              <div className="space-y-4 mb-6">
                {[
                  { icon: Calendar, label: 'Date', value: formattedDate },
                  { icon: Clock, label: 'Time', value: formattedTime },
                  { icon: MapPin, label: 'Venue', value: locName },
                  { icon: Tag, label: 'Category', value: event.category || 'General' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">{label}</p>
                      <p className="text-sm text-slate-700 font-semibold">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {event.status === 'upcoming' ? (
                <>
                  {isRegistered ? (
                    <div className="w-full py-4 rounded-xl font-bold text-center text-sm bg-teal-50 text-teal-700 border border-teal-200 mb-3 flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-teal-500" /> 
                        <span>You are registered for this event</span>
                      </div>
                      <Link to="/dashboard" className="text-xs text-teal-600 hover:text-teal-700 hover:underline">
                        View in Dashboard
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* Attendee Type Selector */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {['member', 'guest'].map(type => (
                          <button
                            key={type}
                            onClick={() => setAttendeeType(type)}
                            className={`py-2.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all ${
                              attendeeType === type
                                ? 'border-teal-500 bg-teal-50 text-teal-700'
                                : 'border-slate-100 text-slate-400 hover:border-slate-200'
                            }`}
                          >
                          {type === 'member'
                              ? `Member · $${(Number(event.member_ticket_cost) || Number(globalSettings.member_ticket_cost) || Number(event.ticket_cost) || 0).toFixed(2)}`
                              : `Guest · $${(Number(event.non_member_ticket_cost) || Number(globalSettings.non_member_ticket_cost) || Number(event.ticket_cost) || 0).toFixed(2)}`}
                          </button>
                        ))}
                      </div>

                      {inCart || addedToCart ? (
                        <>
                          <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm mb-3 bg-teal-50 text-teal-700 border-2 border-teal-300">
                            <CheckCircle className="w-4 h-4" /> Added to Cart
                          </div>
                          <Link
                            to="/cart"
                            className="btn-teal w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm mb-3"
                          >
                            <ShoppingCart className="w-4 h-4" /> View Cart
                          </Link>
                        </>
                      ) : (
                        isAuthenticated ? (
                          <button
                            onClick={() => { addToCart(event, attendeeType, 1); setAddedToCart(true); }}
                            className="btn-teal w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm mb-3"
                          >
                            <ShoppingCart className="w-4 h-4" /> Add to Cart
                          </button>
                        ) : (
                          <Link
                            to="/login"
                            className="btn-teal w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm mb-3"
                          >
                            Login to Register
                          </Link>
                        )
                      )}
                    </>
                  )}

                  <button className="w-full py-3 rounded-xl font-semibold text-sm border border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600 transition-all duration-200 flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" /> Share Event
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="w-full py-3.5 rounded-xl font-bold text-center text-sm bg-slate-100 text-slate-400 border border-slate-200">
                    Event Has Passed
                  </div>
                  <Link
                    to="/resources"
                    className="w-full py-3 rounded-xl font-semibold text-sm border border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> View Resources
                  </Link>
                </div>
              )}

              {/* Membership CTA */}
              <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-100">
                <p className="text-xs font-bold text-teal-700 mb-1">GST Member Discount</p>
                <p className="text-xs text-teal-600 mb-3">Members receive discounted luncheon pricing and priority registration.</p>
                <Link to="/membership" className="text-xs font-bold text-teal-700 hover:text-teal-600 flex items-center gap-1">
                  Join GST <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related events */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Other Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {related.map((e) => {
                const eDate = e.event_date ? new Date(e.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD';
                return (
                  <Link
                    key={e.id}
                    to={`/events/${e.id}`}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all duration-200 group"
                  >
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">{e.event_type}</span>
                    <h3 className="font-bold text-slate-800 mt-3 mb-2 group-hover:text-teal-700 transition-colors line-clamp-2">{e.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-teal-500" />{eDate}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Video Modal for local videos */}
      {isVideoModalOpen && !isYouTube(event.video_url) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-rose-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <video 
              src={event.video_url} 
              controls 
              autoPlay 
              className="w-full aspect-video outline-none"
            />
          </div>
        </div>
      )}

    </div>
  );
}
