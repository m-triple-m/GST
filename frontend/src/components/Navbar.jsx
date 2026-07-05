import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe, Menu, X, ChevronDown, LogIn, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const navLinks = [
  { label: 'Home', href: '/' },
  {
    label: 'Events', href: '/events',
    children: [
      { label: 'All Events', href: '/events' },
      { label: 'Upcoming Events', href: '/events?status=upcoming' },
      { label: 'Past Events', href: '/events?status=past' },
    ]
  },
  { label: 'Membership', href: '/membership' },
  { label: 'Sponsorship', href: '/sponsor' },
  {
    label: 'About', href: '/about',
    children: [
      { label: 'Executive Board', href: '/executive' },
      { label: 'History & Mission', href: '/about' },
      { label: 'Contact Us', href: '/contact' },
    ]
  },
  { label: 'Resources', href: '/resources' },
  { label: 'Donate', href: '/donate' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleHashNav = (href) => {
    if (href.startsWith('/#')) {
      const hash = href.replace('/#', '#');
      if (isHome) {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 300);
      }
    } else {
      navigate(href);
    }
    setMobileOpen(false);
    setActiveDropdown(null);
  };

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href.split('?')[0]) && href !== '/';
  };

  const navBg = isHome
    ? scrolled ? 'nav-scrolled' : 'bg-transparent'
    : 'nav-scrolled';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                <Globe className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
            </div>
            <div className="leading-tight">
              <div className="text-white font-bold text-sm tracking-wide">GST</div>
              <div className="text-slate-400 text-xs font-medium tracking-wider uppercase hidden sm:block">Geophysical Society of Tulsa</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => handleHashNav(link.href)}
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive(link.href)
                      ? 'text-teal-400 bg-teal-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                  {link.children && (
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === link.label ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {link.children && activeDropdown === link.label && (
                  <div className="absolute top-full left-0 pt-2">
                    <div className="w-52 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl animate-fade-in">
                      {link.children.map((child) => (
                        <button
                          key={child.label}
                          onClick={() => handleHashNav(child.href)}
                          className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-teal-500/10 border-l-2 border-transparent hover:border-teal-500 transition-all duration-150"
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated && (
              <Link to="/cart" className="p-2 text-slate-300 hover:text-teal-400 transition-colors relative group">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-teal-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none border border-slate-900 min-w-[18px] min-h-[18px] px-0.5">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            )}
            <Link to="/membership" className="px-4 py-2 text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors duration-200">
              Join GST
            </Link>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn-teal flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-lg"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="btn-teal flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-lg"
              >
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Member Portal
                </span>
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            id="mobile-menu-toggle"
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors duration-200"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden mobile-menu-enter ${mobileOpen ? 'mobile-menu-open' : ''} bg-slate-900/98 backdrop-blur-xl border-t border-white/10`}>
        <div className="px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <div key={link.label}>
              <button
                onClick={() => {
                  if (link.children) {
                    setMobileExpanded(mobileExpanded === link.label ? null : link.label);
                  } else {
                    handleHashNav(link.href);
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive(link.href)
                    ? 'text-teal-400 bg-teal-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
                {link.children && (
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileExpanded === link.label ? 'rotate-180' : ''}`} />
                )}
              </button>
              {link.children && mobileExpanded === link.label && (
                <div className="ml-4 mt-1 space-y-1">
                  {link.children.map((child) => (
                    <button
                      key={child.label}
                      onClick={() => handleHashNav(child.href)}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-400 hover:text-teal-400 hover:bg-teal-500/5 rounded-lg transition-all duration-150 border-l-2 border-slate-700 hover:border-teal-500"
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <Link to="/membership" className="block w-full text-center px-4 py-3 text-sm font-medium text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors duration-200">
              Join GST
            </Link>
            <Link
              to="/login"
              className="btn-teal flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-white rounded-lg"
            >
              <span className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Member Portal
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
