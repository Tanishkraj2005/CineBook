import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllBookings } from '../../services/adminService';
import { cancelBooking } from '../../services/bookingService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import { Ticket, Search, Filter, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../../utils/constants';

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBookingsList = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await getAllBookings(params);
      if (res.success && res.data) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      toast.error('Failed to load bookings list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookingsList();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleAdminCancel = async (bookingId) => {
    if (!window.confirm(`Cancel booking #${bookingId} and simulate customer refund?`)) return;
    try {
      const res = await cancelBooking(bookingId, 'Administrative cancellation');
      if (res.success) {
        toast.success(`Booking #${bookingId} cancelled`);
        fetchBookingsList();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-cinema-border pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Ticket className="text-cinema-accent" />
          Manage Customer Bookings
        </h1>
        <p className="text-xs text-cinema-muted mt-0.5">
          Lookup ticket reservations, view payment states, and manage administrative cancellations
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-cinema-surface/80">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-muted" />
          <input
            type="text"
            placeholder="Search by Booking ID (e.g. CB-)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field !pl-9 !py-1.5 text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={15} className="text-cinema-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-cinema-surface-2 border border-cinema-border rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cinema-accent cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed Only</option>
            <option value="pending">Pending Only</option>
            <option value="cancelled">Cancelled Only</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="lg" text="Searching bookings..." />
        </div>
      ) : (
        <div className="card overflow-hidden shadow-xl border-cinema-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cinema-surface-2 border-b border-cinema-border text-cinema-muted uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Movie & Venue</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-border/50 text-cinema-text">
                {bookings.map((b) => {
                  const show = b.showId || {};
                  const movie = show.movieId || {};
                  const cinema = show.cinemaId || {};
                  const user = b.userId || {};

                  const statusBadge = BOOKING_STATUS[b.bookingStatus] || BOOKING_STATUS.pending;
                  const paymentBadge = PAYMENT_STATUS[b.paymentStatus] || PAYMENT_STATUS.pending;

                  const seatStr = b.seats?.map((s) => `${s.row}${s.seatNumber}`).join(', ') || 'N/A';

                  return (
                    <tr key={b._id} className="hover:bg-cinema-surface-2/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        <Link
                          to={`/booking/${b.bookingId}`}
                          className="hover:text-cinema-accent inline-flex items-center gap-1"
                        >
                          <span>{b.bookingId}</span>
                          <ExternalLink size={10} className="text-cinema-muted" />
                        </Link>
                        <span className="block text-[10px] text-cinema-muted font-normal">
                          {formatDate(b.createdAt)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-white">{user.name || 'Anonymous'}</p>
                        <p className="text-[11px] text-cinema-muted">{user.email}</p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-zinc-200">{movie.title || 'Movie'}</p>
                        <p className="text-[11px] text-cinema-muted">
                          {cinema.name} • {formatDate(show.showDate)}
                        </p>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-cinema-accent">
                        {seatStr}
                      </td>

                      <td className="py-3 px-4 font-bold text-white">
                        {formatCurrency(b.finalAmount)}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`badge ${statusBadge.badgeClass} text-[10px]`}>
                          {statusBadge.label}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`badge ${paymentBadge.badgeClass} text-[10px]`}>
                          {paymentBadge.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {b.bookingStatus === 'confirmed' && (
                          <button
                            onClick={() => handleAdminCancel(b.bookingId)}
                            className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:bg-red-500/10 px-2.5 py-1 rounded transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

