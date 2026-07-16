import { useState, useEffect } from 'react';
import { Users, Award, Target, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const milestones = [
  { year: '1947', event: 'First SEG section established in Tulsa, OK' },
  { year: '1960s', event: "Rapid growth during Tulsa's oil exploration boom" },
  { year: '1990s', event: 'Expanded into digital geophysics education programs' },
  { year: '2000s', event: 'Launched annual scholarship fund for students' },
  { year: '2020', event: 'Transitioned to hybrid virtual and in-person events' },
  { year: '2026', event: '75+ years of geophysical excellence in Oklahoma' },
];

export default function About() {
  const [committee, setCommittee] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        const { data } = await api.get('/members/executive');
        setCommittee(data.data || []);
      } catch (err) {
        console.error('Failed to fetch executive board', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExecutives();
  }, []);

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-center">
          {/* Text */}
          <div>
            <p className="text-teal-600 text-sm font-semibold tracking-widest uppercase mb-3">
              Who We Are
            </p>
            <h2 className="text-4xl font-black text-slate-900 mb-6 section-heading">
              Our Mission &amp; History
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              In 1947, the Geophysical Society of Tulsa (GST) became the <strong>first local section</strong> to 
              be approved by the Society of Exploration Geophysicists (SEG). For over 75 years, we have 
              enriched the geophysical community locally and globally through regular meetings, 
              technical talks, and impactful events.
            </p>
            <p className="text-slate-600 leading-relaxed mb-8">
              We are continuously supported by the generosity of our sponsors, members, and the broader 
              Tulsa community. Our monthly technical luncheons bring world-class speakers to discuss the 
              latest developments in seismic acquisition, reservoir characterization, machine learning, 
              and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Award, label: 'Pioneer Organization', sub: '1st SEG Section' },
                { icon: Target, label: 'Technical Excellence', sub: 'Monthly Luncheons' },
                { icon: Clock, label: 'Legacy of Service', sub: '75+ Years Running' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="stat-card rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-500" />
              Key Milestones
            </h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-teal-500 to-slate-200" />
              <div className="space-y-6">
                {milestones.map(({ year, event }) => (
                  <div key={year} className="flex items-start gap-6 pl-10 relative">
                    <div className="absolute left-0 w-8 h-8 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center shadow-md">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    </div>
                    <div>
                      <span className="text-teal-600 font-black text-sm">{year}</span>
                      <p className="text-slate-600 text-sm mt-0.5 leading-relaxed">{event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Executive Committee */}
        <div>
          <div className="text-center mb-12">
            <p className="text-teal-600 text-sm font-semibold tracking-widest uppercase mb-3">
              Leadership
            </p>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Executive Committee</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Our volunteer leadership team works year-round to deliver meaningful programming and
              opportunities to the Tulsa geophysical community.
            </p>
          </div>

          {loading ? (
            /* Loading skeletons */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-6 border border-slate-200 animate-pulse flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : committee.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Executive committee information coming soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {committee.map((exec) => {
                const fullName = `${exec.first_name} ${exec.last_name}`;
                const position = exec.exec_position || exec.job_title || 'Executive Member';
                return (
                  <Link
                    key={exec.id}
                    to={`/executive/${exec.id}`}
                    className="group bg-slate-50 hover:bg-teal-50 rounded-xl p-6 border border-slate-200 hover:border-teal-300 transition-all duration-200 flex items-start gap-4"
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 group-hover:border-teal-300 transition-colors duration-200">
                      {exec.profile_image ? (
                        <img
                          src={exec.profile_image}
                          alt={fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-teal-100 group-hover:bg-teal-200 transition-colors duration-200">
                          <Users className="w-6 h-6 text-teal-600" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-teal-600 tracking-widest uppercase mb-1 truncate">
                        {position}
                      </p>
                      <p className="font-bold text-slate-800 truncate">{fullName}</p>
                      {exec.company && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">{exec.company}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/executive"
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-800 transition-colors"
            >
              View Full Leadership Board →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
