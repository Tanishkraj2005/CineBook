import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMovies, createMovie, updateMovie, deleteMovie } from '../../services/movieService';
import { getCinemas } from '../../services/cinemaService';
import { getScreens } from '../../services/adminService';
import { createShow } from '../../services/showService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDuration } from '../../utils/formatters';
import {
  Film,
  Plus,
  Edit,
  Trash2,
  X,
  Star,
  Check,
  ExternalLink,
  Upload,
  Calendar,
} from 'lucide-react';

// Resize and compress uploaded image file to a clean JPEG Data URL
const readImageAsDataUrl = (file, maxWidth = 800) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file'));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

const parseCastText = (castText) =>
  castText
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [name, ...rest] = entry.split('-');
      return {
        name: (name || '').trim(),
        role: rest.join('-').trim() || 'Lead Cast',
      };
    })
    .filter((c) => c.name);

const formatCastText = (castArray) => {
  if (!Array.isArray(castArray) || castArray.length === 0) return '';
  return castArray
    .map((c) => (c.role ? `${c.name} - ${c.role}` : c.name))
    .join(', ');
};

export default function ManageMovies() {
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [saving, setSaving] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    title: '',
    description: '',
    genre: 'Action, Drama',
    duration: 150,
    language: 'Hindi, English',
    poster: '',
    banner: '',
    releaseDate: todayStr,
    certification: 'U/A',
    castText: '',
    director: '',
    trailerUrl: '',
    status: 'now_showing',
    avgRating: 8.0,
  });

  // Optional initial showtime when adding a new movie
  const [scheduleShow, setScheduleShow] = useState(true);
  const [showForm, setShowForm] = useState({
    cinemaId: '',
    screenId: '',
    showDate: todayStr,
    startTime: '18:00',
    endTime: '21:00',
    standardPrice: 220,
    premiumPrice: 360,
    reclinerPrice: 520,
  });

  const fetchMoviesList = async () => {
    try {
      setLoading(true);
      const [moviesRes, cinemasRes, screensRes] = await Promise.all([
        getMovies({ limit: 100, sort: 'newest' }),
        getCinemas(),
        getScreens(),
      ]);
      if (moviesRes.success && moviesRes.data) {
        setMovies(moviesRes.data.movies || []);
      }
      if (cinemasRes.success && cinemasRes.data) {
        setCinemas(cinemasRes.data);
      }
      if (screensRes.success && screensRes.data) {
        setScreens(screensRes.data);
      }
    } catch (err) {
      toast.error('Failed to load movies list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoviesList();
  }, []);

  const handleOpenAdd = () => {
    setEditingMovie(null);
    const defaultCinemaId = cinemas[0]?._id || '';
    const defaultScreen = screens.find(
      (s) => (s.cinemaId?._id || s.cinemaId) === defaultCinemaId
    );
    setForm({
      title: '',
      description: '',
      genre: 'Action, Drama',
      duration: 150,
      language: 'Hindi, English',
      poster: '',
      banner: '',
      releaseDate: todayStr,
      certification: 'U/A',
      castText: '',
      director: '',
      trailerUrl: '',
      status: 'now_showing',
      avgRating: 8.0,
    });
    setScheduleShow(true);
    setShowForm({
      cinemaId: defaultCinemaId,
      screenId: defaultScreen?._id || '',
      showDate: todayStr,
      startTime: '18:00',
      endTime: '21:00',
      standardPrice: 220,
      premiumPrice: 360,
      reclinerPrice: 520,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (movie) => {
    setEditingMovie(movie);
    setScheduleShow(false);
    setForm({
      title: movie.title || '',
      description: movie.description || '',
      genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || '',
      duration: movie.duration || 120,
      language: Array.isArray(movie.language) ? movie.language.join(', ') : movie.language || '',
      poster: movie.poster || '',
      banner: movie.banner || '',
      releaseDate: movie.releaseDate
        ? new Date(movie.releaseDate).toISOString().split('T')[0]
        : todayStr,
      certification: movie.certification || 'U/A',
      castText: formatCastText(movie.cast),
      director: movie.director || '',
      trailerUrl: movie.trailerUrl || '',
      status: movie.status || 'now_showing',
      avgRating: movie.avgRating ?? 0,
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const maxWidth = field === 'banner' ? 1280 : 600;
      const dataUrl = await readImageAsDataUrl(file, maxWidth);
      setForm((prev) => ({ ...prev, [field]: dataUrl }));
      toast.success(`${field === 'poster' ? 'Poster' : 'Banner'} image loaded`);
    } catch (err) {
      toast.error(err.message || 'Could not process image file');
    }
  };

  const handleCinemaSelect = (cinemaId) => {
    const firstScreen = screens.find((s) => (s.cinemaId?._id || s.cinemaId) === cinemaId);
    setShowForm((prev) => ({
      ...prev,
      cinemaId,
      screenId: firstScreen?._id || '',
    }));
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await deleteMovie(id);
      if (res.success) {
        toast.success(`"${title}" deleted successfully`);
        fetchMoviesList();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete movie');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        duration: Number(form.duration),
        avgRating: Number(form.avgRating) || 0,
        genre: form.genre.split(',').map((s) => s.trim()).filter(Boolean),
        language: form.language.split(',').map((s) => s.trim()).filter(Boolean),
        poster: form.poster.trim(),
        banner: form.banner.trim() || form.poster.trim(),
        releaseDate: form.releaseDate ? new Date(form.releaseDate) : new Date(),
        certification: form.certification,
        cast: parseCastText(form.castText),
        director: form.director.trim(),
        trailerUrl: form.trailerUrl.trim(),
        status: form.status,
      };

      if (editingMovie) {
        const res = await updateMovie(editingMovie._id, payload);
        if (res.success) {
          toast.success('Movie updated — changes are now live for users');
          setModalOpen(false);
          fetchMoviesList();
        }
      } else {
        const res = await createMovie(payload);
        if (res.success) {
          const createdMovie = res.data;
          if (
            scheduleShow &&
            form.status === 'now_showing' &&
            showForm.cinemaId &&
            showForm.screenId
          ) {
            try {
              await createShow({
                movieId: createdMovie._id,
                cinemaId: showForm.cinemaId,
                screenId: showForm.screenId,
                showDate: showForm.showDate,
                startTime: showForm.startTime,
                endTime: showForm.endTime,
                pricing: {
                  standard: Number(showForm.standardPrice),
                  premium: Number(showForm.premiumPrice),
                  recliner: Number(showForm.reclinerPrice),
                },
              });
              toast.success('Movie & initial showtime published to users!');
            } catch (showErr) {
              toast.success('Movie published to users!');
              toast.error(
                showErr.response?.data?.message ||
                  'Could not auto-schedule showtime (you can add it in Manage Shows).'
              );
            }
          } else {
            toast.success('Movie published to customer catalog!');
          }
          setModalOpen(false);
          fetchMoviesList();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save movie');
    } finally {
      setSaving(false);
    }
  };

  const resolvePreviewUrl = (val) => {
    if (!val) return null;
    if (val.startsWith('http') || val.startsWith('data:')) return val;
    return `https://image.tmdb.org/t/p/w500${val}`;
  };

  const availableScreensForCinema = screens.filter(
    (s) => (s.cinemaId?._id || s.cinemaId) === showForm.cinemaId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cinema-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Film className="text-cinema-accent" />
            Manage Movies Catalog
          </h1>
          <p className="text-xs text-cinema-muted mt-0.5">
            Post new films with posters, banners, cast, trailers, and showtimes — published immediately to customers
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary flex items-center gap-2 text-xs !py-2 !px-4 shadow-lg shadow-cinema-accent/20"
        >
          <Plus size={16} />
          <span>Add New Movie</span>
        </button>
      </div>

      {/* Movies Table */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading movies..." />
        </div>
      ) : (
        <div className="card overflow-hidden shadow-xl border-cinema-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cinema-surface-2 border-b border-cinema-border text-cinema-muted uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Poster</th>
                  <th className="py-3 px-4">Title & Director</th>
                  <th className="py-3 px-4">Genre / Lang</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-border/50 text-cinema-text">
                {movies.map((m) => {
                  const posterSrc = m.poster
                    ? m.poster.startsWith('http') || m.poster.startsWith('data:')
                      ? m.poster
                      : `https://image.tmdb.org/t/p/w92${m.poster}`
                    : null;

                  return (
                    <tr key={m._id} className="hover:bg-cinema-surface-2/60 transition-colors">
                      <td className="py-2.5 px-4">
                        {posterSrc ? (
                          <img
                            src={posterSrc}
                            alt={m.title}
                            referrerPolicy="no-referrer"
                            className="w-9 h-13 object-cover rounded border border-cinema-border"
                          />
                        ) : (
                          <div className="w-9 h-13 bg-cinema-surface-2 rounded border border-cinema-border flex items-center justify-center text-xs">
                            🎬
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <p className="font-bold text-white text-sm">{m.title}</p>
                        <p className="text-[11px] text-cinema-muted">
                          {m.director ? `Dir: ${m.director}` : 'Director not specified'}
                        </p>
                      </td>
                      <td className="py-2.5 px-4">
                        <p className="text-zinc-300">
                          {Array.isArray(m.genre) ? m.genre.slice(0, 2).join(', ') : m.genre}
                        </p>
                        <p className="text-[10px] text-cinema-muted">
                          {Array.isArray(m.language) ? m.language.join(', ') : m.language}
                        </p>
                      </td>
                      <td className="py-2.5 px-4 font-mono">{formatDuration(m.duration)}</td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-yellow-400">
                          <Star size={11} className="fill-yellow-400" />
                          {m.avgRating ? m.avgRating.toFixed(1) : 'N/A'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`badge text-[10px] ${
                            m.status === 'now_showing'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                              : m.status === 'coming_soon'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {m.status === 'now_showing'
                            ? 'Now Showing'
                            : m.status === 'coming_soon'
                            ? 'Coming Soon'
                            : 'Archived'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/movies/${m._id}`}
                            target="_blank"
                            className="p-1.5 rounded hover:bg-cinema-surface text-cinema-muted hover:text-amber-400 transition-colors"
                            title="View on customer site"
                          >
                            <ExternalLink size={14} />
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded hover:bg-cinema-surface text-cinema-muted hover:text-white transition-colors"
                            title="Edit movie"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(m._id, m.title)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-cinema-muted hover:text-red-400 transition-colors"
                            title="Delete movie"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="card max-w-3xl w-full p-6 space-y-5 my-8 shadow-2xl border-cinema-border max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-cinema-border/60 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Film size={18} className="text-cinema-accent" />
                {editingMovie ? 'Edit Movie Details' : 'Publish New Movie to CineBook'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-cinema-muted hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-cinema-text">Movie Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Pushpa 2: The Rule"
                    className="input-field"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">Release Date *</label>
                  <input
                    type="date"
                    required
                    value={form.releaseDate}
                    onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-cinema-text">Plot Summary *</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed synopsis of the movie storyline..."
                  className="input-field resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">Duration (mins) *</label>
                  <input
                    type="number"
                    required
                    min="30"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="input-field font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">Certification</label>
                  <select
                    value={form.certification}
                    onChange={(e) => setForm({ ...form, certification: e.target.value })}
                    className="input-field"
                  >
                    <option value="U">U (Universal)</option>
                    <option value="U/A">U/A (Parental Guidance)</option>
                    <option value="A">A (Adults Only)</option>
                    <option value="S">S (Special)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">Catalog Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="now_showing">Now Showing</option>
                    <option value="coming_soon">Coming Soon</option>
                    <option value="ended">Archived / Ended</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">Rating (0 - 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={form.avgRating}
                    onChange={(e) => setForm({ ...form, avgRating: e.target.value })}
                    className="input-field font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">Genres (comma separated) *</label>
                  <input
                    type="text"
                    required
                    value={form.genre}
                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                    placeholder="Action, Sci-Fi, Drama"
                    className="input-field"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">Languages (comma separated) *</label>
                  <input
                    type="text"
                    required
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    placeholder="Hindi, English, Tamil"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">Director</label>
                  <input
                    type="text"
                    value={form.director}
                    onChange={(e) => setForm({ ...form, director: e.target.value })}
                    placeholder="e.g. Christopher Nolan"
                    className="input-field"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">Trailer YouTube URL</label>
                  <input
                    type="url"
                    value={form.trailerUrl}
                    onChange={(e) => setForm({ ...form, trailerUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-cinema-text">
                  Cast & Roles <span className="text-cinema-muted font-normal">(format: Actor - Role, Actor 2 - Role 2)</span>
                </label>
                <input
                  type="text"
                  value={form.castText}
                  onChange={(e) => setForm({ ...form, castText: e.target.value })}
                  placeholder="Shah Rukh Khan - Vikram Rathore, Nayanthara - Narmada"
                  className="input-field text-xs"
                />
              </div>

              {/* Poster & Banner URL or File Upload + Live Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-2 bg-cinema-surface-2/60 p-3 rounded-lg border border-cinema-border">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-cinema-text">Poster Image (2:3) *</label>
                    <label className="text-[11px] text-cinema-accent hover:underline cursor-pointer flex items-center gap-1 font-medium">
                      <Upload size={12} />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'poster')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    value={form.poster}
                    onChange={(e) => setForm({ ...form, poster: e.target.value })}
                    placeholder="Paste https://... image URL or upload file"
                    className="input-field font-mono text-xs"
                  />
                  {resolvePreviewUrl(form.poster) && (
                    <div className="flex items-center gap-3 pt-1">
                      <img
                        src={resolvePreviewUrl(form.poster)}
                        alt="Poster preview"
                        referrerPolicy="no-referrer"
                        className="w-14 h-20 object-cover rounded border border-cinema-border"
                      />
                      <span className="text-[11px] text-cinema-muted">Live Poster Preview</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 bg-cinema-surface-2/60 p-3 rounded-lg border border-cinema-border">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-cinema-text">Wide Banner Image (16:9)</label>
                    <label className="text-[11px] text-cinema-accent hover:underline cursor-pointer flex items-center gap-1 font-medium">
                      <Upload size={12} />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'banner')}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={form.banner}
                    onChange={(e) => setForm({ ...form, banner: e.target.value })}
                    placeholder="Paste https://... banner URL or upload file"
                    className="input-field font-mono text-xs"
                  />
                  {resolvePreviewUrl(form.banner || form.poster) && (
                    <div className="pt-1 space-y-1">
                      <img
                        src={resolvePreviewUrl(form.banner || form.poster)}
                        alt="Banner preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-20 object-cover rounded border border-cinema-border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Initial Showtime when creating a Now Showing movie */}
              {!editingMovie && form.status === 'now_showing' && cinemas.length > 0 && (
                <div className="bg-cinema-surface-2/60 border border-cinema-border rounded-lg p-3.5 space-y-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleShow}
                      onChange={(e) => setScheduleShow(e.target.checked)}
                      className="rounded border-cinema-border accent-cinema-accent"
                    />
                    <Calendar size={14} className="text-cinema-accent" />
                    <span>Also schedule an initial showtime so customers can book tickets immediately</span>
                  </label>

                  {scheduleShow && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[11px] text-cinema-muted">Cinema Hall</label>
                        <select
                          value={showForm.cinemaId}
                          onChange={(e) => handleCinemaSelect(e.target.value)}
                          className="input-field text-xs"
                        >
                          {cinemas.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name} ({c.city})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-cinema-muted">Screen</label>
                        <select
                          value={showForm.screenId}
                          onChange={(e) => setShowForm({ ...showForm, screenId: e.target.value })}
                          className="input-field text-xs"
                        >
                          {availableScreensForCinema.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.screenName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-cinema-muted">Show Date</label>
                        <input
                          type="date"
                          value={showForm.showDate}
                          onChange={(e) => setShowForm({ ...showForm, showDate: e.target.value })}
                          className="input-field text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-cinema-muted">Start Time</label>
                        <input
                          type="time"
                          value={showForm.startTime}
                          onChange={(e) => setShowForm({ ...showForm, startTime: e.target.value })}
                          className="input-field text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-cinema-muted">End Time</label>
                        <input
                          type="time"
                          value={showForm.endTime}
                          onChange={(e) => setShowForm({ ...showForm, endTime: e.target.value })}
                          className="input-field text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-cinema-muted">Prices (Std / Prem / Recl)</label>
                        <div className="grid grid-cols-3 gap-1">
                          <input
                            type="number"
                            value={showForm.standardPrice}
                            onChange={(e) => setShowForm({ ...showForm, standardPrice: e.target.value })}
                            className="input-field text-[11px] font-mono !px-1.5"
                            title="Standard Price"
                          />
                          <input
                            type="number"
                            value={showForm.premiumPrice}
                            onChange={(e) => setShowForm({ ...showForm, premiumPrice: e.target.value })}
                            className="input-field text-[11px] font-mono !px-1.5"
                            title="Premium Price"
                          />
                          <input
                            type="number"
                            value={showForm.reclinerPrice}
                            onChange={(e) => setShowForm({ ...showForm, reclinerPrice: e.target.value })}
                            className="input-field text-[11px] font-mono !px-1.5"
                            title="Recliner Price"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-cinema-border/60">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-xs !py-2 !px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs !py-2 !px-5 flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>
                    {saving
                      ? 'Publishing...'
                      : editingMovie
                      ? 'Update Movie'
                      : 'Publish Movie'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
