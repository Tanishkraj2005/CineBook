import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMovie } from '../services/movieService';
import { getShowsByMovie } from '../services/showService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { TMDB_BANNER, TMDB_POSTER_MD } from '../utils/constants';
import { formatDuration, formatDate, formatTime, formatCurrency } from '../utils/formatters';
import {
  Star,
  Clock,
  Calendar,
  Film,
  MapPin,
  Play,
  Ticket,
  ChevronRight,
  Shield,
  Users,
  X,
} from 'lucide-react';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [groupedShows, setGroupedShows] = useState({});
  const [loading, setLoading] = useState(true);
  const [trailerOpen, setTrailerOpen] = useState(false);

  // Show selection state
  const [selectedCity, setSelectedCity] = useState(
    localStorage.getItem('cinebook_city') || 'Delhi'
  );
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const [mRes, sRes] = await Promise.all([
          getMovie(id),
          getShowsByMovie(id),
        ]);

        if (mRes.success && mRes.data) {
          setMovie(mRes.data);
        }

        if (sRes.success && sRes.data) {
          setGroupedShows(sRes.data);

          // Find available cities
          const cities = Object.keys(sRes.data);
          let cityToUse = selectedCity;
          if (cities.length > 0 && !cities.includes(selectedCity)) {
            cityToUse = cities[0];
            setSelectedCity(cityToUse);
          }

          // Find available dates for chosen city
          if (sRes.data[cityToUse]) {
            const cinemaIds = Object.keys(sRes.data[cityToUse]);
            if (cinemaIds.length > 0) {
              const dates = Object.keys(sRes.data[cityToUse][cinemaIds[0]].dates || {});
              if (dates.length > 0) {
                setSelectedDate(dates[0]);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load movie details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading movie details and showtimes..." />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Movie Not Found</h2>
        <p className="text-xs text-cinema-muted">The requested movie could not be located.</p>
        <Link to="/movies" className="btn-primary inline-flex items-center gap-1.5 text-xs">
          Back to Movies
        </Link>
      </div>
    );
  }

  const bannerUrl = movie.banner
    ? movie.banner.startsWith('http') || movie.banner.startsWith('data:')
      ? movie.banner
      : `${TMDB_BANNER}${movie.banner}`
    : movie.poster
    ? movie.poster.startsWith('http') || movie.poster.startsWith('data:')
      ? movie.poster
      : `${TMDB_BANNER}${movie.poster}`
    : 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&auto=format&fit=crop&q=80';

  const posterUrl = movie.poster
    ? movie.poster.startsWith('http') || movie.poster.startsWith('data:')
      ? movie.poster
      : `${TMDB_POSTER_MD}${movie.poster}`
    : null;

  // Extract cities present in grouped shows
  const availableCities = Object.keys(groupedShows);
  const cityCinemas = (selectedCity && groupedShows[selectedCity]) || {};

  // Extract all unique dates available across cinemas in this city
  const availableDatesSet = new Set();
  Object.values(cityCinemas).forEach((c) => {
    Object.keys(c.dates || {}).forEach((d) => availableDatesSet.add(d));
  });
  const availableDates = Array.from(availableDatesSet).sort();

  return (
    <div className="space-y-10 pb-20">
      {/* Cinematic Banner Header */}
      <section className="relative w-full h-[400px] sm:h-[480px] overflow-hidden bg-black">
        <img
          src={bannerUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-top opacity-35 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-cinema-bg/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg via-cinema-bg/60 to-transparent" />

        {/* Floating movie title & essentials */}
        <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-end gap-6">
            {/* Poster thumbnail */}
            {posterUrl && (
              <div className="hidden sm:block w-48 aspect-[2/3] rounded-lg overflow-hidden border-2 border-cinema-border shadow-2xl flex-shrink-0 bg-cinema-surface -mb-16 z-20">
                <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Title & metadata */}
            <div className="space-y-3 z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge bg-cinema-accent text-white font-semibold">
                  {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                </span>
                {movie.certification && (
                  <span className="badge bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Cert: {movie.certification}
                  </span>
                )}
                {movie.avgRating > 0 && (
                  <span className="badge bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-semibold">
                    <Star size={11} className="fill-yellow-400" />
                    {movie.avgRating.toFixed(1)} / 10
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-cinema-muted">
                <div className="flex items-center gap-1 text-white">
                  <Clock size={13} className="text-cinema-accent" />
                  <span>{formatDuration(movie.duration)}</span>
                </div>
                <span>•</span>
                <span>
                  {Array.isArray(movie.language) ? movie.language.join(', ') : movie.language}
                </span>
                <span>•</span>
                <span>
                  {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
                </span>
                {movie.releaseDate && (
                  <>
                    <span>•</span>
                    <span>Released {formatDate(movie.releaseDate)}</span>
                  </>
                )}
              </div>

              {movie.trailerUrl && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setTrailerOpen(true)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-1.5 rounded-md transition-colors backdrop-blur-md cursor-pointer"
                  >
                    <Play size={13} className="fill-white" />
                    <span>Watch Official Trailer</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Synopsis & Cast Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:pt-4">
          {/* Synopsis */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 space-y-4">
              <h2 className="text-lg font-bold text-white tracking-tight">About the Movie</h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {movie.description}
              </p>

              {movie.director && (
                <div className="pt-4 border-t border-cinema-border/50 text-xs">
                  <span className="text-cinema-muted font-medium">Directed by: </span>
                  <span className="text-white font-semibold">{movie.director}</span>
                </div>
              )}
            </div>

            {/* Cast & Crew */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="card p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-cinema-accent" />
                  Key Cast & Characters
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {movie.cast.map((c, i) => (
                    <div
                      key={i}
                      className="bg-cinema-surface-2 p-3 rounded-lg border border-cinema-border text-xs"
                    >
                      <p className="font-semibold text-white truncate">{c.name}</p>
                      <p className="text-[11px] text-cinema-muted truncate mt-0.5">
                        as {c.role || 'Performer'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Side Info Box */}
          <div className="space-y-4">
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Booking Information
              </h3>
              <ul className="space-y-3 text-xs text-cinema-muted">
                <li className="flex items-start gap-2">
                  <Shield size={14} className="text-cinema-accent flex-shrink-0 mt-0.5" />
                  <span>
                    Concurrence lock prevents duplicate booking attempts. Selected seats are reserved for 10 minutes during checkout.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Ticket size={14} className="text-cinema-accent flex-shrink-0 mt-0.5" />
                  <span>
                    Instant digital ticket generated with QR code verification upon confirmed payment simulation.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock size={14} className="text-cinema-accent flex-shrink-0 mt-0.5" />
                  <span>
                    Free cancellations supported up to 1 hour prior to show start time.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section: Select Theatres & Showtimes */}
        <section className="space-y-6 pt-4 border-t border-cinema-border">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Ticket className="text-cinema-accent" />
              Select Cinema & Showtimes
            </h2>
            <p className="text-xs text-cinema-muted mt-1">
              Choose your city, date, and preferred multiplex timing to begin seat selection
            </p>
          </div>

          {/* City Selection Tabs */}
          {availableCities.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs text-cinema-muted font-medium flex items-center gap-1 mr-2 flex-shrink-0">
                  <MapPin size={13} className="text-cinema-accent" />
                  City:
                </span>
                {availableCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      const cinemaIds = Object.keys(groupedShows[city] || {});
                      if (cinemaIds.length > 0) {
                        const dates = Object.keys(groupedShows[city][cinemaIds[0]].dates || {});
                        if (dates.length > 0) setSelectedDate(dates[0]);
                      }
                    }}
                    className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all flex-shrink-0 ${
                      selectedCity === city
                        ? 'bg-cinema-accent text-white shadow-md shadow-cinema-accent/20'
                        : 'bg-cinema-surface text-cinema-muted hover:text-white border border-cinema-border'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              {/* Date Tabs */}
              {availableDates.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <span className="text-xs text-cinema-muted font-medium flex items-center gap-1 mr-2 flex-shrink-0">
                    <Calendar size={13} />
                    Date:
                  </span>
                  {availableDates.map((dateStr) => {
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
                          isSelected
                            ? 'bg-white text-black font-bold shadow'
                            : 'bg-cinema-surface-2 text-cinema-muted hover:text-white border border-cinema-border'
                        }`}
                      >
                        {formatDate(dateStr)}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Cinemas & Showtimes Accordion / Cards */}
              <div className="space-y-4 pt-2">
                {Object.keys(cityCinemas).map((cinemaId) => {
                  const cinemaData = cityCinemas[cinemaId];
                  const cinemaObj = cinemaData.cinema;
                  const showsForDate = (cinemaData.dates && cinemaData.dates[selectedDate]) || [];

                  return (
                    <div
                      key={cinemaId}
                      className="card p-5 space-y-4 border border-cinema-border hover:border-cinema-muted/60 transition-colors"
                    >
                      {/* Cinema Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cinema-border/50 pb-3">
                        <div>
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <MapPin size={15} className="text-cinema-accent" />
                            {cinemaObj.name}
                          </h3>
                          <p className="text-xs text-cinema-muted pl-6">{cinemaObj.address}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 pl-6 sm:pl-0">
                          {cinemaObj.facilities?.slice(0, 3).map((f) => (
                            <span
                              key={f}
                              className="text-[10px] bg-cinema-surface-2 text-zinc-400 px-2 py-0.5 rounded"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Show Time Buttons */}
                      <div>
                        {showsForDate.length > 0 ? (
                          <div className="flex flex-wrap gap-3">
                            {showsForDate.map((show) => (
                              <button
                                key={show._id}
                                onClick={() => navigate(`/shows/${show._id}/seats`)}
                                className="group bg-cinema-surface-2 hover:bg-cinema-accent border border-cinema-border hover:border-cinema-accent rounded-lg p-3 text-left transition-all duration-200 hover:shadow-lg active:scale-95 min-w-[130px]"
                              >
                                <span className="text-sm font-bold text-white group-hover:text-white block">
                                  {formatTime(show.startTime)}
                                </span>
                                <span className="text-[10px] text-cinema-muted group-hover:text-white/80 block mt-0.5">
                                  Standard from {formatCurrency(show.pricing?.standard || 200)}
                                </span>
                                <span className="text-[9px] text-green-400 group-hover:text-white font-medium block mt-1">
                                  {show.availableSeats} Seats Available
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-cinema-muted italic py-2">
                            No shows scheduled for this cinema on the selected date. Please choose another date above.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center space-y-3">
              <Film size={32} className="mx-auto text-cinema-muted" />
              <p className="text-sm font-semibold text-white">No Active Shows Found</p>
              <p className="text-xs text-cinema-muted max-w-sm mx-auto">
                Shows for this movie are not currently scheduled in your area. Please check back soon or browse other currently showing films.
              </p>
            </div>
          )}
        </section>
      </div>
      {/* Video Trailer Modal */}
      {trailerOpen && movie.trailerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl bg-cinema-surface border border-cinema-border rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-cinema-border bg-cinema-surface-2">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Play size={14} className="text-cinema-accent fill-cinema-accent" />
                {movie.title} – Official Trailer
              </span>
              <button
                onClick={() => setTrailerOpen(false)}
                className="p-1.5 rounded-full hover:bg-cinema-surface text-cinema-muted hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              {(() => {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = movie.trailerUrl.match(regExp);
                const videoId = match && match[2].length === 11 ? match[2] : null;
                return videoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                    title={`${movie.title} Trailer`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-cinema-muted">
                    Trailer preview unavailable
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
