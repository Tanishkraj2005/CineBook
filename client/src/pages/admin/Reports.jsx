import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getReports } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Building2,
  Percent,
} from 'lucide-react';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('occupancy'); // 'occupancy' | 'audit' | 'revenue'

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const res = await getReports();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Generating Occupancy & Audit Reports..." />
      </div>
    );
  }

  const occupancyList = data?.occupancyReport || [];
  const auditLogs = data?.auditLogs || [];
  const movieRevenue = data?.movieRevenue || [];

  // Summary Metrics
  const totalOccupiedSeats = occupancyList.reduce((acc, s) => acc + s.confirmedSeats, 0);
  const totalCancelledSeats = occupancyList.reduce((acc, s) => acc + s.cancelledSeats, 0);
  const totalCapacityAcrossShows = occupancyList.reduce((acc, s) => acc + s.totalCapacity, 0);
  const avgOccupancy = totalCapacityAcrossShows > 0
    ? ((totalOccupiedSeats / totalCapacityAcrossShows) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cinema-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="text-cinema-accent" />
            Cinema Occupancy, Sales & Audit Reports
          </h1>
          <p className="text-xs text-cinema-muted mt-0.5">
            Real-time audit trail and auditorium occupancy reconciling confirmed bookings, seats, and customer cancellations.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-cinema-surface-2 p-1 rounded-lg border border-cinema-border text-xs">
          <button
            onClick={() => setActiveTab('occupancy')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'occupancy'
                ? 'bg-cinema-accent text-white shadow'
                : 'text-cinema-muted hover:text-white'
            }`}
          >
            Occupancy Overview
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'audit'
                ? 'bg-cinema-accent text-white shadow'
                : 'text-cinema-muted hover:text-white'
            }`}
          >
            Audit Trail ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'revenue'
                ? 'bg-cinema-accent text-white shadow'
                : 'text-cinema-muted hover:text-white'
            }`}
          >
            Movie Gross
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 border-cinema-border space-y-1">
          <span className="text-[11px] text-cinema-muted font-medium uppercase tracking-wider">
            Overall Occupancy
          </span>
          <p className="text-2xl font-extrabold text-white flex items-center gap-1.5">
            <Percent size={18} className="text-cinema-accent" />
            {avgOccupancy}%
          </p>
          <p className="text-[11px] text-zinc-400">across scheduled screenings</p>
        </div>

        <div className="card p-4 border-cinema-border space-y-1">
          <span className="text-[11px] text-cinema-muted font-medium uppercase tracking-wider">
            Confirmed Seats
          </span>
          <p className="text-2xl font-extrabold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 size={18} />
            {totalOccupiedSeats}
          </p>
          <p className="text-[11px] text-zinc-400">admitted / active tickets</p>
        </div>

        <div className="card p-4 border-cinema-border space-y-1">
          <span className="text-[11px] text-cinema-muted font-medium uppercase tracking-wider">
            Cancelled Seats
          </span>
          <p className="text-2xl font-extrabold text-amber-400 flex items-center gap-1.5">
            <XCircle size={18} />
            {totalCancelledSeats}
          </p>
          <p className="text-[11px] text-zinc-400">refunded & seats released</p>
        </div>

        <div className="card p-4 border-cinema-border space-y-1">
          <span className="text-[11px] text-cinema-muted font-medium uppercase tracking-wider">
            Audit Logs Logged
          </span>
          <p className="text-2xl font-extrabold text-sky-400 flex items-center gap-1.5">
            <FileText size={18} />
            {auditLogs.length}
          </p>
          <p className="text-[11px] text-zinc-400">verifiable state mutations</p>
        </div>
      </div>

      {/* TAB 1: OCCUPANCY REPORT TABLE */}
      {activeTab === 'occupancy' && (
        <div className="card overflow-hidden border-cinema-border shadow-xl space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-cinema-border/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-cinema-accent" />
                <span>Auditorium Occupancy & Seat Reconciliation</span>
              </h2>
              <p className="text-xs text-cinema-muted">
                Auditorium capacity reconciled against confirmed orders, occupied seats, and processed cancellations.
              </p>
            </div>
            <button
              onClick={fetchReportsData}
              className="text-xs text-cinema-accent hover:underline font-medium"
            >
              Refresh Real-Time Data
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cinema-surface-2 border-b border-cinema-border text-cinema-muted uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-3 px-3">Movie & Theatre</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3 text-center">Capacity</th>
                  <th className="py-3 px-3 text-center">Confirmed</th>
                  <th className="py-3 px-3 text-center">Cancelled</th>
                  <th className="py-3 px-3 text-center">Available</th>
                  <th className="py-3 px-3 text-right">Occupancy %</th>
                  <th className="py-3 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-border/50 text-cinema-text">
                {occupancyList.map((row) => (
                  <tr key={row.showId} className="hover:bg-cinema-surface-2/60 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-white text-sm">{row.movieTitle}</p>
                      <p className="text-[11px] text-cinema-muted">
                        {row.cinemaName} • <span className="text-zinc-300">{row.screenName}</span> ({row.city})
                      </p>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <p className="font-medium text-white">{formatDate(row.showDate)}</p>
                      <p className="text-[11px] text-cinema-muted font-mono">{row.startTime}</p>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-zinc-300">
                      {row.totalCapacity}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                        {row.confirmedSeats} ({row.confirmedBookingsCount} orders)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {row.cancelledSeats > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-bold">
                          {row.cancelledSeats} ({row.cancelledBookingsCount} refunded)
                        </span>
                      ) : (
                        <span className="text-zinc-600 font-mono">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-zinc-400">
                      {row.availableSeats}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-zinc-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                          <div
                            className="bg-cinema-accent h-full rounded-full"
                            style={{ width: `${Math.min(100, row.occupancyRate)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-white">
                          {row.occupancyRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                      {formatCurrency(row.confirmedRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT TRAIL LOGS */}
      {activeTab === 'audit' && (
        <div className="card overflow-hidden border-cinema-border shadow-xl p-5 space-y-4">
          <div className="border-b border-cinema-border/60 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-sky-400" />
              <span>Immutable Business Audit Trail</span>
            </h2>
            <p className="text-xs text-cinema-muted">
              Records critical state mutations: Booking reservations, simulated payments, gate QR admissions, and cancellations.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cinema-surface-2 border-b border-cinema-border text-cinema-muted uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Action Event</th>
                  <th className="py-3 px-3">Entity ID</th>
                  <th className="py-3 px-3">Performed By</th>
                  <th className="py-3 px-3">Event Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-border/50 text-cinema-text font-mono">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-cinema-surface-2/60 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap text-cinema-muted text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                          log.action === 'TICKET_ADMITTED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : log.action === 'PAYMENT_COMPLETED'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : log.action === 'BOOKING_CANCELLED'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      {log.entityId}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-300 font-sans">
                      {log.performedBy ? (
                        <span>
                          {log.performedBy.name}{' '}
                          <span className="text-[10px] text-cinema-muted">({log.performedBy.role})</span>
                        </span>
                      ) : (
                        <span className="text-zinc-500">System</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400 text-[11px] font-mono truncate max-w-xs">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MOVIE REVENUE AGGREGATION */}
      {activeTab === 'revenue' && (
        <div className="card overflow-hidden border-cinema-border shadow-xl p-5 space-y-4">
          <div className="border-b border-cinema-border/60 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-cinema-accent" />
              <span>Movie Gross Revenue Breakdown</span>
            </h2>
            <p className="text-xs text-cinema-muted">
              Cumulative ticket sales grouped by movie title.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {movieRevenue.map((m) => (
              <div
                key={m._id}
                className="bg-cinema-surface-2/60 border border-cinema-border rounded-xl p-4 space-y-2 hover:border-cinema-muted transition-colors"
              >
                <h3 className="font-bold text-white text-sm">{m.title}</h3>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-cinema-muted">Total Bookings:</span>
                  <span className="font-bold text-zinc-200">{m.totalBookings} orders</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-cinema-border/40 pt-2">
                  <span className="text-cinema-muted">Gross Revenue:</span>
                  <span className="font-mono font-extrabold text-emerald-400 text-sm">
                    {formatCurrency(m.totalRevenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

