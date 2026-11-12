import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { verifyTicket, getAllBookings } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Scan,
  Ticket,
  Clock,
  User,
  Film,
  Building2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function VerifyTickets() {
  const [ticketInput, setTicketInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [recentBookings, setRecentBookings] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const fetchRecentConfirmed = async () => {
    try {
      setLoadingRecent(true);
      const res = await getAllBookings({ status: 'confirmed', limit: 8 });
      if (res.success && res.data) {
        setRecentBookings(res.data.bookings || []);
      }
    } catch (e) {
      // non-blocking
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchRecentConfirmed();
  }, []);

  const handleVerify = async (identifierToTest) => {
    const identifier = (identifierToTest || ticketInput).trim();
    if (!identifier) {
      toast.error('Please enter a ticket reference or QR code identifier');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await verifyTicket(identifier);
      if (res.success) {
        setResult(res.data);
        toast.success(res.message || 'Ticket verified successfully!');
        fetchRecentConfirmed();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to verify ticket';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-cinema-border pb-5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <QrCode size={20} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Ticket Gate & QR Verification
              <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px]">
                Gate Control
              </span>
            </h1>
            <p className="text-xs text-cinema-muted mt-0.5">
              Auditorium entry check: Validates ticket QR code, admits patrons, and prevents duplicate admissions or cancelled passes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input / Scanner simulator */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 border-cinema-border space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Scan size={18} className="text-cinema-accent" />
              <span>Scan QR Code or Enter Ticket Identifier</span>
            </h2>
            <p className="text-xs text-cinema-muted">
              Enter the full QR verification token (e.g. <code className="text-amber-400">CINEBOOK-VERIFY-CB-XM5BQG80</code>) or raw booking ID (<code className="text-amber-400">CB-XM5BQG80</code>).
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Ticket size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cinema-muted" />
                <input
                  type="text"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  placeholder="Paste CINEBOOK-VERIFY-CB-... or CB-..."
                  className="input-field !pl-10 !py-3 font-mono text-sm uppercase tracking-wide"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !ticketInput.trim()}
                className="btn-primary !py-3 !px-6 flex items-center justify-center gap-2 font-semibold shadow-lg shadow-cinema-accent/20"
              >
                {loading ? <LoadingSpinner size="sm" /> : <ShieldCheck size={18} />}
                <span>Verify & Admit</span>
              </button>
            </form>

            {/* Verification Result Feedback */}
            {result && (
              <div className="p-5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-4 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={24} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-emerald-400">
                      TICKET VERIFIED & ADMITTED!
                    </h3>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      Attendee entry permitted. Ticket has been recorded as admitted at{' '}
                      {new Date(result.admittedAt).toLocaleTimeString()}. Re-entering will be rejected.
                    </p>
                  </div>
                </div>

                {result.booking && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-emerald-500/20 text-xs">
                    <div>
                      <span className="text-cinema-muted block">Movie:</span>
                      <span className="font-bold text-white text-sm">
                        {result.booking.showId?.movieId?.title}
                      </span>
                    </div>
                    <div>
                      <span className="text-cinema-muted block">Auditorium & City:</span>
                      <span className="font-semibold text-zinc-200">
                        {result.booking.showId?.cinemaId?.name} ({result.booking.showId?.screenId?.screenName})
                      </span>
                    </div>
                    <div>
                      <span className="text-cinema-muted block">Seats:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.booking.seats?.map((s) => (
                          <span
                            key={`${s.row}${s.seatNumber}`}
                            className="px-2 py-0.5 bg-cinema-surface rounded text-amber-300 font-mono font-bold border border-cinema-border"
                          >
                            {s.row}{s.seatNumber} ({s.category})
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-cinema-muted block">Customer:</span>
                      <span className="font-medium text-zinc-200">
                        {result.booking.userId?.name} ({result.booking.userId?.phone || result.booking.userId?.email})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {errorMsg && (
              <div className="p-5 rounded-xl border border-red-500/40 bg-red-950/20 flex items-start gap-3 animate-in fade-in">
                <XCircle size={24} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-red-400">ENTRY REJECTED</h3>
                  <p className="text-xs text-zinc-300 mt-1">{errorMsg}</p>
                  <p className="text-[11px] text-cinema-muted mt-2">
                    Tickets are single-admission only. Re-entries, unconfirmed reservations, and cancelled bookings are denied at the gate.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Test Scanner Simulator */}
        <div className="card p-6 border-cinema-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Ticket size={15} className="text-amber-400" />
              <span>Recent Confirmed Bookings</span>
            </h3>
            <button
              onClick={fetchRecentConfirmed}
              className="text-[11px] text-cinema-accent hover:underline"
            >
              Refresh
            </button>
          </div>

          <p className="text-xs text-cinema-muted leading-relaxed">
            Click any active confirmed customer ticket below to test the gate entry check:
          </p>

          {loadingRecent ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : recentBookings.length === 0 ? (
            <p className="text-xs text-cinema-muted py-4 text-center">No confirmed bookings yet</p>
          ) : (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {recentBookings.map((b) => (
                <div
                  key={b._id}
                  className="bg-cinema-surface-2/60 border border-cinema-border rounded-lg p-3 hover:border-cinema-muted transition-colors space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-300 text-xs">
                      {b.bookingId}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        b.isAdmitted
                          ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {b.isAdmitted ? 'Already Admitted' : 'Ready for Entry'}
                    </span>
                  </div>

                  <p className="text-zinc-200 font-medium truncate">
                    {b.showId?.movieId?.title}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-cinema-muted pt-1">
                    <span>
                      Seats: {b.seats?.map((s) => `${s.row}${s.seatNumber}`).join(', ')}
                    </span>
                    <button
                      onClick={() => {
                        setTicketInput(`CINEBOOK-VERIFY-${b.bookingId}`);
                        handleVerify(`CINEBOOK-VERIFY-${b.bookingId}`);
                      }}
                      className="px-2.5 py-1 rounded bg-cinema-accent/20 hover:bg-cinema-accent text-cinema-accent hover:text-white font-semibold transition-colors"
                    >
                      Test Gate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

