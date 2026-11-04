import { useState, useRef } from 'react';
import { Award, FileText, Printer, Download, X, CheckCircle, ShieldCheck, Sparkles, Building2, Calendar, Hash } from 'lucide-react';

export default function MembershipCertificateModal({ open, onClose, member }) {
  if (!open || !member) return null;

  const [activeTab, setActiveTab] = useState('certificate'); // 'certificate' | 'receipt'
  const printRef = useRef(null);

  const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Member';
  const memberId = member.member_id || member.id || 'GST-MEMBER';
  const tierName = (member.tier || 'Professional').toUpperCase();
  const joinedDate = member.joined_at
    ? new Date(member.joined_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Active Term';
  const expiresDate = member.expires_at
    ? new Date(member.expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Good Standing';

  const tierPrices = {
    student: '$80.00',
    professional: '$110.00',
    corporate: '$150.00',
  };
  const amountPaid = tierPrices[member.tier?.toLowerCase()] || '$110.00';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static print:z-auto">
      {/* Container */}
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden print:max-w-none print:shadow-none print:border-none print:rounded-none print:max-h-none print:w-full">
        
        {/* Header toolbar (Hidden during print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex p-1 bg-white/10 rounded-xl">
              <button
                onClick={() => setActiveTab('certificate')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'certificate' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Certificate</span>
              </button>
              <button
                onClick={() => setActiveTab('receipt')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'receipt' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Tax Receipt</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div ref={printRef} className="p-8 sm:p-10 overflow-y-auto flex-1 bg-slate-50 print:p-8 print:bg-white print:overflow-visible">
          
          {activeTab === 'certificate' ? (
            /* ──────────────── Certificate Card ──────────────── */
            <div className="relative bg-white border-8 border-double border-teal-800/80 rounded-2xl p-8 sm:p-12 text-center shadow-lg print:shadow-none print:border-4 print:border-teal-900">
              {/* Corner Accents */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-600" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-600" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-600" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-600" />

              {/* Society Crest / Header */}
              <div className="mb-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-teal-50 border-2 border-teal-600 flex items-center justify-center text-teal-700 mb-3 shadow-inner">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="text-xs font-black tracking-[0.25em] uppercase text-teal-800">
                  Geophysical Society of Tulsa
                </h4>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                  A Section of the Society of Exploration Geophysicists (SEG) · Founded 1947
                </p>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 tracking-wide mb-2">
                Certificate of Membership
              </h1>
              <p className="text-xs text-slate-500 italic mb-8">
                This is to officially certify that
              </p>

              {/* Member Name */}
              <div className="border-b-2 border-slate-300 pb-2 mb-6 max-w-lg mx-auto">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-teal-900">
                  {fullName}
                </h2>
              </div>

              {/* Body Statement */}
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-8">
                is a recognized and accredited <strong className="text-slate-900 font-bold">{tierName} MEMBER</strong> of the Geophysical Society of Tulsa in good standing, dedicated to the advancement of science and the exploration of the Earth.
              </p>

              {/* Metadata Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-10 pt-4 border-t border-slate-100 text-left">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Member ID</p>
                  <p className="font-mono text-xs font-black text-slate-900 mt-0.5">#{memberId}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Member Since</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{joinedDate}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Valid Through</p>
                  <p className="text-xs font-bold text-teal-700 mt-0.5">{expiresDate}</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-12 max-w-md mx-auto pt-4">
                <div className="text-center">
                  <div className="border-b border-slate-400 pb-1 font-serif text-sm italic text-slate-700">
                    Executive Committee
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                    GST President
                  </p>
                </div>
                <div className="text-center">
                  <div className="border-b border-slate-400 pb-1 font-serif text-sm italic text-slate-700">
                    Official Records
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                    Secretary / Treasurer
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ──────────────── Official Tax Receipt ──────────────── */
            <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-lg print:shadow-none print:border-none">
              
              {/* Receipt Top Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-black text-sm">
                      GST
                    </div>
                    <h3 className="text-base font-black text-slate-900">Geophysical Society of Tulsa</h3>
                  </div>
                  <p className="text-xs text-slate-500">P.O. Box 4508, Tulsa, OK 74159</p>
                  <p className="text-xs text-slate-500">contact@tulsa-gst.org · www.tulsa-gst.org</p>
                  <p className="text-[11px] font-semibold text-teal-700 mt-1">501(c)(3) Non-Profit Scientific & Educational Society</p>
                </div>

                <div className="sm:text-right">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                    Payment Receipt
                  </span>
                  <p className="text-xs font-bold text-slate-400">Receipt Ref: <span className="text-slate-900 font-mono">REC-{memberId}-{new Date().getFullYear()}</span></p>
                  <p className="text-xs text-slate-500">Issue Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Billed To */}
              <div className="py-6 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Member Information</h4>
                  <p className="text-sm font-black text-slate-900">{fullName}</p>
                  <p className="text-xs text-slate-600">{member.email}</p>
                  {member.phone && <p className="text-xs text-slate-500">{member.phone}</p>}
                  {(member.company_name || member.company) && (
                    <p className="text-xs font-semibold text-slate-700 mt-1">
                      Organization: {member.company_name || member.company}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Membership Account</h4>
                  <p className="text-xs font-bold text-slate-700">Member ID: <span className="font-mono text-teal-700 font-black">#{memberId}</span></p>
                  <p className="text-xs font-bold text-slate-700">Classification: <span className="uppercase text-slate-900">{member.tier || 'Professional'}</span></p>
                  <p className="text-xs font-bold text-slate-700">Term Duration: <span>1 Year ({joinedDate} – {expiresDate})</span></p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="py-6">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black">
                      <th className="pb-3">Description</th>
                      <th className="pb-3 text-center">Period</th>
                      <th className="pb-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-4 font-bold text-slate-800">
                        GST Annual Membership Dues — {tierName}
                        <p className="text-[11px] font-normal text-slate-400 mt-0.5">
                          Professional affiliation, technical meetings access, and voting privileges
                        </p>
                      </td>
                      <td className="py-4 text-center text-slate-600 font-medium">12 Months</td>
                      <td className="py-4 text-right font-black text-slate-900">{amountPaid}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-900 text-sm font-black text-slate-900">
                      <td colSpan="2" className="pt-4 text-right pr-4">Total Paid:</td>
                      <td className="pt-4 text-right text-teal-700 font-mono text-base">{amountPaid}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Employer / Reimbursement Note */}
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                <strong>Employer Expense Reimbursement Notice:</strong> Dues paid to the Geophysical Society of Tulsa support professional scientific education and are typically eligible for employer reimbursement under standard technical and corporate development budgets.
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

