export default function SeatMap({
  rows = [],
  selectedSeats = [],
  onSeatClick = () => {},
}) {
  const isSelected = (rowLabel, seatNumber) =>
    selectedSeats.some((s) => s.row === rowLabel && s.seatNumber === seatNumber);

  return (
    <div className="w-full flex flex-col items-center select-none py-6 overflow-x-auto">
      {/* Curved Screen Indicator */}
      <div className="w-full max-w-2xl px-6 mb-12 flex flex-col items-center">
        <div className="w-full h-3 rounded-[50%] bg-gradient-to-b from-cinema-muted/50 via-cinema-muted/20 to-transparent shadow-[0_-8px_20px_rgba(255,255,255,0.08)]" />
        <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-cinema-muted/80 mt-3 flex items-center gap-2">
          <span className="w-8 h-px bg-cinema-muted/30" />
          All eyes this way • Screen
          <span className="w-8 h-px bg-cinema-muted/30" />
        </span>
      </div>

      {/* Seat Grid */}
      <div className="space-y-3 min-w-[580px] px-4">
        {rows.map((row) => (
          <div key={row.rowLabel} className="flex items-center justify-center gap-3">
            {/* Left Row Label */}
            <span className="w-6 text-center text-xs font-mono font-bold text-cinema-muted">
              {row.rowLabel}
            </span>

            {/* Seats in this row */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {row.seats.map((seat, index) => {
                const selected = isSelected(row.rowLabel, seat.seatNumber);
                const isBooked = seat.status === 'booked';
                const isLocked = seat.status === 'locked';
                const unavailable = isBooked || isLocked;

                // Add aisle gap in the middle (e.g. after seat 3 and 7 in 10-seat rows)
                const isAisleGap = index === 2 || index === 6;

                let seatStyle = 'bg-zinc-700 hover:bg-zinc-500 text-zinc-100 border-zinc-600';
                if (unavailable) {
                  seatStyle =
                    'bg-zinc-800/80 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50';
                } else if (selected) {
                  seatStyle =
                    'bg-cinema-accent border-cinema-accent text-white shadow-lg shadow-cinema-accent/40 font-bold scale-105';
                } else if (seat.category === 'recliner') {
                  seatStyle =
                    'bg-indigo-900/50 hover:bg-indigo-800/70 border-indigo-700 text-indigo-200';
                } else if (seat.category === 'premium') {
                  seatStyle =
                    'bg-amber-900/50 hover:bg-amber-800/70 border-amber-700 text-amber-200';
                }

                return (
                  <div key={seat.seatNumber} className={`flex items-center ${isAisleGap ? 'mr-4 sm:mr-6' : ''}`}>
                    <button
                      type="button"
                      disabled={unavailable}
                      onClick={() => onSeatClick(row.rowLabel, seat)}
                      title={`${row.rowLabel}${seat.seatNumber} • ${seat.category.toUpperCase()} • ₹${seat.price}${
                        unavailable ? ' (Unavailable)' : ''
                      }`}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-t-md rounded-b-sm border text-[11px] sm:text-xs font-mono transition-all duration-150 flex items-center justify-center ${seatStyle}`}
                    >
                      {seat.seatNumber}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right Row Label */}
            <span className="w-6 text-center text-xs font-mono font-bold text-cinema-muted">
              {row.rowLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

