import { useState, useEffect, useCallback } from 'react';
import { 
  Activity, Search, Filter, RefreshCw, ChevronLeft, ChevronRight, 
  Clock3, ShieldCheck, Download, Code, X, Users, Calendar, 
  Building2, DollarSign, UserCog, Tag, CheckCircle2
} from 'lucide-react';
import api from '../../api';

// ── Action label, color, and icon mappings ────────────────────────
const ACTION_DISPLAY = {
  MEMBER_STATUS_CHANGE:           { label: 'Member Status Changed',    color: 'text-teal-700',   bg: 'bg-teal-50 border-teal-200',    icon: Users },
  MEMBER_RENEWED:                 { label: 'Membership Renewed',       color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',    icon: Users },
  MEMBER_EXPIRATION_UPDATED:      { label: 'Expiration Updated',       color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',  icon: Clock3 },
  MEMBER_EXECUTIVE_TOGGLED:       { label: 'Executive Status Changed', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200',icon: ShieldCheck },
  MEMBER_PASSWORD_RESET:          { label: 'Password Reset',           color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200',icon: UserCog },
  MEMBER_DELETED:                 { label: 'Member Deleted',           color: 'text-rose-700',   bg: 'bg-rose-50 border-rose-200',    icon: Users },
  EVENT_CREATED:                  { label: 'Event Created',            color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200',icon: Calendar },
  EVENT_UPDATED:                  { label: 'Event Updated',            color: 'text-teal-700',   bg: 'bg-teal-50 border-teal-200',    icon: Calendar },
  EVENT_DELETED:                  { label: 'Event Deleted',            color: 'text-rose-700',   bg: 'bg-rose-50 border-rose-200',    icon: Calendar },
  PAYMENT_STATUS_UPDATED:         { label: 'Payment Confirmed',        color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200',icon: DollarSign },
  SPONSOR_CREATED:                { label: 'Sponsor Added',            color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200',icon: Building2 },
  SPONSOR_UPDATED:                { label: 'Sponsor Updated',          color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200',icon: Building2 },
  SPONSOR_DELETED:                { label: 'Sponsor Removed',          color: 'text-rose-700',   bg: 'bg-rose-50 border-rose-200',    icon: Building2 },
  SPONSOR_REORDERED:              { label: 'Sponsors Reordered',       color: 'text-slate-700',  bg: 'bg-slate-100 border-slate-200', icon: Tag },
  SPONSOR_ENQUIRY_STATUS_UPDATED: { label: 'Enquiry Status Updated',   color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',  icon: Building2 },
  ADMIN_ACCOUNT_CREATED:          { label: 'Admin Account Created',    color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200',icon: ShieldCheck },
};

function getActionDisplay(action) {
  return ACTION_DISPLAY[action] || { 
    label: action ? action.replace(/_/g, ' ') : 'Action', 
    color: 'text-slate-700', 
    bg: 'bg-slate-100 border-slate-200',
    icon: Activity
  };
}

function buildActivityDescription(log) {
  const meta = typeof log.meta === 'string' ? JSON.parse(log.meta || '{}') : (log.meta || {});
  switch (log.action) {
    case 'MEMBER_STATUS_CHANGE':
      return `Changed member #${meta.member_id || log.target?.replace('member:', '')} status to "${meta.new_status || '?'}"${meta.expires_at ? ` (expires ${meta.expires_at})` : ''}`;
    case 'MEMBER_RENEWED':
      return `Renewed membership for member #${meta.member_id || log.target?.replace('member:', '')} (${meta.months || 12} months extension)`;
    case 'MEMBER_EXPIRATION_UPDATED':
      return `Updated expiration date for member #${meta.member_id || log.target?.replace('member:', '')} → ${meta.expires_at || '?'}`;
    case 'MEMBER_EXECUTIVE_TOGGLED':
      return meta.is_executive 
        ? `Promoted member #${meta.member_id || log.target?.replace('member:', '')} to Executive Board` 
        : `Removed Executive status from member #${meta.member_id || log.target?.replace('member:', '')}`;
    case 'MEMBER_PASSWORD_RESET':
      return `Reset password for member #${meta.member_id || log.target?.replace('member:', '')}`;
    case 'MEMBER_DELETED':
      return `Permanently deleted member #${meta.member_id || log.target?.replace('member:', '')}`;
    case 'EVENT_CREATED':
      return `Created new event "${meta.title || '?'}"${meta.event_date ? ` scheduled for ${meta.event_date}` : ''}`;
    case 'EVENT_UPDATED':
      return `Updated event #${meta.event_id || log.target?.replace('event:', '')}${meta.title ? ` — "${meta.title}"` : ''}`;
    case 'EVENT_DELETED':
      return `Deleted event #${meta.event_id || log.target?.replace('event:', '')}`;
    case 'PAYMENT_STATUS_UPDATED':
      return `Marked registration #${meta.registration_id || log.target?.replace('registration:', '')} payment as "${meta.payment_status || '?'}"${meta.payment_method ? ` via ${meta.payment_method.replace('_', ' ')}` : ''}`;
    case 'SPONSOR_CREATED':
      return `Added new sponsor partner "${meta.name || '?'}" (${meta.tier || 'bronze'} tier)`;
    case 'SPONSOR_UPDATED':
      return `Updated sponsor #${meta.sponsor_id || log.target?.replace('sponsor:', '')}${meta.name ? ` — "${meta.name}"` : ''}`;
    case 'SPONSOR_DELETED':
      return `Removed sponsor partner #${meta.sponsor_id || log.target?.replace('sponsor:', '')}`;
    case 'SPONSOR_ENQUIRY_STATUS_UPDATED':
      return `Updated sponsor enquiry #${meta.enquiry_id || log.target?.replace('sponsor_enquiry:', '')} status → "${meta.status || '?'}"`;
    case 'SPONSOR_REORDERED':
      return 'Updated visual display sequence of sponsor logos';
    case 'ADMIN_ACCOUNT_CREATED':
      return `Created admin access account for ${meta.email || '?'} (${meta.role || 'admin'})`;
    default:
      return log.action ? log.action.replace(/_/g, ' ').toLowerCase() : 'Administrative action';
  }
}

export default function AdminChangeLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [actionFilter, setActionFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'admin' | 'executive'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMetaLog, setSelectedMetaLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
      });
      if (actionFilter) params.append('action_filter', actionFilter);
      const { data: res } = await api.get(`/admin/audit?${params}`);
      setLogs(res.data || []);
      setPagination(res.pagination || null);
    } catch (err) {
      console.error('Failed to load activity logs:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Client-side search and role filter over fetched page items
  const filteredLogs = logs.filter((log) => {
    if (roleFilter !== 'all' && log.actor_role !== roleFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const actor = (log.actor_name || log.actor_email || '').toLowerCase();
    const target = (log.target || '').toLowerCase();
    const desc = buildActivityDescription(log).toLowerCase();
    const action = (log.action || '').toLowerCase();
    return actor.includes(q) || target.includes(q) || desc.includes(q) || action.includes(q);
  });

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['ID', 'Date/Time', 'Actor Name', 'Actor Email', 'Role', 'Action', 'Target', 'Details'];
    const rows = filteredLogs.map(l => [
      l.id,
      new Date(l.created_at).toISOString(),
      `"${(l.actor_name || '').replace(/"/g, '""')}"`,
      `"${(l.actor_email || '').replace(/"/g, '""')}"`,
      l.actor_role || 'admin',
      l.action,
      l.target || '',
      `"${buildActivityDescription(l).replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gst_changelogs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-teal-600">Change Logs</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Change Logs</h1>
            {pagination?.total ? (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-50 text-teal-700 border border-teal-200 shadow-sm">
                {pagination.total} logged actions
              </span>
            ) : null}
          </div>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Audit history recording changes to members, event details, attendee payments, sponsor records, and system administration.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 text-teal-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Filters & Search Toolbar ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
        
        {/* Top row: search + role filter + limit */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by admin name, email, target ID, or action..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer text-xs ml-1"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin Only</option>
                <option value="executive">Executive Only</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600">
              <span>Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer text-xs ml-1"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Category Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Category:
          </span>
          {[
            { id: '',               label: 'All Logs' },
            { id: 'MEMBER',         label: 'Members' },
            { id: 'EVENT',          label: 'Events' },
            { id: 'SPONSOR',        label: 'Sponsors' },
            { id: 'PAYMENT',        label: 'Payments' },
            { id: 'ADMIN_ACCOUNT',  label: 'Admin Accounts' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                setActionFilter(f.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                actionFilter === f.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Logs Feed ── */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 shrink-0" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-48" />
                      <div className="h-3 bg-slate-100 rounded w-72" />
                    </div>
                  </div>
                  <div className="h-4 bg-slate-100 rounded w-28" />
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-16 text-center">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-slate-800 font-black text-base">No change logs found</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                No logs match the current filters or search query. Administrative actions will automatically be recorded here.
              </p>
              {(actionFilter || searchQuery || roleFilter !== 'all') && (
                <button
                  onClick={() => {
                    setActionFilter('');
                    setSearchQuery('');
                    setRoleFilter('all');
                    setPage(1);
                  }}
                  className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            filteredLogs.map((log) => {
              const display = getActionDisplay(log.action);
              const ActionIcon = display.icon || Activity;
              const desc = buildActivityDescription(log);
              const hasMeta = log.meta && (typeof log.meta === 'object' ? Object.keys(log.meta).length > 0 : log.meta !== '{}');

              return (
                <div 
                  key={log.id} 
                  className="px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Left: Actor avatar + action details */}
                  <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black shrink-0 text-sm border shadow-sm ${display.bg} ${display.color}`}>
                      <ActionIcon className="w-5 h-5" />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-slate-900">
                          {log.actor_name || log.actor_email}
                        </span>
                        
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          log.actor_role === 'executive' 
                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {log.actor_role || 'Admin'}
                        </span>

                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${display.bg} ${display.color}`}>
                          {display.label}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>

                  {/* Right: Target pill + Meta inspect + Timestamp */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {log.target && (
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                        {log.target}
                      </span>
                    )}

                    {hasMeta && (
                      <button
                        onClick={() => setSelectedMetaLog(log)}
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                        title="View payload metadata"
                      >
                        <Code className="w-3.5 h-3.5 text-teal-600" />
                        <span>Payload</span>
                      </button>
                    )}

                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 justify-end">
                        <Clock3 className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Pagination Footer ── */}
        {pagination && (
          <div className="px-8 py-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Showing page <strong className="text-slate-900">{pagination.page}</strong> of <strong className="text-slate-900">{pagination.pages || 1}</strong> ({pagination.total} total recorded actions)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-all flex items-center gap-1 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.pages || 1) }).map((_, i) => {
                  const pNum = i + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        page === pNum
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(pagination.pages || 1, p + 1))}
                disabled={page >= (pagination.pages || 1) || loading}
                className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-all flex items-center gap-1 shadow-sm"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Payload Metadata Inspection Modal ── */}
      {selectedMetaLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-black text-slate-900">Change Details Payload</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Log #{selectedMetaLog.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {buildActivityDescription(selectedMetaLog)}
                </p>
              </div>
              <button
                onClick={() => setSelectedMetaLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Actor</span>
                  <span className="font-bold text-slate-900">{selectedMetaLog.actor_name || selectedMetaLog.actor_email}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Target</span>
                  <span className="font-mono font-bold text-slate-900">{selectedMetaLog.target || 'None'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">Raw JSON Metadata</span>
                <pre className="p-4 bg-slate-950 text-teal-400 rounded-2xl text-xs font-mono overflow-x-auto max-h-60 border border-slate-800">
                  {JSON.stringify(
                    typeof selectedMetaLog.meta === 'string'
                      ? JSON.parse(selectedMetaLog.meta || '{}')
                      : selectedMetaLog.meta,
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedMetaLog(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
