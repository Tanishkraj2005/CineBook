import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Film, Lock, Mail, ArrowRight, Sparkles, Shield, User } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.success) {
        toast.success(`Welcome back, ${res.data.user.name}!`);
        const isUserAdmin = res.data?.user?.role === 'admin';
        const target = isUserAdmin && from === '/' ? '/admin/dashboard' : from;
        navigate(target, { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Authentication failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    toast.success(`Filled ${demoEmail}`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl border-cinema-border">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-xl bg-cinema-accent flex items-center justify-center text-white mx-auto shadow-lg shadow-cinema-accent/30">
            <Film size={22} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sign In to CineBook</h1>
          <p className="text-xs text-cinema-muted">
            Access your bookings, saved seats, and special cinema offers
          </p>
        </div>

        {/* Quick Demo Credentials helper buttons */}
        <div className="bg-cinema-surface-2 p-3 rounded-lg border border-cinema-border space-y-2 text-xs">
          <span className="text-[11px] font-semibold text-cinema-muted uppercase tracking-wider block">
            Demo Accounts:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@cinebook.com', 'Admin@123')}
              className="px-2.5 py-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Shield size={12} />
              <span>Admin Account</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('rahul@example.com', 'Password@123')}
              className="px-2.5 py-1.5 rounded bg-cinema-accent/10 border border-cinema-accent/30 text-cinema-accent hover:bg-cinema-accent/20 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <User size={12} />
              <span>Customer Account</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-cinema-text">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="input-field !pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-cinema-text">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field !pl-9"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg shadow-cinema-accent/20 mt-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Footer link to Register */}
        <div className="text-center text-xs text-cinema-muted pt-2 border-t border-cinema-border/50">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-cinema-accent font-semibold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
