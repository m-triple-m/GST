import { useState } from 'react';
import {
  Calendar, MapPin, Clock, Users, ArrowRight,
  Newspaper, ChevronRight, Tag, ExternalLink
} from 'lucide-react';

const events = [
  {
    id: 1,
    type: 'Technical Luncheon',
    title: 'Putting Seismic Within Reach for Small Operators: Economical, Small-Crew Seismic Acquisition in 2026',
    speaker: 'TBA',
    speakerOrg: 'TBA',
    date: 'May 14, 2026',
    time: '11:30 AM – 1:00 PM',
    location: "Baxter's Interurban Grill",
    address: '717 S Houston Ave, Tulsa, OK',
    category: 'Seismic Acquisition',
    featured: true,
    registerUrl: 'https://gst.wildapricot.org/event-6637550',
    description: 'Join us for our May technical luncheon featuring a presentation on modern economical seismic acquisition techniques tailored for smaller operators in today\'s market.',
    color: 'teal',
  },
  {
    id: 2,
    type: 'Technical Luncheon',
    title: 'Machine Learning Applications in Subsurface Characterization and Formation Evaluation',
    speaker: 'Dr. Sarah Chen',
    speakerOrg: 'University of Tulsa',
    date: 'June 11, 2026',
    time: '11:30 AM – 1:00 PM',
    location: "Baxter's Interurban Grill",
    address: '717 S Houston Ave, Tulsa, OK',
    category: 'ML & AI',
    featured: false,
    registerUrl: '#',
    description: 'An in-depth exploration of how machine learning models are transforming interpretation workflows in exploration geophysics.',
    color: 'blue',
  },
  {
    id: 3,
    type: 'Annual Golf Tournament',
    title: 'GST Annual Charity Golf Tournament & Scholarship Fundraiser',
    speaker: null,
    speakerOrg: null,
    date: 'July 19, 2026',
    time: '7:00 AM Shotgun Start',
    location: 'LaFortune Park Golf Course',
    address: '5501 S Yale Ave, Tulsa, OK',
    category: 'Social',
    featured: false,
    registerUrl: '#',
    description: 'Our beloved annual golf tournament supports student scholarships and brings together industry professionals for a day of friendly competition.',
    color: 'green',
  },
  {
    id: 4,
    type: 'Technical Luncheon',
    title: '4D Seismic Monitoring: Tracking Reservoir Fluid Changes Over Production Life',
    speaker: 'James Whitfield',
    speakerOrg: 'ChampionX',
    date: 'August 13, 2026',
    time: '11:30 AM – 1:00 PM',
    location: "Baxter's Interurban Grill",
    address: '717 S Houston Ave, Tulsa, OK',
    category: 'Reservoir Geophysics',
    featured: false,
    registerUrl: '#',
    description: 'Explore real-world case studies showing how time-lapse seismic data informs production decisions and field development strategy.',
    color: 'purple',
  },
];

const news = [
  {
    id: 1,
    tag: 'Announcement',
    title: 'GST Welcomes 2025-2026 Executive Committee',
    date: 'October 1, 2025',
    excerpt: 'The Geophysical Society of Tulsa is proud to announce its new executive committee for the 2025–2026 season. The committee is committed to expanding membership and delivering impactful technical programming.',
    readUrl: '#',
  },
  {
    id: 2,
    tag: 'Scholarship',
    title: '2026 Student Scholarship Applications Now Open',
    date: 'January 15, 2026',
    excerpt: 'GST is accepting applications for its annual student scholarships, open to geoscience students in Oklahoma. Awards range from $500 to $2,000 and recognize academic excellence and community involvement.',
    readUrl: '#',
  },
  {
    id: 3,
    tag: 'Community',
    title: 'Golf Tournament Raises $18,000 for Student Scholarships',
    date: 'August 5, 2025',
    excerpt: 'The 2025 GST Annual Golf Tournament was a tremendous success, raising $18,000 for our student scholarship fund. Thank you to all sponsors, players, and volunteers who made it possible.',
    readUrl: '#',
  },
  {
    id: 4,
    tag: 'SEG News',
    title: 'GST Members Recognized at SEG Annual Meeting',
    date: 'November 10, 2025',
    excerpt: 'Several GST members received recognition at the Society of Exploration Geophysicists Annual Meeting in Houston. Their contributions to applied geophysics continue to represent Tulsa on the global stage.',
    readUrl: '#',
  },
];

const colorMap = {
  teal: { badge: 'bg-teal-100 text-teal-700', border: 'border-teal-500', dot: 'bg-teal-500' },
  blue: { badge: 'bg-blue-100 text-blue-700', border: 'border-blue-400', dot: 'bg-blue-500' },
  green: { badge: 'bg-green-100 text-green-700', border: 'border-green-400', dot: 'bg-green-500' },
  purple: { badge: 'bg-purple-100 text-purple-700', border: 'border-purple-400', dot: 'bg-purple-500' },
};

const tagColors = {
  'Announcement': 'bg-slate-100 text-slate-600',
  'Scholarship': 'bg-amber-100 text-amber-700',
  'Community': 'bg-green-100 text-green-700',
  'SEG News': 'bg-teal-100 text-teal-700',
};

function EventCard({ event, featured }) {
  const colors = colorMap[event.color] || colorMap.teal;

  return (
    <div
      className={`event-card bg-white rounded-2xl overflow-hidden border-t-4 ${colors.border} shadow-sm hover:shadow-xl`}
    >
      {featured && (
        <div className="bg-teal-500 text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5">
          ★ Featured Event
        </div>
      )}
      <div className="p-6">
        {/* Type & Category */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colors.badge}`}>
            {event.type}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Tag className="w-3 h-3" />
            {event.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-slate-900 font-bold text-base leading-snug mb-3 line-clamp-3 group-hover:text-teal-700">
          {event.title}
        </h3>

        {/* Speaker */}
        {event.speaker && (
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">{event.speaker}</p>
              <p className="text-xs text-slate-400">{event.speakerOrg}</p>
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Details */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-teal-500 shrink-0" />
            <span className="font-medium">{event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4 text-teal-500 shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{event.location}</p>
              <p className="text-xs text-slate-400">{event.address}</p>
            </div>
          </div>
        </div>

        {/* Register button */}
        <a
          href={event.registerUrl}
          id={`event-register-${event.id}`}
          target={event.registerUrl !== '#' ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="btn-teal w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
        >
          <span className="flex items-center gap-2">
            {event.registerUrl !== '#' ? (
              <>Register Now <ExternalLink className="w-3.5 h-3.5" /></>
            ) : (
              <>Details Coming Soon <ChevronRight className="w-3.5 h-3.5" /></>
            )}
          </span>
        </a>
      </div>
    </div>
  );
}

function NewsCard({ item }) {
  return (
    <div className="group flex gap-4 p-5 rounded-xl hover:bg-slate-50 transition-colors duration-200 border border-transparent hover:border-slate-200">
      <div className="w-1 rounded-full bg-teal-500 shrink-0 group-hover:bg-teal-400 transition-colors duration-200" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tagColors[item.tag] || 'bg-slate-100 text-slate-600'}`}>
            {item.tag}
          </span>
          <span className="text-xs text-slate-400">{item.date}</span>
        </div>
        <h4 className="text-slate-800 font-semibold text-sm leading-snug mb-1.5 group-hover:text-teal-700 transition-colors duration-200">
          {item.title}
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.excerpt}</p>
        <button className="mt-2 text-xs font-semibold text-teal-600 hover:text-teal-500 flex items-center gap-1 transition-colors duration-200">
          Read more <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default function NewsAndEvents() {
  const [activeTab, setActiveTab] = useState('events');

  return (
    <section id="news-events" className="py-24 bg-slate-50 seismic-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div>
            <p className="text-teal-600 text-sm font-semibold tracking-widest uppercase mb-2">
              Stay Connected
            </p>
            <h2 className="text-4xl font-black text-slate-900 section-heading">News & Events</h2>
          </div>

          {/* Tabs */}
          <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-slate-200 self-start sm:self-auto">
            <button
              id="tab-events"
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'events'
                  ? 'bg-teal-500 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Upcoming Events
            </button>
            <button
              id="tab-news"
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'news'
                  ? 'bg-teal-500 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              Latest News
            </button>
          </div>
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[...events].sort((a, b) => new Date(b.date) - new Date(a.date)).map((event) => (
                <EventCard key={event.id} event={event} featured={event.featured} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <a
                href="https://gst.wildapricot.org/page-18168"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-teal-500 text-teal-600 font-semibold text-sm hover:bg-teal-500 hover:text-white transition-all duration-200"
              >
                View All Events <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {news.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-600 font-semibold text-sm hover:border-teal-500 hover:text-teal-600 transition-all duration-200"
              >
                All News & Announcements <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
