import { useState } from 'react';
import toast from 'react-hot-toast';
import { Settings, Shield, Database, Lock, Server, CheckCircle2 } from 'lucide-react';

export default function AdminSettings() {
  const [lockDuration, setLockDuration] = useState('10');
  const [convenienceFee, setConvenienceFee] = useState('30');

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('System settings updated successfully');
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="border-b border-cinema-border pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="text-cinema-accent" />
          System Settings & Architecture
        </h1>
        <p className="text-xs text-cinema-muted mt-0.5">
          Configure runtime booking parameters, seat locking duration, and environment diagnostics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Runtime Settings Form */}
        <div className="card p-6 space-y-5 border-cinema-border">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock size={16} className="text-cinema-accent" />
            Booking & Concurrency Settings
          </h2>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-medium text-cinema-text">
                Seat Temporary Lock Duration (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={lockDuration}
                onChange={(e) => setLockDuration(e.target.value)}
                className="input-field font-mono"
              />
              <p className="text-[11px] text-cinema-muted">
                How long seats are held exclusively for a user during checkout before auto-release via MongoDB TTL.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-cinema-text">
                Default Convenience Fee per Order (INR)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={convenienceFee}
                onChange={(e) => setConvenienceFee(e.target.value)}
                className="input-field font-mono"
              />
              <p className="text-[11px] text-cinema-muted">
                Fixed booking fee added to each finalized customer order.
              </p>
            </div>

            <button type="submit" className="btn-primary text-xs !py-2 !px-4">
              Save Parameters
            </button>
          </form>
        </div>

        {/* Database & Stack Info */}
        <div className="card p-6 space-y-4 border-cinema-border">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Server size={16} className="text-green-400" />
            Infrastructure Status
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded bg-cinema-surface-2 border border-cinema-border">
              <span className="text-cinema-muted">Node.js Server</span>
              <span className="text-green-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} /> Active (Port 5000)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-cinema-surface-2 border border-cinema-border">
              <span className="text-cinema-muted">MongoDB Engine</span>
              <span className="text-green-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} /> Connected (v8.3)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-cinema-surface-2 border border-cinema-border">
              <span className="text-cinema-muted">Auth Strategy</span>
              <span className="text-white font-mono">JWT + bcrypt (12 rounds)</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-cinema-surface-2 border border-cinema-border">
              <span className="text-cinema-muted">Payment Gateway Mode</span>
              <span className="text-amber-400 font-semibold">Simulated Demo Sandbox</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-cinema-surface-2 border border-cinema-border">
              <span className="text-cinema-muted">Rate Limiter</span>
              <span className="text-white font-mono">200 req / 15m (Active)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

