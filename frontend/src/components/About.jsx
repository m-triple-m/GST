import { Users, Award, Target, Clock, ChevronRight } from 'lucide-react';

const committee = [
  { title: 'President', name: 'To Be Announced', term: '2025–2026' },
  { title: 'Vice President', name: 'To Be Announced', term: '2025–2026' },
  { title: 'Secretary', name: 'To Be Announced', term: '2025–2026' },
  { title: 'Treasurer', name: 'To Be Announced', term: '2025–2026' },
  { title: 'Past President', name: 'To Be Announced', term: '2025–2026' },
  { title: 'Program Chair', name: 'To Be Announced', term: '2025–2026' },
];

const milestones = [
  { year: '1947', event: 'First SEG section established in Tulsa, OK' },
  { year: '1960s', event: 'Rapid growth during Tulsa\'s oil exploration boom' },
  { year: '1990s', event: 'Expanded into digital geophysics education programs' },
  { year: '2000s', event: 'Launched annual scholarship fund for students' },
  { year: '2020', event: 'Transitioned to hybrid virtual and in-person events' },
  { year: '2026', event: '75+ years of geophysical excellence in Oklahoma' },
];

export default function About() {
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
              Our Mission & History
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
                {milestones.map(({ year, event }, i) => (
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
              Our volunteer leadership team works year-round to deliver meaningful programming and opportunities to the Tulsa geophysical community.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {committee.map(({ title, name, term }) => (
              <div
                key={title}
                className="group bg-slate-50 hover:bg-teal-50 rounded-xl p-6 border border-slate-200 hover:border-teal-200 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-full bg-slate-200 group-hover:bg-teal-100 flex items-center justify-center mb-4 transition-colors duration-200">
                  <Users className="w-6 h-6 text-slate-500 group-hover:text-teal-600 transition-colors duration-200" />
                </div>
                <p className="text-xs font-bold text-teal-600 tracking-widest uppercase mb-1">{title}</p>
                <p className="font-bold text-slate-800 mb-1">{name}</p>
                <p className="text-xs text-slate-400">{term}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-slate-400 mt-6">
            For the full committee listing, visit{' '}
            <a
              href="https://gst.wildapricot.org/Executive-Committee"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:underline font-medium"
            >
              gst.wildapricot.org/Executive-Committee
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
