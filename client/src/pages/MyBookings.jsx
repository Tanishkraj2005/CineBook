import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import BookingCard from '../components/booking/BookingCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Ticket, Film, Calendar, Clock, AlertTriangle, X } from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming | past

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getMyBookings({ limit: 50 });
      if (res.success && res.data) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
      toast.error('Could not fetch your booking history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings into upcoming and past
  const now = new Date();
  const upcomingBookings = bookings.filter((b) => {
    if (b.bookingStatus === 'cancelled') return false;
    const show = b.showId;
    if (!show || !show.showDate) return false;
    const showDate = new Date(show.showDate);
    if (show.startTime) {
      const [h, m] = show.startTime.split(':');
      showDate.setHours(parseInt(h, 10), parseInt(m, 10));
    }
    return showDate >= now;
  });

  const pastBookings = bookings.filter((b) => {
    if (b.bookingStatus === 'cancelled') return true;
    const show = b.showId;
    if (!show || !show.showDate) return true;
    const showDate = new Date(show.showDate);
    if (show.startTime) {
      const [h, m] = show.startTime.split(':');
      showDate.setHours(parseInt(h, 10), parseInt(m, 10));
    }
    return showDate < now;
  });

  const handleOpenCancelModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingId) return;
    try {
      setCancelling(true);
      const res = await cancelBooking(selectedBookingId, cancelReason);
      if (res.success) {
        toast.success('Booking cancelled and refund simulated');
        setCancelModalOpen(false);
        fetchBookings();
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Could not cancel booking';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  const displayList = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cinema-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Ticket className="text-cinema-accent" />
            My Cinema Bookings
          </h1>
          <p className="text-xs sm:text-sm text-cinema-muted mt-1">
            Track active tickets, access entry QR codes, or review past movie history
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-cinema-surface-2 p-1 rounded-lg border border-cinema-border text-xs">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-cinema-accent text-white shadow'
                : 'text-cinema-muted hover:text-white'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'past'
                ? 'bg-cinema-accent text-white shadow'
                : 'text-cinema-muted hover:text-white'
            }`}
          >
            Past / Cancelled ({pastBookings.length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading booking history..." />
        </div>
      ) : displayList.length > 0 ? (
        <div className="space-y-4">
          {displayList.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancelClick={handleOpenCancelModal}
            />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center max-w-md mx-auto space-y-4">
          <Film size={36} className="mx-auto text-cinema-muted" />
          <h3 className="text-base font-bold text-white">
            {activeTab === 'upcoming' ? 'No Upcoming Bookings' : 'No Past Bookings'}
          </h3>
          <p className="text-xs text-cinema-muted">
            {activeTab === 'upcoming'
              ? 'You have no active cinema reservations scheduled. Find something great to watch!'
              : 'You have not completed any cinema bookings yet.'}
          </p>
          <Link to="/movies" className="btn-primary inline-flex items-center gap-2 text-xs">
            <span>Browse Movies</span>
          </Link>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-md w-full p-6 space-y-4 border-cinema-border shadow-2xl relative">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="absolute top-4 right-4 text-cinema-muted hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cancel Booking?</h3>
                <p className="text-xs text-cinema-muted">Reference #{selectedBookingId}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to cancel this booking? The assigned seats will be released back to the auditorium immediately and a full simulated refund will be processed.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-cinema-muted">
                Reason for cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="input-field text-xs cursor-pointer"
              >
                <option value="Change of plans">Change of plans</option>
                <option value="Booked incorrect showtime">Booked incorrect showtime</option>
                <option value="Personal emergency">Personal emergency</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-cinema-border/50">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="btn-secondary text-xs !py-1.5 !px-3"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs px-3.5 py-1.5 rounded transition-colors"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
