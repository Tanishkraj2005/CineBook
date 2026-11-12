import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getShows, createShow, deleteShow } from '../../services/showService';
import { getMovies } from '../../services/movieService';
import { getCinemas } from '../../services/cinemaService';
import { getScreens } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import { Calendar, Plus, Trash2, X, Check, Clock, Film, MapPin } from 'lucide-react';

export default function ManageShows() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [form, setForm] = useState({
    movieId: '',
    cinemaId: '',
    screenId: '',
    showDate: defaultDateStr,
    startTime: '14:00',
    endTime: '17:00',
    standardPrice: 200,
    premiumPrice: 350,
    reclinerPrice: 500,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [showsRes, moviesRes, cinemasRes] = await Promise.all([
        getShows(),
        getMovies({ limit: 100 }),
        getCinemas(),
      ]);

      if (showsRes.success && showsRes.data) setShows(showsRes.data);
      if (moviesRes.success && moviesRes.data) {
        setMovies(moviesRes.data.movies || []);
        if (moviesRes.data.movies.length > 0 && !form.movieId) {
          setForm((f) => ({ ...f, movieId: moviesRes.data.movies[0]._id }));
        }
      }
      if (cinemasRes.success && cinemasRes.data) {
        setCinemas(cinemasRes.data);
        if (cinemasRes.data.length > 0 && !form.cinemaId) {
          setForm((f) => ({ ...f, cinemaId: cinemasRes.data[0]._id }));
          fetchScreensForCinema(cinemasRes.data[0]._id);
        }
      }
    } catch (err) {
      toast.error('Failed to load shows schedule');
    } finally {
      setLoading(false);
    }
  };

  const fetchScreensForCinema = async (cId) => {
    try {
      const res = await getScreens({ cinemaId: cId });
      if (res.success && res.data) {
        setScreens(res.data);
        if (res.data.length > 0) {
          setForm((f) => ({ ...f, screenId: res.data[0]._id }));
        }
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCinemaChange = (e) => {
    const cId = e.target.value;
    setForm({ ...form, cinemaId: cId });
    fetchScreensForCinema(cId);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scheduled show?')) return;
    try {
      const res = await deleteShow(id);
      if (res.success) {
        toast.success('Show removed from schedule');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to delete show');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.screenId) {
      toast.error('Please ensure a valid screen is selected for this cinema');
      return;
    }

    try {
      setSaving(true);
      const res = await createShow({
        movieId: form.movieId,
        cinemaId: form.cinemaId,
        screenId: form.screenId,
        showDate: form.showDate,
        startTime: form.startTime,
        endTime: form.endTime,
        pricing: {
          standard: Number(form.standardPrice),
          premium: Number(form.premiumPrice),
          recliner: Number(form.reclinerPrice),
        },
      });

      if (res.success) {
        toast.success('New show scheduled successfully!');
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Overlap error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cinema-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="text-cinema-accent" />
            Manage Showtime Scheduling
          </h1>
          <p className="text-xs text-cinema-muted mt-0.5">
            Schedule movie timings, prevent overlapping screen shows, and manage slot pricing
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center gap-2 text-xs !py-2 !px-4 shadow-lg shadow-cinema-accent/20"
        >
          <Plus size={16} />
          <span>Schedule Show</span>
        </button>
      </div>

      {/* Shows Schedule Table */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading showtimes..." />
        </div>
      ) : (
        <div className="card overflow-hidden shadow-xl border-cinema-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cinema-surface-2 border-b border-cinema-border text-cinema-muted uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Movie</th>
                  <th className="py-3 px-4">Cinema & Screen</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Base Pricing</th>
                  <th className="py-3 px-4">Booked</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-border/50 text-cinema-text">
                {shows.slice(0, 50).map((s) => (
                  <tr key={s._id} className="hover:bg-cinema-surface-2/60 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-white text-sm">{s.movieId?.title || 'Unknown'}</p>
                      <p className="text-[10px] text-cinema-muted">
                        {Array.isArray(s.movieId?.genre) ? s.movieId?.genre.slice(0, 2).join(', ') : ''}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-zinc-200">{s.cinemaId?.name || 'Cinema'}</p>
                      <p className="text-[11px] text-cinema-muted">
                        {s.cinemaId?.city} • {s.screenId?.screenName || 'Screen 1'}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <p className="text-white font-medium">{formatDate(s.showDate)}</p>
                      <p className="text-[11px] text-cinema-accent font-bold">
                        {formatTime(s.startTime)} - {formatTime(s.endTime)}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-cinema-muted font-mono">
                      <span>Std: ₹{s.pricing?.standard || 200}</span>
                      <span className="block text-[10px]">Prem: ₹{s.pricing?.premium || 350}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-white">{s.bookedSeats?.length || 0}</span>
                      <span className="text-cinema-muted text-[10px] block">reserved</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge bg-green-500/10 text-green-400 border border-green-500/30 text-[10px]">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-cinema-muted hover:text-red-400 transition-colors"
                        title="Delete Show"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Show Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="card max-w-lg w-full p-6 space-y-4 my-8 shadow-2xl border-cinema-border">
            <div className="flex items-center justify-between border-b border-cinema-border/60 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar size={18} className="text-cinema-accent" />
                Schedule Movie Screening
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-cinema-muted hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-cinema-text">Select Movie *</label>
                <select
                  required
                  value={form.movieId}
                  onChange={(e) => setForm({ ...form, movieId: e.target.value })}
                  className="input-field"
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.duration} mins)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">Cinema Venue *</label>
                  <select
                    required
                    value={form.cinemaId}
                    onChange={handleCinemaChange}
                    className="input-field"
                  >
                    {cinemas.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">Screen *</label>
                  <select
                    required
                    value={form.screenId}
                    onChange={(e) => setForm({ ...form, screenId: e.target.value })}
                    className="input-field"
                  >
                    {screens.map((sc) => (
                      <option key={sc._id} value={sc._id}>
                        {sc.screenName} ({sc.totalSeats} seats)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.showDate}
                    onChange={(e) => setForm({ ...form, showDate: e.target.value })}
                    className="input-field text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="input-field text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">End Time *</label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="input-field text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-cinema-muted">Standard (₹)</label>
                  <input
                    type="number"
                    value={form.standardPrice}
                    onChange={(e) => setForm({ ...form, standardPrice: e.target.value })}
                    className="input-field font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-cinema-muted">Premium (₹)</label>
                  <input
                    type="number"
                    value={form.premiumPrice}
                    onChange={(e) => setForm({ ...form, premiumPrice: e.target.value })}
                    className="input-field font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-cinema-muted">Recliner (₹)</label>
                  <input
                    type="number"
                    value={form.reclinerPrice}
                    onChange={(e) => setForm({ ...form, reclinerPrice: e.target.value })}
                    className="input-field font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-cinema-border/60">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-xs !py-1.5 !px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs !py-1.5 !px-4 flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>{saving ? 'Validating Overlaps...' : 'Schedule Show'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

