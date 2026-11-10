import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMovies } from '../services/movieService';
import { getCinemas } from '../services/cinemaService';
import MovieCard from '../components/movie/MovieCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { TMDB_BANNER, GENRES } from '../utils/constants';
import {
  Film,
  Sparkles,
  Ticket,
  ChevronRight,
  MapPin,
  Star,
  Search,
  Calendar,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [moviesRes, cinemasRes] = await Promise.all([
          getMovies({ limit: 50 }),
          getCinemas(),
        ]);

        if (moviesRes.success && moviesRes.data) {
          const allMovies = moviesRes.data.movies || [];
          const now = allMovies.filter((m) => m.status === 'now_showing');
          const coming = allMovies.filter((m) => m.status === 'coming_soon');

          setNowShowing(now);
          setComingSoon(coming);

          // Select top rated now_showing movie as hero banner
          if (now.length > 0) {
            setFeaturedMovie(now[0]);
          }
        }

        if (cinemasRes.success && cinemasRes.data) {
          setCinemas(cinemasRes.data);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading CineBook movies..." />
      </div>
    );
  }

  const heroBannerUrl = featuredMovie?.banner
    ? featuredMovie.banner.startsWith('http') || featuredMovie.banner.startsWith('data:')
      ? featuredMovie.banner
      : `${TMDB_BANNER}${featuredMovie.banner}`
    : 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&auto=format&fit=crop&q=80';

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      {featuredMovie && (
        <section className="relative w-full h-[480px] sm:h-[560px] lg:h-[620px] overflow-hidden">
          {/* Background image with cinematic gradient masks */}
          <div className="absolute inset-0">
            <img
              src={heroBannerUrl}
              alt={featuredMovie.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top opacity-60 scale-105 transform animate-pulse-slow"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&auto=format&fit=crop&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-cinema-bg/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg via-cinema-bg/50 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-16">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-cinema-accent/20 border border-cinema-accent/40 text-cinema-accent px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
                <Sparkles size={13} />
                <span>Featured Premiere</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                {featuredMovie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-cinema-muted">
                {featuredMovie.avgRating > 0 && (
                  <span className="flex items-center gap-1 font-semibold text-yellow-400 bg-black/60 px-2 py-0.5 rounded border border-yellow-500/20">
                    <Star size={13} className="fill-yellow-400" />
                    {featuredMovie.avgRating.toFixed(1)} / 10
                  </span>
                )}
                <span>{featuredMovie.duration} mins</span>
                <span>•</span>
                <span>
                  {Array.isArray(featuredMovie.language)
                    ? featuredMovie.language.join(', ')
                    : featuredMovie.language}
                </span>
                <span>•</span>
                <span>
                  {Array.isArray(featuredMovie.genre)
                    ? featuredMovie.genre.join(', ')
                    : featuredMovie.genre}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 line-clamp-3 leading-relaxed">
                {featuredMovie.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={`/movies/${featuredMovie._id}`}
                  className="btn-primary flex items-center gap-2 !py-2.5 !px-6 text-sm"
                >
                  <Ticket size={16} />
                  <span>Book Tickets Now</span>
                </Link>
                {featuredMovie.trailerUrl && (
                  <a
                    href={featuredMovie.trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary flex items-center gap-2 !py-2.5 !px-5 text-sm"
                  >
                    <span>Watch Trailer</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Search & Genre Discovery Bar */}
        <div className="card p-4 sm:p-6 shadow-xl relative -mt-8 sm:-mt-10 z-20 backdrop-blur-md bg-cinema-surface/95 border-cinema-border">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cinema-muted"
              />
              <input
                type="text"
                placeholder="Search movies by title, actors, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field !pl-10 !py-3"
              />
            </div>
            <button type="submit" className="btn-primary flex items-center justify-center gap-2">
              <Search size={15} />
              <span>Search Movies</span>
            </button>
          </form>

          {/* Quick Genre Chips */}
          <div className="mt-4 pt-3 border-t border-cinema-border/50 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-cinema-muted font-medium mr-1 flex-shrink-0">
              Popular Genres:
            </span>
            {GENRES.filter((g) => g !== 'All').map((genre) => (
              <Link
                key={genre}
                to={`/movies?genre=${genre}`}
                className="text-xs px-3 py-1 rounded-full bg-cinema-surface-2 hover:bg-white hover:text-black text-cinema-muted font-medium transition-colors flex-shrink-0"
              >
                {genre}
              </Link>
            ))}
          </div>
        </div>

        {/* Currently Showing Section */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cinema-accent animate-ping" />
                Now Showing in Theatres
              </h2>
              <p className="text-xs text-cinema-muted mt-0.5">
                Catch the latest blockbuster releases on the big screen
              </p>
            </div>
            <Link
              to="/movies?status=now_showing"
              className="text-xs font-semibold text-cinema-accent hover:underline flex items-center gap-1"
            >
              <span>See All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {nowShowing.slice(0, 10).map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Coming Soon Section */}
        {comingSoon.length > 0 && (
          <section className="space-y-5 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Calendar size={20} className="text-amber-400" />
                  Upcoming Premieres
                </h2>
                <p className="text-xs text-cinema-muted mt-0.5">
                  Exciting upcoming movies scheduled to release soon
                </p>
              </div>
              <Link
                to="/movies?status=coming_soon"
                className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>View Upcoming</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {comingSoon.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Cinema Hall Locations Feature Section */}
        <section className="bg-gradient-to-r from-cinema-surface via-cinema-surface-2 to-cinema-surface border border-cinema-border rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <span className="badge bg-cinema-accent/10 border border-cinema-accent/30 text-cinema-accent">
                State of the art sound & screens
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Premium Cinema Halls in Premier Metros
              </h2>
              <p className="text-xs sm:text-sm text-cinema-muted leading-relaxed">
                Experience crystal clear 4K Laser Projection, immersive Dolby Atmos sound, and luxurious reclining seats across top shopping destinations in Delhi, Mumbai, and Chandigarh.
              </p>
              <div className="flex flex-wrap gap-4 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                  <Zap size={14} className="text-yellow-400" />
                  <span>Real-time Seat Locking</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                  <ShieldCheck size={14} className="text-green-400" />
                  <span>Instant QR Verification</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
              {cinemas.map((c) => (
                <div
                  key={c._id}
                  className="bg-cinema-bg/80 border border-cinema-border p-3.5 rounded-lg text-xs space-y-1 hover:border-cinema-accent transition-colors"
                >
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <MapPin size={13} className="text-cinema-accent flex-shrink-0" />
                    <span>{c.name}</span>
                  </p>
                  <p className="text-[11px] text-cinema-muted pl-4">{c.city}</p>
                  <div className="flex flex-wrap gap-1 pt-1 pl-4">
                    {c.facilities?.slice(0, 3).map((f) => (
                      <span key={f} className="text-[9px] bg-cinema-surface text-zinc-400 px-1.5 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
