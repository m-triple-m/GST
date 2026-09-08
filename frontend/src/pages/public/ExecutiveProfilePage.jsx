import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Users, ChevronRight, ArrowLeft, Mail, Phone, MapPin, 
  Briefcase, GraduationCap, Award, ShieldCheck, CheckCircle2, 
  Copy, Check, ExternalLink, Calendar, Building2, Loader2,
  FileText, Sparkles
} from 'lucide-react';
import api from '../../api';

export default function ExecutiveProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exec, setExec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchExecutive = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/members/executive/${id}`);
        setExec(data.data);
      } catch (err) {
        setExec(null);
      } finally {
        setLoading(false);
      }
    };
    fetchExecutive();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium text-sm">Loading executive profile...</p>
        </div>
      </div>
    );
  }

  if (!exec) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-16">
        <div className="max-w-2xl mx-auto px-4 text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-900 mb-2">Executive Member Not Found</h1>
          <p className="text-slate-500 text-sm mb-6">
            The requested executive profile could not be found or is no longer an active board member.
          </p>
          <button 
            onClick={() => navigate('/executive')}
            className="btn-teal px-6 py-2.5 rounded-xl font-bold text-white text-sm inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Executive Board</span>
          </button>
        </div>
      </div>
    );
  }

  const fullName = exec.nickname 
    ? `${exec.first_name} "${exec.nickname}" ${exec.last_name}` 
    : `${exec.first_name} ${exec.last_name}`;

  const role = exec.board_position || exec.exec_position || exec.job_title || 'Executive Board Member';
  const company = exec.company_name || exec.company || null;
  const image = exec.profile_image || exec.avatar_url || exec.exec_photo_url || null;
  const bio = exec.exec_bio || exec.bio || 
    `${fullName} serves on the Executive Board of the Geophysical Society of Tulsa (GST), contributing leadership, technical expertise, and vision to foster the advancement of geophysics in the Tulsa community and energy industry.`;

  // Parse education records
  let educationList = [];
  if (exec.education) {
    if (Array.isArray(exec.education)) {
      educationList = exec.education;
    } else if (typeof exec.education === 'string') {
      try {
        const parsed = JSON.parse(exec.education);
        if (Array.isArray(parsed)) educationList = parsed;
      } catch (e) {
        // Not valid JSON string
      }
    }
  }

  // Fallback single degree if list is empty
  if (educationList.length === 0 && (exec.university || exec.degree || exec.major)) {
    educationList.push({
      university: exec.university || '',
      degree: exec.degree || '',
      major: exec.major || ''
    });
  }

  const joinedDate = (exec.joined_at || exec.created_at)
    ? new Date(exec.joined_at || exec.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : null;

  const segLabel = exec.seg_status && exec.seg_status !== 'non-member'
    ? `${exec.seg_status.charAt(0).toUpperCase() + exec.seg_status.slice(1)} Member`
    : 'Non-Member';

  const companyLocation = [exec.company_city, exec.company_state].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page Hero ─────────────────────────────────────────── */}
      <div className="bg-slate-900 pt-28 pb-14 relative overflow-hidden">
        <div className="absolute inset-0 seismic-pattern opacity-20" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-5 flex-wrap">
            <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <Link to="/executive" className="hover:text-teal-400 transition-colors">Executive Board</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-teal-400 font-medium truncate max-w-xs">{fullName}</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded-full text-teal-400 text-xs font-bold tracking-widest uppercase mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Leadership Profile</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
            {fullName}
          </h1>
          <p className="text-teal-300 text-lg sm:text-xl font-medium max-w-3xl">
            {role} {company && <span className="text-slate-300 font-normal">at {company}</span>}
          </p>
        </div>
      </div>

      {/* ── Main Content Section ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        {/* Navigation Return */}
        <div className="mb-8">
          <Link 
            to="/executive" 
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Executive Board</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* ── LEFT COLUMN: Executive Identity & Fast Details ─── */}
          <div className="lg:col-span-4 space-y-6">

            {/* Profile Avatar Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-7">
              <div className="relative rounded-xl overflow-hidden aspect-square bg-gradient-to-br from-slate-100 to-slate-200 mb-6 flex items-center justify-center border border-slate-100">
                {image ? (
                  <img 
                    src={image} 
                    alt={fullName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="w-24 h-24 text-slate-300" />
                )}
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-teal-300 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>GST Board</span>
                </div>
              </div>

              <div className="text-center sm:text-left">
                <span className="inline-block px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold rounded-lg mb-2 uppercase tracking-wide">
                  {role}
                </span>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">
                  {fullName}
                </h2>
                {company && (
                  <p className="text-slate-600 text-sm font-medium mt-1">
                    {company}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                {exec.email && (
                  <a
                    href={`mailto:${exec.email}`}
                    className="btn-teal w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Email</span>
                  </a>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    title="Share Profile"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-teal-600" />
                        <span className="text-teal-600">Link Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Share Profile</span>
                      </>
                    )}
                  </button>

                  {exec.linkedin_url && (
                    <a
                      href={exec.linkedin_url.startsWith('http') ? exec.linkedin_url : `https://${exec.linkedin_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      title="LinkedIn Profile"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* At-a-Glance Meta Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Executive Overview</span>
              </h3>

              <div className="space-y-4 text-sm">
                {company && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 text-teal-600">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Organization</p>
                      <p className="text-slate-800 font-bold">{company}</p>
                      {exec.job_title && exec.job_title !== role && (
                        <p className="text-xs text-slate-500">{exec.job_title}</p>
                      )}
                    </div>
                  </div>
                )}

                {companyLocation && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 text-teal-600">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Location</p>
                      <p className="text-slate-800 font-semibold">{companyLocation}</p>
                    </div>
                  </div>
                )}

                {(exec.phone || exec.company_phone) && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 text-teal-600">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Phone</p>
                      <a href={`tel:${exec.phone || exec.company_phone}`} className="text-slate-800 font-semibold hover:text-teal-600 transition-colors">
                        {exec.phone || exec.company_phone}
                      </a>
                    </div>
                  </div>
                )}

                {joinedDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 text-teal-600">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Member Since</p>
                      <p className="text-slate-800 font-semibold">{joinedDate}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Society Affiliations Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-600" />
                <span>Society Affiliations</span>
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Society of Exploration Geophysicists (SEG)</p>
                    <p className="text-xs text-slate-500">National Affiliation</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                    exec.seg_status && exec.seg_status !== 'non-member'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {segLabel}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Tulsa Geological Society (TGS)</p>
                    <p className="text-xs text-slate-500">Sister Society</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                    exec.tgs_member
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {exec.tgs_member ? 'Active Member' : 'Non-Member'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: Main Content & Credentials ───────── */}
          <div className="lg:col-span-8 space-y-8">

            {/* Biography & Executive Statement */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Biography & Background
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Executive Profile
                  </p>
                </div>
              </div>

              <div className="text-slate-600 text-base leading-relaxed space-y-4">
                {bio.split('\n').map((paragraph, idx) => (
                  paragraph.trim() ? (
                    <p key={idx} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ) : null
                ))}
              </div>
            </div>

            {/* Academic & Education Background */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Academic Background & Education
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Degrees & Credentials
                  </p>
                </div>
              </div>

              {educationList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {educationList.map((edu, idx) => (
                    <div 
                      key={idx}
                      className="p-5 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded-md text-xs font-bold uppercase tracking-wider">
                            {edu.degree || 'Degree'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base mb-1">
                          {edu.major || 'Field of Study'}
                        </h4>
                        <p className="text-sm text-slate-600 flex items-center gap-1.5 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{edu.university || 'University / Institution'}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 text-center text-slate-500">
                  <p className="text-sm font-medium">Professional geophysics credentials and industry experience on file with GST.</p>
                </div>
              )}
            </div>

            {/* Professional Industry Focus & Governance */}
            {(exec.industry || exec.experience || exec.motivation) && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      Professional Focus & Experience
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Industry Standing
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {exec.industry && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Primary Industry</p>
                      <p className="text-slate-800 font-bold text-base mt-0.5">{exec.industry}</p>
                    </div>
                  )}
                  {exec.experience && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Experience</p>
                      <p className="text-slate-800 font-bold text-base mt-0.5">{exec.experience} Years in Geophysics / Energy</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reach out CTA card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden shadow-sm">
              <div className="absolute inset-0 seismic-pattern opacity-10" />
              <div className="relative">
                <h3 className="text-2xl font-black text-white mb-2">
                  Connect with {exec.first_name}
                </h3>
                <p className="text-slate-300 text-sm max-w-xl mb-6 leading-relaxed">
                  Have a question about GST operations, committee initiatives, technical presentations, or partnership opportunities? Reach out directly or connect with our leadership board.
                </p>
                <div className="flex flex-wrap gap-4">
                  {exec.email && (
                    <a 
                      href={`mailto:${exec.email}`}
                      className="btn-teal px-6 py-3 rounded-xl font-bold text-white text-sm inline-flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email {exec.first_name}</span>
                    </a>
                  )}
                  <Link
                    to="/executive"
                    className="px-6 py-3 rounded-xl font-bold text-white text-sm border border-white/20 hover:bg-white/10 transition-colors inline-flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>View All Board Members</span>
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
