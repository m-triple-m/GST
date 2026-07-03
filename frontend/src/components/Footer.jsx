import { Link, useNavigate } from 'react-router-dom';
import { Globe, Mail, MapPin, ExternalLink, ArrowUp, Link2, MessageSquare, Play } from 'lucide-react';

const footerLinks = {
  'Navigation': [
    { label: 'Home', href: '/' },
    { label: 'Upcoming Events', href: '/events' },
    { label: 'Monthly Luncheons', href: '/events?type=luncheon' },
    { label: 'Membership', href: '/membership' },
    { label: 'About GST', href: '/#about' },
    { label: 'Contact', href: '/#contact' },
  ],
  'Membership': [
    { label: 'Student Membership', href: '/membership' },
    { label: 'Professional Membership', href: '/membership' },
    { label: 'Corporate Sponsorship', href: '/membership' },
    { label: 'Golf Sponsorship', href: '/events' },
    { label: 'Donate to GST', href: '/donate' },
  ],
  'Affiliates': [
    { label: 'SEG – Soc. of Exploration Geophysicists', href: 'https://seg.org', external: true },
    { label: 'AAPG – American Assoc. of Petroleum Geologists', href: 'https://aapg.org', external: true },
    { label: 'SPE – Soc. of Petroleum Engineers', href: 'https://spe.org', external: true },
    { label: 'Tulsa Geological Society', href: '#', external: true },
    { label: 'University of Tulsa Geosciences', href: 'https://utulsa.edu', external: true },
  ],
};

export default function Footer() {
  const navigate = useNavigate();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  
  const handleNavClick = (href) => {
    if (href.startsWith('/#')) {
      navigate('/');
      setTimeout(() => {
        const el = document.querySelector(href.substring(1));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else if (href.startsWith('/')) {
      navigate(href);
      window.scrollTo(0, 0);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center shadow-lg">
                <Globe className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="text-white font-bold text-sm tracking-wide">GST</div>
                <div className="text-slate-500 text-xs tracking-wider">Geophysical Society of Tulsa</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              The Geophysical Society of Tulsa has proudly served Oklahoma's geophysical community since 1947, 
              as the first local section of the Society of Exploration Geophysicists.
            </p>

            {/* Address */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="text-white font-medium">Mailing Address</p>
                  <p className="text-slate-400">P.O. Box 2784</p>
                  <p className="text-slate-400">Tulsa, Oklahoma 74101</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-teal-500 shrink-0" />
                <a href="mailto:info@gst-tulsa.org" className="text-sm text-slate-400 hover:text-teal-400 transition-colors duration-200">
                  info@gst-tulsa.org
                </a>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              {[
                { icon: Link2, href: '#', label: 'LinkedIn' },
                { icon: MessageSquare, href: '#', label: 'Twitter' },
                { icon: Play, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-teal-500/20 border border-slate-700 hover:border-teal-500/50 flex items-center justify-center transition-all duration-200 group"
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-teal-400 transition-colors duration-200" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-bold text-sm mb-5 tracking-wide">{category}</h4>
              <ul className="space-y-3">
                {links.map(({ label, href, external }) => (
                  <li key={label}>
                    {external ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-teal-400 text-sm transition-colors duration-200 flex items-center gap-1.5 group"
                      >
                        <span className="group-hover:underline">{label}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </a>
                    ) : (
                      <Link
                        to={href}
                        onClick={() => window.scrollTo(0, 0)}
                        className="text-slate-400 hover:text-teal-400 text-sm transition-colors duration-200 text-left hover:underline"
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} Geophysical Society of Tulsa · 501(c)(3) Non-Profit Organization ·{' '}
            <a
              href="https://gst.wildapricot.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-400 transition-colors duration-200"
            >
              gst.wildapricot.org
            </a>
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-600">Proud affiliate of the SEG</span>
            <button
              id="scroll-to-top"
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="w-8 h-8 rounded-lg bg-teal-500/10 hover:bg-teal-500 border border-teal-500/30 hover:border-teal-500 flex items-center justify-center transition-all duration-200 group"
            >
              <ArrowUp className="w-4 h-4 text-teal-500 group-hover:text-white transition-colors duration-200" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
