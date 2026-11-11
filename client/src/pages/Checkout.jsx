import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createBooking } from '../services/bookingService';
import { createPayment, verifyPayment } from '../services/paymentService';
import { releaseSeats } from '../services/seatService';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Film,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  QrCode,
  Building,
  ShieldCheck,
  Timer,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();

  const [intent, setIntent] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [paymentMethod, setPaymentMethod] = useState('upi'); // upi, card, cash
  const [submitting, setSubmitting] = useState(false);

  // Form states for demo payment modes
  const [upiId, setUpiId] = useState('customer@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8891');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');

  useEffect(() => {
    const rawIntent = sessionStorage.getItem('cinebook_booking_intent');
    if (!rawIntent) {
      toast.error('No active booking intent found. Please select seats.');
      navigate('/movies');
      return;
    }

    try {
      const parsed = JSON.parse(rawIntent);
      setIntent(parsed);

      // Calculate remaining lock seconds
      if (parsed.lockExpiresAt) {
        const remainingMs = new Date(parsed.lockExpiresAt).getTime() - Date.now();
        const seconds = Math.max(0, Math.floor(remainingMs / 1000));
        setTimeLeft(seconds);
      }
    } catch (e) {
      navigate('/movies');
    }
  }, [navigate]);

  // Live countdown timer
  useEffect(() => {
    if (!intent) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleLockTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [intent]);

  const handleLockTimeout = async () => {
    toast.error('Seat reservation timer expired. Seats have been released.');
    if (intent?.showId && intent?.selectedSeats) {
      try {
        await releaseSeats(
          intent.showId,
          intent.selectedSeats.map((s) => ({ row: s.row, seatNumber: s.seatNumber }))
        );
      } catch (e) {
        // ignore
      }
    }
    sessionStorage.removeItem('cinebook_booking_intent');
    navigate(intent?.showId ? `/shows/${intent.showId}/seats` : '/movies');
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!intent) return;

    try {
      setSubmitting(true);

      const bookingPayload = {
        showId: intent.showId,
        seats: intent.selectedSeats.map((s) => ({
          row: s.row,
          seatNumber: s.seatNumber,
          category: s.category,
          price: s.price,
        })),
      };

      const bookingRes = await createBooking(bookingPayload);
      if (!bookingRes.success || !bookingRes.data) {
        throw new Error(bookingRes.message || 'Failed to create booking');
      }

      const createdBooking = bookingRes.data;

      const paymentRes = await createPayment({
        bookingId: createdBooking._id,
        paymentMethod,
        amount: createdBooking.finalAmount,
      });

      if (!paymentRes.success || !paymentRes.data) {
        throw new Error('Failed to initiate payment');
      }

      const { paymentId, transactionId } = paymentRes.data;

      const verifyRes = await verifyPayment({
        paymentId,
        transactionId,
      });

      if (!verifyRes.success) {
        throw new Error('Payment verification simulation failed');
      }

      sessionStorage.removeItem('cinebook_booking_intent');
      toast.success('Payment verified! Booking confirmed.');
      navigate(`/booking/${createdBooking.bookingId}`);
    } catch (err) {
      console.error('Payment processing failed:', err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Transaction could not be completed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!intent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading checkout details..." />
      </div>
    );
  }

  const show = intent.show || {};
  const movie = show.movieId || {};
  const cinema = show.cinemaId || {};
  const screen = show.screenId || {};

  const seatText = intent.selectedSeats.map((s) => `${s.row}${s.seatNumber}`).join(', ');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Countdown Warning */}
      <div className="card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-cinema-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Lock size={20} className="text-cinema-accent" />
            Checkout & Payment Simulation
          </h1>
          <p className="text-xs text-cinema-muted mt-0.5">
            Review your booking summary and choose a simulated payment channel
          </p>
        </div>

        {/* Lock Expiry Timer */}
        <div
          className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border font-mono font-bold text-sm ${
            timeLeft < 120
              ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}
        >
          <Timer size={18} />
          <span>Seats held: {formatTimer(timeLeft)}</span>
        </div>
      </div>

      {/* Main Grid: Payment Modes on left, Summary on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Payment Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Demo Mode Notice Banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-300">
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Demonstration Payment Gateway</p>
              <p className="text-amber-300/80 mt-0.5 leading-relaxed">
                This is a simulated sandbox payment flow for academic evaluation. No real financial credentials or funds are charged. All test transactions succeed instantly.
              </p>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div className="card p-6 space-y-6">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Choose Payment Method
            </h2>

            <div className="grid grid-cols-3 gap-3">
              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-xs font-semibold transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-cinema-accent/15 border-cinema-accent text-white shadow-md'
                    : 'bg-cinema-surface-2 border-cinema-border text-cinema-muted hover:text-white'
                }`}
              >
                <QrCode size={22} className={paymentMethod === 'upi' ? 'text-cinema-accent' : ''} />
                <span>UPI / QR</span>
              </button>

              {/* Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-xs font-semibold transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-cinema-accent/15 border-cinema-accent text-white shadow-md'
                    : 'bg-cinema-surface-2 border-cinema-border text-cinema-muted hover:text-white'
                }`}
              >
                <CreditCard size={22} className={paymentMethod === 'card' ? 'text-cinema-accent' : ''} />
                <span>Debit / Credit</span>
              </button>

              {/* Pay at Counter */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-xs font-semibold transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-cinema-accent/15 border-cinema-accent text-white shadow-md'
                    : 'bg-cinema-surface-2 border-cinema-border text-cinema-muted hover:text-white'
                }`}
              >
                <Building size={22} className={paymentMethod === 'cash' ? 'text-cinema-accent' : ''} />
                <span>Pay at Cinema</span>
              </button>
            </div>

            {/* Dynamic Form based on payment mode */}
            <form onSubmit={handleConfirmPayment} className="space-y-4 pt-2">
              {paymentMethod === 'upi' && (
                <div className="space-y-3 bg-cinema-surface-2 p-4 rounded-lg border border-cinema-border">
                  <label className="text-xs font-medium text-cinema-text block">
                    Virtual Payment Address (UPI ID)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                    placeholder="username@okhdfcbank"
                    className="input-field"
                  />
                  <p className="text-[11px] text-cinema-muted">
                    Simulated UPI handles Google Pay, PhonePe, Paytm, and BHIM requests.
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-3 bg-cinema-surface-2 p-4 rounded-lg border border-cinema-border">
                  <div>
                    <label className="text-xs font-medium text-cinema-text block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      placeholder="4532 0000 0000 0000"
                      className="input-field font-mono text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-cinema-text block mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        required
                        placeholder="MM/YY"
                        className="input-field font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-cinema-text block mb-1">
                        CVV Code
                      </label>
                      <input
                        type="password"
                        maxLength="3"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        required
                        placeholder="•••"
                        className="input-field font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="bg-cinema-surface-2 p-4 rounded-lg border border-cinema-border text-xs text-cinema-muted space-y-1">
                  <p className="text-white font-medium">Counter Reservation Enabled</p>
                  <p>
                    Your seats will be locked and an entry voucher issued. Present your booking reference at the multiplex box office to pay in cash.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || timeLeft <= 0}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold shadow-xl shadow-cinema-accent/30 mt-4"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Processing Payment Simulation...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Pay {formatCurrency(intent.totalAmount)} & Confirm Tickets</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Order Details */}
        <div className="space-y-4">
          <div className="card p-6 space-y-5 shadow-xl border-cinema-border">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-cinema-border/60 pb-3">
              Order Details
            </h2>

            {/* Movie preview */}
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white leading-snug">{movie.title || 'Movie'}</h3>
              <p className="text-xs text-cinema-muted">
                {Array.isArray(movie.language) ? movie.language.join(', ') : movie.language} • {movie.certification || 'U/A'}
              </p>
            </div>

            {/* Cinema & Timing */}
            <div className="space-y-2 text-xs text-cinema-muted pt-2 border-t border-cinema-border/50">
              <div className="flex items-start gap-2">
                <MapPin size={13} className="text-cinema-accent flex-shrink-0 mt-0.5" />
                <span className="text-white font-medium">
                  {cinema.name} ({screen.screenName || 'Screen 1'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={13} className="flex-shrink-0" />
                <span>{formatDate(show.showDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={13} className="flex-shrink-0" />
                <span>{formatTime(show.startTime)}</span>
              </div>
            </div>

            {/* Seats */}
            <div className="pt-2 border-t border-cinema-border/50">
              <span className="text-xs text-cinema-muted block mb-1">Assigned Seats:</span>
              <p className="font-mono text-sm font-bold text-cinema-accent">
                {seatText}
              </p>
            </div>

            {/* Pricing Summary */}
            <div className="pt-3 border-t border-cinema-border/60 space-y-2 text-xs">
              <div className="flex justify-between text-cinema-muted">
                <span>Tickets ({intent.selectedSeats.length})</span>
                <span className="text-white font-medium">{formatCurrency(intent.seatSubtotal)}</span>
              </div>
              <div className="flex justify-between text-cinema-muted">
                <span>Convenience Fee</span>
                <span className="text-white font-medium">{formatCurrency(intent.convenienceFee)}</span>
              </div>
              <div className="flex justify-between text-cinema-muted">
                <span>GST (18%)</span>
                <span className="text-white font-medium">₹0 (Inclusive)</span>
              </div>

              <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-cinema-border/60">
                <span>Final Payable</span>
                <span className="text-cinema-accent text-lg">{formatCurrency(intent.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
