import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Film, Calendar, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';

const TicketView = forwardRef(({ booking }, ref) => {
  if (!booking) return null;

  const show = booking.showId || {};
  const movie = show.movieId || {};
  const cinema = show.cinemaId || {};
  const screen = show.screenId || {};

  const isConfirmed = booking.bookingStatus === 'confirmed';
  const isCancelled = booking.bookingStatus === 'cancelled';

  const seatList = booking.seats?.map((s) => `${s.row}${s.seatNumber}`).join(', ') || 'N/A';

  return (
    <div
      ref={ref}
      className="w-full max-w-xl mx-auto bg-gradient-to-br from-cinema-surface via-[#1c1c1c] to-cinema-surface border border-cinema-border rounded-2xl overflow-hidden shadow-2xl relative font-sans text-cinema-text"
    >
      {/* Top Header bar */}
      <div className="bg-cinema-surface-2 px-6 py-4 flex items-center justify-between border-b border-cinema-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-cinema-accent flex items-center justify-center text-white">
            <Film size={16} />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">
            Cine<span className="text-cinema-accent">Book</span> Ticket
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isConfirmed ? (
            <span className="badge bg-green-500/10 text-green-400 border border-green-500/30 font-semibold">
              <CheckCircle2 size={12} /> CONFIRMED
            </span>
          ) : isCancelled ? (
            <span className="badge bg-red-500/10 text-red-400 border border-red-500/30 font-semibold">
              <AlertCircle size={12} /> CANCELLED
            </span>
          ) : (
            <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
              PENDING
            </span>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6">
        {/* Movie Info */}
        <div className="border-b border-cinema-border/60 pb-5 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                {movie.title || 'Movie Title'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-cinema-muted mt-1.5">
                {movie.certification && (
                  <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] border border-zinc-700">
                    {movie.certification}
                  </span>
                )}
                <span>
                  {Array.isArray(movie.language) ? movie.language.join(', ') : movie.language}
                </span>
                <span>•</span>
                <span>{Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</span>
              </div>
            </div>
            {movie.poster && (
              <img
                src={
                  movie.poster.startsWith('http')
                    ? movie.poster
                    : `https://image.tmdb.org/t/p/w154${movie.poster}`
                }
                alt={movie.title}
                className="w-14 h-20 object-cover rounded-md border border-cinema-border flex-shrink-0"
              />
            )}
          </div>
        </div>

        {/* Show & Venue Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs mb-6">
          <div className="space-y-1">
            <span className="text-[11px] text-cinema-muted flex items-center gap-1">
              <Calendar size={12} /> Date
            </span>
            <p className="font-semibold text-white">{formatDate(show.showDate)}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-cinema-muted flex items-center gap-1">
              <Clock size={12} /> Time
            </span>
            <p className="font-semibold text-white">{formatTime(show.startTime)}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-cinema-muted flex items-center gap-1">
              Screen
            </span>
            <p className="font-semibold text-white">{screen.screenName || 'Screen 1'}</p>
          </div>

          <div className="col-span-2 sm:col-span-2 space-y-1">
            <span className="text-[11px] text-cinema-muted flex items-center gap-1">
              <MapPin size={12} /> Cinema
            </span>
            <p className="font-semibold text-white leading-tight">
              {cinema.name}
              <span className="block text-[11px] text-cinema-muted font-normal mt-0.5">
                {cinema.address}
              </span>
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-cinema-muted">Seats</span>
            <p className="font-mono font-bold text-cinema-accent text-sm sm:text-base">
              {seatList}
            </p>
          </div>
        </div>

        {/* Perforated Divider */}
        <div className="relative my-6 -mx-6">
          <div className="border-t-2 border-dashed border-cinema-border" />
          <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-cinema-bg border-r border-cinema-border" />
          <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-cinema-bg border-l border-cinema-border" />
        </div>

        {/* Bottom Verification Section with QR Code */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
          {/* QR Code */}
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-lg shadow-md border border-zinc-300">
              <QRCodeSVG
                value={`CINEBOOK-VERIFY-${booking.bookingId}`}
                size={84}
                level="M"
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-cinema-muted uppercase tracking-wider">
                Digital Pass
              </p>
              <p className="font-mono text-xs font-bold text-white mt-0.5 tracking-wider">
                {booking.bookingId}
              </p>
              <p className="text-[10px] text-cinema-muted mt-1 leading-tight">
                Scan at cinema entry counter
              </p>
            </div>
          </div>

          {/* Pricing info */}
          <div className="text-right sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-cinema-border/50">
            <span className="text-[11px] text-cinema-muted block">Total Paid Amount</span>
            <span className="text-xl sm:text-2xl font-bold text-white">
              {formatCurrency(booking.finalAmount)}
            </span>
            <span className="text-[10px] text-cinema-muted block mt-0.5">
              Includes convenience fee & GST
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TicketView;

