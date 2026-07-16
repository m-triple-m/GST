import { useState, useEffect, useCallback } from 'react';
import { Mail, Search, RefreshCw, CheckCircle, Clock, ChevronLeft, ChevronRight, Loader2, Inbox } from 'lucide-react';
import api from '../../api';

const SUBJECTS = {
  membership: 'Membership Inquiry',
  events: 'Events & Sponsorship',
  speaking: 'Speaking Opportunity',
  scholarship: 'Student Scholarships',
  other: 'Other',
};

export default function AdminContactInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [marking, setMarking] = useState(false);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/contact/inquiries', { params: { page, limit: 15 } });
      setInquiries(data.data || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error('Failed to load inquiries', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const markAsRead = async (inquiry) => {
    if (inquiry.is_read) return;
    setMarking(true);
    try {
      await api.patch(`/contact/inquiries/${inquiry.id}/read`);
      setInquiries(prev => prev.map(i => i.id === inquiry.id ? { ...i, is_read: 1 } : i));
      if (selected?.id === inquiry.id) setSelected({ ...selected, is_read: 1 });
    } catch (err) {
      console.error('Failed to mark as read', err);
    } finally {
      setMarking(false);
    }
  };

  const handleSelect = (inquiry) => {
    setSelected(inquiry);
    markAsRead(inquiry);
  };

  const filtered = inquiries.filter(i =>
    !search ||
    i.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.email?.toLowerCase().includes(search.toLowerCase()) ||
    i.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = inquiries.filter(i => !i.is_read).length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center gap-4 sticky top-0 z-20 shrink-0">
        <Mail className="w-5 h-5 text-teal-600" />
        <div className="flex-1">
          <h1 className="text-sm font-black text-slate-900">Contact Inquiries</h1>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
            Messages from the public
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-black">
            {unreadCount} Unread
          </span>
        )}
        <button
          onClick={fetchInquiries}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Left: Inquiry List ── */}
        <div className="w-96 border-r border-slate-200 bg-white flex flex-col min-h-0 shrink-0">
          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, email, subject..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Inbox className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No inquiries found</p>
              </div>
            ) : (
              filtered.map(inquiry => (
                <button
                  key={inquiry.id}
                  onClick={() => handleSelect(inquiry)}
                  className={`w-full text-left px-5 py-4 transition-all hover:bg-slate-50 ${
                    selected?.id === inquiry.id ? 'bg-teal-50 border-l-2 border-teal-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-sm truncate font-bold ${!inquiry.is_read ? 'text-slate-900' : 'text-slate-600'}`}>
                      {inquiry.name}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {new Date(inquiry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mb-1">{inquiry.email}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {SUBJECTS[inquiry.subject] || inquiry.subject || '(No subject)'}
                  </p>
                  {!inquiry.is_read && (
                    <span className="inline-block mt-1.5 w-2 h-2 rounded-full bg-teal-500" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-500">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── Right: Inquiry Detail ── */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Mail className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-bold mb-1">Select an Inquiry</p>
              <p className="text-sm">Click a message on the left to view its contents.</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Detail header */}
                <div className="p-8 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 mb-1">{selected.name}</h2>
                      <a href={`mailto:${selected.email}`} className="text-sm text-teal-600 hover:underline font-semibold">
                        {selected.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {selected.is_read ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" /> Read
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full">
                          <Clock className="w-3.5 h-3.5" /> Unread
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subject</p>
                      <p className="text-sm font-bold text-slate-700">
                        {SUBJECTS[selected.subject] || selected.subject || '—'}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Received</p>
                      <p className="text-sm font-bold text-slate-700">
                        {new Date(selected.created_at).toLocaleString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message body */}
                <div className="p-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Message</p>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">{selected.message}</p>
                </div>

                {/* Action */}
                <div className="px-8 pb-8">
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${SUBJECTS[selected.subject] || selected.subject || 'Your Inquiry'}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20"
                  >
                    <Mail className="w-4 h-4" />
                    Reply via Email
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
