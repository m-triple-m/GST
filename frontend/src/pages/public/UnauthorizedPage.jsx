import { Link, useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

/**
 * UnauthorizedPage — shown when a user's role doesn't permit access.
 */
export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl" />

      <div className="relative text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-rose-400" />
        </div>

        <h1 className="text-4xl font-black mb-3 tracking-tight">Access Denied</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          You don't have the required permissions to view this page.
          Contact your administrator if you believe this is a mistake.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold transition-all border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-sm font-bold transition-all shadow-lg shadow-teal-500/20"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
