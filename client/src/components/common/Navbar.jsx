import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CITIES } from '../../utils/constants';
import {
  Film,
  MapPin,
  User,
  Ticket,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCity, setSelectedCity] = useState(
    localStorage.getItem('cinebook_city') || 'Delhi'
  );
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cityRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setCityDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setCityDropdownOpen(false);
  }, [location.pathname]);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    localStorage.setItem('cinebook_city', city);
    setCityDropdownOpen(false);
    // Trigger custom event so page components can listen
    window.dispatchEvent(new CustomEvent('cityChange', { detail: city }));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Movies', path: '/movies' },
    { label: 'Cinemas', path: '/movies?tab=cinemas' },
    ...(isAuthenticated ? [{ label: 'My Bookings', path: '/my-bookings' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-cinema-bg/95 backdrop-blur-md border-b border-cinema-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-cinema-accent flex items-center justify-center text-white shadow-md shadow-cinema-accent/20 group-hover:bg-cinema-accent-hover transition-colors">
                <Film size={20} className="transform group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                  Cine<span className="text-cinema-accent">Book</span>
                </span>
                <span className="text-[10px] text-cinema-muted tracking-wider uppercase hidden sm:inline -mt-1 font-medium">
                  Cinema Booking
                </span>
              </div>
            </Link>

            {/* City Selector */}
            <div className="relative" ref={cityRef}>
              <button
                type="button"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-1.5 text-xs text-cinema-text bg-cinema-surface hover:bg-cinema-surface-2 border border-cinema-border px-2.5 py-1.5 rounded-md transition-colors"
              >
                <MapPin size={13} className="text-cinema-accent" />
                <span className="font-medium">{selectedCity}</span>
                <ChevronDown size={12} className="text-cinema-muted ml-0.5" />
              </button>

              {cityDropdownOpen && (
                <div className="absolute left-0 mt-2 w-40 bg-cinema-surface border border-cinema-border rounded-lg shadow-xl py-1 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-cinema-muted uppercase tracking-wider">
                    Select Location
                  </div>
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-cinema-surface-2 transition-colors ${
                        selectedCity === city
                          ? 'text-cinema-accent font-semibold bg-cinema-accent/10'
                          : 'text-cinema-text'
                      }`}
                    >
                      {city}
                      {selectedCity === city && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cinema-accent" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.path.split('?')[0]);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-cinema-accent bg-cinema-accent/10'
                      : 'text-cinema-muted hover:text-white hover:bg-cinema-surface'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: User Profile / Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-xs font-semibold transition-colors"
              >
                <Shield size={13} />
                <span>Admin Panel</span>
              </Link>
            )}
            {isAuthenticated ? (
              <div className="relative" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-cinema-surface transition-colors border border-transparent hover:border-cinema-border"
                >
                  <div className="w-8 h-8 rounded-full bg-cinema-surface-2 border border-cinema-border flex items-center justify-center text-cinema-accent font-bold text-xs uppercase">
                    {user?.name ? user.name.slice(0, 2) : 'CB'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-medium text-cinema-text leading-tight truncate max-w-[120px]">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-cinema-muted capitalize leading-none mt-0.5">
                      {user?.role}
                    </p>
                  </div>
                  <ChevronDown size={14} className="text-cinema-muted" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-cinema-surface border border-cinema-border rounded-lg shadow-2xl py-1.5 z-50 divide-y divide-cinema-border/60">
                    <div className="px-4 py-2.5">
                      <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-cinema-muted truncate mt-0.5">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-400 hover:bg-cinema-surface-2 font-medium transition-colors"
                        >
                          <Shield size={14} />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/my-bookings"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-cinema-text hover:bg-cinema-surface-2 transition-colors"
                      >
                        <Ticket size={14} className="text-cinema-muted" />
                        My Bookings
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-cinema-text hover:bg-cinema-surface-2 transition-colors"
                      >
                        <User size={14} className="text-cinema-muted" />
                        Account Settings
                      </Link>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn-ghost text-xs font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs !py-1.5 !px-3.5 flex items-center gap-1.5"
                >
                  <Sparkles size={13} />
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-cinema-muted hover:text-white hover:bg-cinema-surface"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cinema-surface border-b border-cinema-border px-4 pt-2 pb-4 space-y-2">
          <div className="py-2 border-b border-cinema-border/50 flex items-center justify-between">
            <span className="text-xs text-cinema-muted">Location</span>
            <div className="flex gap-1 overflow-x-auto">
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => handleCitySelect(c)}
                  className={`text-xs px-2 py-0.5 rounded ${
                    selectedCity === c ? 'bg-cinema-accent text-white font-medium' : 'bg-cinema-surface-2 text-cinema-muted'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 pt-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block px-3 py-2 rounded-md text-sm text-cinema-text hover:bg-cinema-surface-2"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-cinema-border/50">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-1 text-xs text-cinema-muted">
                  Signed in as <span className="text-white font-semibold">{user?.name}</span>
                </div>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="block px-3 py-2 rounded-md text-xs font-semibold text-amber-400 bg-amber-500/10"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-sm text-cinema-text hover:bg-cinema-surface-2"
                >
                  Account Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link to="/login" className="btn-secondary text-center text-xs py-2">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-center text-xs py-2">
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

