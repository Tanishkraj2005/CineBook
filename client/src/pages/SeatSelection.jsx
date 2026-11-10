import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getShowSeats, lockSeats } from '../services/seatService';
import { getShow } from '../services/showService';
import SeatMap from '../components/seat/SeatMap';
import SeatLegend from '../components/seat/SeatLegend';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import {
  Film,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Ticket,
} from 'lucide-react';

export default function SeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showData, setShowData] = useState(null);
  const [seatLayout, setSeatLayout] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [seatsRes, showRes] = await Promise.all([
          getShowSeats(showId),
          getShow(showId),
        ]);

        if (seatsRes.success && seatsRes.data) {
          setSeatLayout(seatsRes.data.rows || []);
        }

        if (showRes.success && showRes.data) {
          setShowData(showRes.data);
        }
      } catch (err) {
        console.error('Failed to load seat data:', err);
        toast.error('Could not load cinema seat map');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showId]);

  const handleSeatClick = (rowLabel, seat) => {
    // Check if already selected -> toggle
    const exists = selectedSeats.some(
      (s) => s.row === rowLabel && s.seatNumber === seat.seatNumber
    );

    if (exists) {
      setSelectedSeats(
        selectedSeats.filter(
          (s) => !(s.row === rowLabel && s.seatNumber === seat.seatNumber)
        )
      );
    } else {
      // Limit to 10 seats per booking
      if (selectedSeats.length >= 10) {
        toast.error('You can select a maximum of 10 seats per transaction');
        return;
      }
      setSelectedSeats([
        ...selectedSeats,
        {
          row: rowLabel,
          seatNumber: seat.seatNumber,
          category: seat.category,
          price: seat.price,
        },
      ]);
    }
  };

  // Pricing calculations
  const seatSubtotal = selectedSeats.reduce((acc, s) => acc + (s.price || 200), 0);
  const convenienceFee = selectedSeats.length > 0 ? 30 : 0;
  const totalAmount = seatSubtotal + convenienceFee;

  const handleProceedToCheckout = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat to continue');
      return;
    }

    if (!isAuthenticated) {
      toast('Please sign in to complete your seat reservation', { icon: '🔑' });
      navigate('/login', { state: { from: { pathname: `/shows/${showId}/seats` } } });
      return;
    }

    try {
      setSubmitting(true);
      // Attempt atomic seat locking in database
      const lockRes = await lockSeats(
        showId,
        selectedSeats.map((s) => ({ row: s.row, seatNumber: s.seatNumber }))
      );

      if (lockRes.success) {
        toast.success('Seats held successfully! Complete booking within 10 minutes.');
        // Store booking intent in sessionStorage
        sessionStorage.setItem(
          'cinebook_booking_intent',
          JSON.stringify({
            showId,
            show: showData,
            selectedSeats,
            seatSubtotal,
            convenienceFee,
            totalAmount,
            lockExpiresAt: lockRes.data.expiresAt,
          })
        );
        navigate('/checkout');
      }
    } catch (err) {
      console.error('Lock seats failed:', err);
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Could not lock selected seats. They may have been booked or held by another user.';
      toast.error(errMsg);
      // Refresh seat layout to reflect current availability
      try {
        const refreshRes = await getShowSeats(showId);
        if (refreshRes.success && refreshRes.data) {
          setSeatLayout(refreshRes.data.rows || []);
        }
      } catch (e) {
        // ignore
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Preparing seat map..." />
      </div>
    );
  }

  const movie = showData?.movieId || {};
  const cinema = showData?.cinemaId || {};
  const screen = showData?.screenId || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Show Details Banner */}
      <div className="card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-cinema-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-cinema-muted">
            <Link to="/movies" className="hover:text-white">
              Movies
            </Link>
            <span>/</span>
            <Link to={`/movies/${movie._id}`} className="hover:text-white truncate max-w-[150px]">
              {movie.title}
            </Link>
            <span>/</span>
            <span className="text-white font-medium">Seat Selection</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {movie.title || 'Movie'}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-cinema-muted">
            <span className="flex items-center gap-1 text-zinc-300">
              <MapPin size={12} className="text-cinema-accent" />
              {cinema.name} • {screen.screenName || 'Screen 1'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-zinc-300">
              <Calendar size={12} />
              {formatDate(showData?.showDate)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-zinc-300">
              <Clock size={12} />
              {formatTime(showData?.startTime)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
          <ShieldCheck size={16} />
          <span>Real-time Atomic Seat Concurrency Active</span>
        </div>
      </div>

      {/* Seat Selection & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Main Seat Map Area */}
        <div className="lg:col-span-3 card p-4 sm:p-6 overflow-hidden">
          <SeatLegend />

          <div className="py-4">
            <SeatMap
              rows={seatLayout}
              selectedSeats={selectedSeats}
              onSeatClick={handleSeatClick}
            />
          </div>

          <div className="text-center pt-2 border-t border-cinema-border/50 text-xs text-cinema-muted">
            Click on an available seat to select or deselect. Maximum 10 seats allowed per transaction.
          </div>
        </div>

        {/* Booking Summary Sidebar */}
        <div className="lg:col-span-1 space-y-4 sticky top-20">
          <div className="card p-5 space-y-4 shadow-xl border-cinema-border">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-cinema-border/60 pb-3 flex items-center gap-2">
              <Ticket size={16} className="text-cinema-accent" />
              Booking Summary
            </h3>

            {/* Selected Seats List */}
            <div>
              <span className="text-xs text-cinema-muted block mb-1.5 font-medium">
                Selected Seats ({selectedSeats.length}):
              </span>
              {selectedSeats.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {selectedSeats.map((s) => (
                    <span
                      key={`${s.row}${s.seatNumber}`}
                      className="px-2 py-0.5 rounded bg-cinema-accent/20 border border-cinema-accent/40 text-cinema-accent font-mono text-xs font-bold"
                    >
                      {s.row}{s.seatNumber} (₹{s.price})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-cinema-muted italic py-1">
                  No seats selected yet. Click on any seat in the map.
                </p>
              )}
            </div>

            {/* Pricing breakdown */}
            <div className="space-y-2 pt-3 border-t border-cinema-border/60 text-xs">
              <div className="flex justify-between text-cinema-muted">
                <span>Tickets Subtotal</span>
                <span className="text-white font-medium">{formatCurrency(seatSubtotal)}</span>
              </div>
              <div className="flex justify-between text-cinema-muted">
                <span>Convenience Fee</span>
                <span className="text-white font-medium">{formatCurrency(convenienceFee)}</span>
              </div>
              <div className="flex justify-between text-cinema-muted">
                <span>Integrated GST</span>
                <span className="text-white font-medium">₹0 (Included)</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-cinema-border/60">
                <span>Total Payable</span>
                <span className="text-cinema-accent text-base">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Proceed Action Button */}
            <button
              type="button"
              disabled={selectedSeats.length === 0 || submitting}
              onClick={handleProceedToCheckout}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm shadow-lg shadow-cinema-accent/20"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Locking Seats...</span>
                </>
              ) : (
                <>
                  <span>Lock Seats & Checkout</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="text-[11px] text-cinema-muted text-center leading-tight">
              Seats will be reserved exclusively for you for 10 minutes upon proceeding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
