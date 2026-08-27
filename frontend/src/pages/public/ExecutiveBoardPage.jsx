import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ChevronRight, Loader2, Mail, Briefcase } from 'lucide-react';
import api from '../../api';

export default function ExecutiveBoardPage() {
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        const { data } = await api.get('/members/executive');
        setExecutives(data.data || []);
      } catch (err) {
        console.error('Failed to fetch executives', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExecutives();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-20">

      {/* ── Page Hero ─────────────────────────────────────────── */}
      <div className="bg-slate-900 py-14 relative overflow-hidden">
        <div className="absolute inset-0 seismic-pattern opacity-20" />
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
            <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-300">Executive Board</span>
          </div>

          <p className="text-teal-400 text-sm font-semibold tracking-widest uppercase mb-3">Leadership</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Executive Board</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Meet the dedicated professionals steering the strategic direction and governance of the
            Geophysical Society of Tulsa.
          </p>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {loading ? (
          <div className="py-24 flex justify-center">
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
          </div>
        ) : executives.length === 0 ? (
          <div className="py-24 text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="font-semibold text-lg">No executive board members found.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-black text-slate-900 mb-8">
              {new Date().getFullYear()} Executive Board
            </h2>

            {/* Member Cards */}
            <div className="space-y-6">
              {executives.map((exec, idx) => {
                const fullName = `${exec.first_name} ${exec.last_name}`;
                const role = exec.job_title || 'Executive Member';
                const image =
                  exec.profile_image ||
                  exec.avatar_url ||
                  exec.exec_photo_url ||
                  null;

                return (
                  <div
                    key={exec.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 overflow-hidden flex flex-col sm:flex-row group animate-fade-in-up"
                    style={{ animationDelay: `${idx * 0.08}s` }}
                  >
                    {/* Avatar / Photo */}
                    <div className="w-full sm:w-56 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-teal-50 group-hover:to-teal-100 transition-all duration-300 flex items-center justify-center relative overflow-hidden min-h-[180px] sm:min-h-0">
                      {image ? (
                        <img
                          src={image}
                          alt={fullName}
                          className="w-full h-full object-cover absolute inset-0"
                        />
                      ) : (
                        <Users className="w-16 h-16 text-slate-400 group-hover:text-teal-500 transition-colors duration-300" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-8 flex flex-col justify-center">
                      <p className="text-xs font-bold text-teal-600 tracking-widest uppercase mb-2">
                        {role}
                      </p>
                      <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                        {fullName}
                      </h2>

                      {exec.company && (
                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
                          <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{exec.company}</span>
                        </div>
                      )}

                      <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-2xl line-clamp-3">
                        {exec.bio ||
                          `${fullName} serves on the Executive Board of the Geophysical Society of Tulsa, helping to guide the strategic vision and operations of the organization.`}
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          to={`/executive/${exec.id}`}
                          className="btn-teal px-6 py-2.5 rounded-xl font-bold text-white text-sm"
                        >
                          <span>View Profile</span>
                        </Link>
                        {exec.email && (
                          <a
                            href={`mailto:${exec.email}`}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 transition-all duration-200"
                          >
                            <Mail className="w-4 h-4" />
                            Contact
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Recruitment Pending Card ─────────────────────────── */}
        {!loading && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/60 overflow-hidden flex flex-col sm:flex-row opacity-60">
            <div className="w-full sm:w-56 flex-shrink-0 bg-slate-100 flex items-center justify-center py-16">
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Photo</span>
            </div>
            <div className="flex-1 p-8 flex flex-col justify-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Position Pending
              </p>
              <h3 className="text-xl font-black text-slate-400 mb-3">Recruitment in Progress</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xl">
                This position is currently undergoing strategic review. The Executive Board is seeking a
                candidate with a background in structural governance and geophysical policy implementation.
              </p>
              <button
                disabled
                className="w-fit px-6 py-2.5 border border-slate-300 text-xs font-bold uppercase tracking-widest text-slate-400 rounded-xl cursor-not-allowed"
              >
                Apply Now
              </button>
            </div>
          </div>
        )}

        {/* ── Interested in Serving CTA ─────────────────────────── */}
        {!loading && (
          <div className="mt-14 bg-slate-900 rounded-2xl p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 seismic-pattern opacity-20" />
            <div className="relative">
              <h3 className="text-2xl font-black text-white mb-3">Interested in Serving?</h3>
              <p className="text-slate-400 max-w-lg mx-auto mb-7">
                GST board positions are open to all professional members. Elections are held annually
                at our spring meeting. Join as a member to become eligible.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/membership" className="btn-teal px-7 py-3.5 rounded-xl font-bold text-white text-sm">
                  <span>Join GST</span>
                </Link>
                <Link
                  to="/#contact"
                  className="px-7 py-3.5 rounded-xl font-bold text-white text-sm border border-white/20 hover:bg-white/5 transition-all duration-200"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
