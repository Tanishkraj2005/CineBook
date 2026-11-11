import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Ticket, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../../utils/constants';

export default function BookingCard({ booking, onCancelClick = () => {} }) {
  if (!booking) return null;

  const show = booking.showId || {};
  const movie = show.movieId || {};
  const cinema = show.cinemaId || {};

  const isConfirmed = booking.bookingStatus === 'confirmed';
  const isCancelled = booking.bookingStatus === 'cancelled';

  // Check if eligible for cancellation (show at least 1 hr away)
  let canCancel = false;
  if (isConfirmed && show.showDate && show.startTime) {
    try {
      const showDateTime = new Date(show.showDate);
      const [h, m] = show.startTime.split(':');
      showDateTime.setHours(parseInt(h, 10), parseInt(m, 10));
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      canCancel = showDateTime > oneHourFromNow;
    } catch (e) {
      canCancel = false;
    }
  }

  const seatText = booking.seats?.map((s) => `${s.row}${s.seatNumber}`).join(', ') || 'N/A';
  const statusInfo = BOOKING_STATUS[booking.bookingStatus] || BOOKING_STATUS.pending;
  const paymentInfo = PAYMENT_STATUS[booking.paymentStatus] || PAYMENT_STATUS.pending;

  return (
    <div className="card p-5 hover:border-cinema-muted transition-all duration-200 shadow-md">
      <div className="flex flex-col sm:flex-row gap-5 items-start justify-between">
        {/* Left: Movie poster & details */}
        <div className="flex gap-4">
          {movie.poster ? (
            <img
              src={
                movie.poster.startsWith('http')
                  ? movie.poster
                  : `https://image.tmdb.org/t/p/w154${movie.poster}`
              }
              alt={movie.title}
              className="w-16 h-24 object-cover rounded-md border border-cinema-border flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-24 bg-cinema-surface-2 rounded-md flex items-center justify-center text-xl flex-shrink-0">
              🎬
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-cinema-muted">#{booking.bookingId}</span>
              <span className={`badge ${statusInfo.badgeClass}`}>{statusInfo.label}</span>
              <span className={`badge ${paymentInfo.badgeClass}`}>{paymentInfo.label}</span>
            </div>

            <h3 className="text-base font-bold text-white leading-tight">{movie.title || 'Movie'}</h3>

            <div className="text-xs text-cinema-muted space-y-0.5">
              <p className="flex items-center gap-1.5">
                <MapPin size={12} className="text-cinema-accent" />
                <span>
                  {cinema.name} • {cinema.city}
                </span>
              </p>
              <p className="flex items-center gap-1.5">
                <Calendar size={12} />
                <span>
                  {formatDate(show.showDate)} at {formatTime(show.startTime)}
                </span>
              </p>
              <p className="flex items-center gap-1.5">
                <Ticket size={12} />
                <span>
                  Seats: <strong className="text-cinema-accent font-mono">{seatText}</strong>
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Price & action buttons */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-cinema-border/50 gap-3">
          <div className="sm:text-right">
            <span className="text-[11px] text-cinema-muted block">Amount Paid</span>
            <span className="text-lg font-bold text-white">{formatCurrency(booking.finalAmount)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/booking/${booking.bookingId}`}
              className="btn-primary text-xs !py-1.5 !px-3"
            >
              View Ticket
            </Link>

            {canCancel && (
              <button
                type="button"
                onClick={() => onCancelClick(booking.bookingId)}
                className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:bg-red-500/10 px-2.5 py-1.5 rounded transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {isCancelled && booking.cancellationReason && (
        <div className="mt-3 pt-3 border-t border-cinema-border/40 text-xs text-red-400/80 flex items-center gap-1.5">
          <AlertCircle size={13} />
          <span>Cancellation reason: {booking.cancellationReason}</span>
        </div>
      )}
    </div>
  );
}

