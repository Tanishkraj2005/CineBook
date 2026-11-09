import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Film, Lock, Mail, User, Phone, ArrowRight, Sparkles } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const res = await register(name, email, password, phone);
      if (res.success) {
        toast.success(`Welcome to CineBook, ${name}!`);
        navigate('/');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl border-cinema-border">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-xl bg-cinema-accent flex items-center justify-center text-white mx-auto shadow-lg shadow-cinema-accent/30">
            <Film size={22} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your CineBook Account</h1>
          <p className="text-xs text-cinema-muted">
            Book seats across all top Indian multiplex chains in seconds
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-cinema-text">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-muted" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Verma"
                className="input-field !pl-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-cinema-text">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@example.com"
                className="input-field !pl-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-cinema-text">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-muted" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                className="input-field !pl-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-cinema-text">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-muted" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="input-field !pl-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-cinema-text">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-muted" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="input-field !pl-9"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg shadow-cinema-accent/20 mt-4"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register Account</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Footer link to Login */}
        <div className="text-center text-xs text-cinema-muted pt-2 border-t border-cinema-border/50">
          Already have an account?{' '}
          <Link to="/login" className="text-cinema-accent font-semibold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
