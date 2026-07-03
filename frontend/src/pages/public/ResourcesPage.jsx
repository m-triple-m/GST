import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play, Download, FileText, Search, ChevronRight,
  Calendar, Clock, Users, Tag, Lock, Globe
} from 'lucide-react';

const resources = [
  {
    id: 1,
    year: 2025,
    month: 'November',
    title: 'Passive Seismic Monitoring: From Induced Seismicity to Geothermal Exploration',
    speaker: 'Dr. Linda Park',
    org: 'Baker Hughes',
    category: 'Seismic Monitoring',
    hasVideo: true,
    hasSlides: true,
    hasPaper: false,
    access: 'members',
    duration: '45 min',
    summary: 'An in-depth review of passive seismic techniques evolving from hazard monitoring to unlocking geothermal energy potential in the midcontinent region.',
  },
  {
    id: 2,
    year: 2025,
    month: 'October',
    title: 'Carbon Capture & Storage: The Role of Geophysics in Site Characterization',
    speaker: 'Dr. Emily Torres',
    org: 'ExxonMobil',
    category: 'CCS & Geomechanics',
    hasVideo: true,
    hasSlides: true,
    hasPaper: true,
    access: 'members',
    duration: '52 min',
    summary: 'Exploring geophysical methods for CO₂ storage site selection, injection monitoring, and long-term verification across multiple field case studies.',
  },
  {
    id: 3,
    year: 2025,
    month: 'September',
    title: 'Advances in Full-Waveform Inversion for Complex Geological Settings',
    speaker: 'Dr. Marcus Reed',
    org: 'Chevron',
    category: 'Seismic Processing',
    hasVideo: false,
    hasSlides: true,
    hasPaper: true,
    access: 'public',
    duration: '48 min',
    summary: 'A deep dive into modern FWI algorithms including multiparameter FWI and their real-world application in structurally complex thrust-belt environments.',
  },
  {
    id: 4,
    year: 2025,
    month: 'April',
    title: 'Digital Rock Physics: From Micro-CT Imaging to Elastic Moduli',
    speaker: 'Dr. Rachel Kim',
    org: 'University of Oklahoma',
    category: 'Rock Physics',
    hasVideo: true,
    hasSlides: true,
    hasPaper: false,
    access: 'public',
    duration: '41 min',
    summary: 'Examining how high-resolution CT scanning and computational methods are redefining how we understand pore-scale physics and reservoir quality.',
  },
  {
    id: 5,
    year: 2025,
    month: 'March',
    title: 'Integrating AI into Seismic Interpretation: Lessons from the Field',
    speaker: 'Carlos Mendez',
    org: 'Halliburton',
    category: 'ML & AI',
    hasVideo: true,
    hasSlides: true,
    hasPaper: true,
    access: 'members',
    duration: '55 min',
    summary: 'Case studies on deploying machine learning workflows for fault detection, horizon auto-picking, and facies classification across multiple basins.',
  },
  {
    id: 6,
    year: 2025,
    month: 'February',
    title: 'Borehole Seismic Techniques: VSP, DAS, and Distributed Temperature Sensing',
    speaker: 'Dr. Angela Pierce',
    org: 'SLB',
    category: 'Borehole Geophysics',
    hasVideo: false,
    hasSlides: true,
    hasPaper: false,
    access: 'members',
    duration: '39 min',
    summary: 'Reviewing modern borehole geophysical tools and their integration into field development workflows for improved reservoir characterization.',
  },
];

const years = ['All Years', '2025', '2024', '2023'];
const categories = ['All', 'Seismic Monitoring', 'CCS & Geomechanics', 'Seismic Processing', 'Rock Physics', 'ML & AI', 'Borehole Geophysics'];

export default function ResourcesPage() {
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('All Years');
  const [category, setCategory] = useState('All');

  const filtered = resources.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.speaker.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase());
    const matchYear = year === 'All Years' || r.year === Number(year);
    const matchCat = category === 'All' || r.category === category;
    return matchSearch && matchYear && matchCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <div className="bg-slate-900 py-14 relative overflow-hidden">
        <div className="absolute inset-0 seismic-pattern opacity-20" />
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
            <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-300">Resources & Archive</span>
          </div>
          <p className="text-teal-400 text-sm font-semibold tracking-widest uppercase mb-3">Archive</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Resources & Recordings</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Access recordings, presentation slides, and technical papers from past GST luncheons.
            Some content is exclusive to GST members.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Access notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-amber-700 text-sm">
            <strong>Member-only content</strong> requires a GST membership to access.{' '}
            <Link to="/membership" className="underline font-semibold">Join GST</Link> to unlock the full archive.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="resources-search"
                type="text"
                placeholder="Search talks, speakers, topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              {years.map((y) => (
                <button key={y} onClick={() => setYear(y)} className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${year === y ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                  {y}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${category === cat ? 'bg-teal-500 text-white border-teal-500' : 'text-slate-500 border-slate-200 hover:border-slate-400'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-6">
          Showing <span className="font-semibold text-slate-800">{filtered.length}</span> presentations
        </p>

        {/* Resource cards */}
        <div className="space-y-4">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-5">
                  {/* Video thumbnail */}
                  <div className="lg:w-52 h-32 lg:h-auto rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shrink-0 relative overflow-hidden border border-slate-700">
                    <div className="absolute inset-0 seismic-pattern opacity-10" />
                    {r.hasVideo ? (
                      <div className="relative flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${r.access === 'members' ? 'bg-slate-600' : 'bg-teal-500'}`}>
                          {r.access === 'members' ? <Lock className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
                        </div>
                        <span className="text-slate-400 text-xs">{r.duration}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 text-slate-500" />
                        <span className="text-slate-500 text-xs">Slides Only</span>
                      </div>
                    )}
                    {r.access === 'members' && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Members</div>
                    )}
                    {r.access === 'public' && (
                      <div className="absolute top-2 right-2 bg-teal-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Globe className="w-3 h-3" /> Free</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">{r.category}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{r.month} {r.year}</span>
                    </div>

                    <h3 className="font-bold text-slate-800 text-lg leading-snug mb-2">{r.title}</h3>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                        <Users className="w-3 h-3 text-slate-500" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{r.speaker}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-sm text-slate-500">{r.org}</span>
                    </div>

                    <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">{r.summary}</p>

                    {/* Download options */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {r.hasVideo && (
                        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          r.access === 'members'
                            ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                            : 'bg-teal-500 text-white hover:bg-teal-600'
                        }`}>
                          {r.access === 'members' ? <Lock className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          Watch Recording
                        </button>
                      )}
                      {r.hasSlides && (
                        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                          r.access === 'members'
                            ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'border-teal-500 text-teal-600 hover:bg-teal-50'
                        }`}>
                          {r.access === 'members' ? <Lock className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                          Download Slides
                        </button>
                      )}
                      {r.hasPaper && (
                        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                          r.access === 'members'
                            ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}>
                          {r.access === 'members' ? <Lock className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                          Technical Paper
                        </button>
                      )}
                      {r.access === 'members' && (
                        <Link to="/membership" className="text-xs text-teal-600 hover:text-teal-500 font-semibold flex items-center gap-1 ml-1">
                          Join to unlock <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg font-medium">No resources found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
