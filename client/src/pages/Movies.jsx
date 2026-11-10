import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMovies } from '../services/movieService';
import { getCinemas } from '../services/cinemaService';
import MovieCard from '../components/movie/MovieCard';
import MovieFilters from '../components/movie/MovieFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { MapPin, Film, Building2 } from 'lucide-react';

export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state initialized from URL search params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || 'All');
  const [language, setLanguage] = useState(searchParams.get('language') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const activeTab = searchParams.get('tab') || 'movies';

  useEffect(() => {
    // If URL query changes, update local state
    const qSearch = searchParams.get('search');
    const qGenre = searchParams.get('genre');
    const qStatus = searchParams.get('status');
    if (qSearch !== null) setSearch(qSearch);
    if (qGenre !== null) setGenre(qGenre);
    if (qStatus !== null) setStatus(qStatus);
  }, [searchParams]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const params = { limit: 50 };
        if (search) params.search = search;
        if (genre && genre !== 'All') params.genre = genre;
        if (language && language !== 'All') params.language = language;
        if (status && status !== 'all') params.status = status;
        if (sortBy) params.sort = sortBy;

        const res = await getMovies(params);
        if (res.success && res.data) {
          setMovies(res.data.movies || []);
        }

        if (activeTab === 'cinemas') {
          const cRes = await getCinemas();
          if (cRes.success && cRes.data) {
            setCinemas(cRes.data);
          }
        }
      } catch (err) {
        console.error('Failed to load movies:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchMovies();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, genre, language, status, sortBy, activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cinema-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Film className="text-cinema-accent" />
            Explore Movies & Theatres
          </h1>
          <p className="text-xs sm:text-sm text-cinema-muted mt-1">
            Browse through our catalogue of blockbuster hits, regional favourites, and IMAX shows
          </p>
        </div>

        {/* Tab switch: Movies vs Cinemas */}
        <div className="flex bg-cinema-surface-2 p-1 rounded-lg border border-cinema-border text-xs">
          <button
            onClick={() => setSearchParams({ tab: 'movies' })}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors ${
              activeTab !== 'cinemas'
                ? 'bg-cinema-accent text-white shadow'
                : 'text-cinema-muted hover:text-white'
            }`}
          >
            <Film size={14} />
            <span>Movies</span>
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'cinemas' })}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors ${
              activeTab === 'cinemas'
                ? 'bg-cinema-accent text-white shadow'
                : 'text-cinema-muted hover:text-white'
            }`}
          >
            <Building2 size={14} />
            <span>Cinemas</span>
          </button>
        </div>
      </div>

      {activeTab === 'cinemas' ? (
        /* Cinemas list */
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Partner Cinema Halls</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cinemas.map((c) => (
              <div key={c._id} className="card p-5 space-y-3 hover:border-cinema-muted transition-all">
                <div className="flex items-center justify-between">
                  <span className="badge bg-cinema-accent/10 text-cinema-accent font-semibold">
                    {c.city}
                  </span>
                  <span className="text-[11px] text-green-400 font-medium">● Active Multiplex</span>
                </div>
                <h3 className="text-lg font-bold text-white">{c.name}</h3>
                <p className="text-xs text-cinema-muted flex items-start gap-1.5">
                  <MapPin size={14} className="text-cinema-accent flex-shrink-0 mt-0.5" />
                  <span>{c.address}</span>
                </p>
                <div className="pt-2 border-t border-cinema-border/50">
                  <p className="text-[11px] text-cinema-muted mb-1.5 font-medium">Screen Amenities:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.facilities?.map((f) => (
                      <span key={f} className="text-[10px] bg-cinema-surface-2 text-zinc-300 px-2 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Movies view with filters and grid */
        <>
          <MovieFilters
            search={search}
            onSearchChange={setSearch}
            selectedGenre={genre}
            onGenreChange={setGenre}
            selectedLanguage={language}
            onLanguageChange={setLanguage}
            selectedStatus={status}
            onStatusChange={setStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {loading ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <LoadingSpinner size="lg" text="Fetching movies..." />
            </div>
          ) : movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center max-w-md mx-auto space-y-4">
              <span className="text-4xl">🎬</span>
              <h3 className="text-lg font-bold text-white">No Movies Found</h3>
              <p className="text-xs text-cinema-muted">
                We couldn't find any movies matching your current filter criteria. Try clearing some filters or searching for another title.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setGenre('All');
                  setLanguage('All');
                  setStatus('all');
                }}
                className="btn-secondary text-xs !py-1.5 !px-4"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
