import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Film,
  Building2,
  Tv,
  Calendar,
  Ticket,
  Users,
  Settings,
  ArrowLeft,
  LogOut,
  Shield,
  X,
  QrCode,
  BarChart3,
} from 'lucide-react';

export default function Sidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Manage Movies', path: '/admin/movies', icon: Film },
    { label: 'Manage Cinemas', path: '/admin/cinemas', icon: Building2 },
    { label: 'Manage Screens', path: '/admin/screens', icon: Tv },
    { label: 'Manage Shows', path: '/admin/shows', icon: Calendar },
    { label: 'Manage Bookings', path: '/admin/bookings', icon: Ticket },
    { label: 'Ticket Gate / QR', path: '/admin/verify-tickets', icon: QrCode },
    { label: 'Occupancy & Audit', path: '/admin/reports', icon: BarChart3 },
    { label: 'Manage Customers', path: '/admin/customers', icon: Users },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const content = (
    <div className="h-full flex flex-col bg-cinema-surface border-r border-cinema-border">
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-cinema-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shield size={18} />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">
              Cine<span className="text-cinema-accent">Book</span>
            </span>
            <span className="block text-[10px] text-amber-400 font-semibold tracking-wider uppercase -mt-1">
              Admin Portal
            </span>
          </div>
        </div>
        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="md:hidden text-cinema-muted hover:text-white"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-cinema-muted uppercase tracking-wider">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cinema-accent text-white shadow-md shadow-cinema-accent/10 font-semibold'
                  : 'text-cinema-muted hover:text-white hover:bg-cinema-surface-2'
              }`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile / Quick Actions */}
      <div className="p-3 border-t border-cinema-border space-y-1.5">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-cinema-muted hover:text-white hover:bg-cinema-surface-2 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to CineBook</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>

        <div className="pt-2 px-3 text-[11px] text-cinema-muted/60 flex items-center justify-between">
          <span className="truncate max-w-[130px]">{user?.email}</span>
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" title="Online" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 flex-shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-xs h-full z-10 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

