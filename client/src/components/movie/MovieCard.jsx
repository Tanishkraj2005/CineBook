import { Link } from 'react-router-dom';
import { Star, Clock, Ticket } from 'lucide-react';
import { TMDB_POSTER_SM } from '../../utils/constants';
import { formatDuration } from '../../utils/formatters';

export default function MovieCard({ movie }) {
  if (!movie) return null;

  const posterUrl = movie.poster
    ? movie.poster.startsWith('http') || movie.poster.startsWith('data:')
      ? movie.poster
      : `${TMDB_POSTER_SM}${movie.poster}`
    : null;

  const isNowShowing = movie.status === 'now_showing';

  return (
    <div className="group flex flex-col bg-cinema-surface border border-cinema-border rounded-lg overflow-hidden hover:border-cinema-muted/60 transition-all duration-300 hover:shadow-xl hover:shadow-black/50">
      {/* Poster with overlay badges */}
      <Link
        to={`/movies/${movie._id}`}
        className="relative aspect-[2/3] w-full overflow-hidden bg-cinema-surface-2 block"
      >
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-cinema-muted p-4 text-center">
            <span className="text-3xl mb-2">🎬</span>
            <span className="text-xs font-medium">{movie.title}</span>
          </div>
        )}

        {/* Rating badge */}
        {movie.avgRating > 0 && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-xs font-semibold text-yellow-400 border border-yellow-500/20 shadow-md">
            <Star size={11} className="fill-yellow-400 text-yellow-400" />
            <span>{movie.avgRating.toFixed(1)}</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded shadow ${
              isNowShowing
                ? 'bg-cinema-accent text-white'
                : 'bg-zinc-800/90 text-amber-300 border border-amber-500/30'
            }`}
          >
            {isNowShowing ? 'Now Showing' : 'Coming Soon'}
          </span>
        </div>

        {/* Certification badge bottom right */}
        {movie.certification && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/75 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-zinc-300 border border-zinc-700">
            {movie.certification}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/movies/${movie._id}`}>
            <h3 className="font-semibold text-sm text-cinema-text group-hover:text-cinema-accent transition-colors line-clamp-1">
              {movie.title}
            </h3>
          </Link>

          {/* Genres */}
          <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
            {(Array.isArray(movie.genre) ? movie.genre : [movie.genre])
              .slice(0, 2)
              .map((g) => (
                <span
                  key={g}
                  className="text-[10px] bg-cinema-surface-2 text-cinema-muted px-1.5 py-0.5 rounded"
                >
                  {g}
                </span>
              ))}
          </div>
        </div>

        {/* Footer meta & button */}
        <div className="pt-2 border-t border-cinema-border/50">
          <div className="flex items-center justify-between text-xs text-cinema-muted mb-2.5">
            <div className="flex items-center gap-1">
              <Clock size={11} />
              <span>{formatDuration(movie.duration)}</span>
            </div>
            <span className="truncate max-w-[90px]">
              {Array.isArray(movie.language) ? movie.language.join(', ') : movie.language}
            </span>
          </div>

          <Link
            to={`/movies/${movie._id}`}
            className="w-full flex items-center justify-center gap-1.5 bg-cinema-surface-2 hover:bg-cinema-accent text-cinema-text hover:text-white py-1.5 px-3 rounded text-xs font-medium transition-colors"
          >
            <Ticket size={13} />
            <span>{isNowShowing ? 'Book Tickets' : 'View Details'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

