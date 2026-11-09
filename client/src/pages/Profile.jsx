import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/authService';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Shield, Lock, Calendar, KeyRound, Ticket } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, isAdmin } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    try {
      setSaving(true);
      const res = await changePassword(oldPassword, newPassword);
      if (res.success) {
        toast.success('Password changed successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to change password';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header */}
      <div className="card p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border-cinema-border">
        <div className="w-20 h-20 rounded-full bg-cinema-surface-2 border-2 border-cinema-accent flex items-center justify-center text-cinema-accent font-bold text-2xl uppercase shadow-xl flex-shrink-0">
          {user?.name ? user.name.slice(0, 2) : 'CB'}
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">{user?.name}</h1>
            <span
              className={`badge ${
                isAdmin
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-cinema-accent/10 text-cinema-accent border border-cinema-accent/30'
              }`}
            >
              {isAdmin ? 'Administrator' : 'Customer'}
            </span>
          </div>

          <p className="text-xs text-cinema-muted flex items-center justify-center sm:justify-start gap-1.5">
            <Mail size={13} />
            <span>{user?.email}</span>
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-cinema-muted">
            {user?.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={13} />
                <span>{user.phone}</span>
              </span>
            )}
            {user?.createdAt && (
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                <span>Member since {formatDate(user.createdAt)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
          <Link to="/my-bookings" className="btn-secondary text-xs !py-2 !px-3 text-center flex-1">
            My Bookings
          </Link>
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold text-center flex-1"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Change Password Form */}
      <div className="card p-6 sm:p-8 space-y-6 max-w-xl border-cinema-border">
        <div className="flex items-center gap-2.5 border-b border-cinema-border/60 pb-3">
          <KeyRound size={18} className="text-cinema-accent" />
          <h2 className="text-base font-bold text-white">Change Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-cinema-text">Current Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-muted" />
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Current account password"
                className="input-field !pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-cinema-text">New Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-muted" />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="input-field !pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-cinema-text">Confirm New Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-muted" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="input-field !pl-9"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary py-2 px-5 text-xs font-medium shadow-md"
          >
            {saving ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
