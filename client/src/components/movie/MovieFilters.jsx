import { Search } from 'lucide-react';
import { GENRES, LANGUAGES } from '../../utils/constants';

export default function MovieFilters({
  search = '',
  onSearchChange = () => {},
  selectedGenre = 'All',
  onGenreChange = () => {},
  selectedLanguage = 'All',
  onLanguageChange = () => {},
  selectedStatus = 'all',
  onStatusChange = () => {},
  sortBy = 'popularity',
  onSortChange = () => {},
}) {
  return (
    <div className="bg-cinema-surface border border-cinema-border rounded-xl p-4 space-y-4 mb-6 shadow-sm">
      {/* Top row: Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-muted" />
          <input
            type="text"
            placeholder="Search movie title, director..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field !pl-9 !py-2 text-xs"
          />
        </div>

        {/* Status toggles & Sort dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex bg-cinema-surface-2 p-1 rounded-lg border border-cinema-border text-xs">
            <button
              onClick={() => onStatusChange('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-cinema-accent text-white font-medium'
                  : 'text-cinema-muted hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onStatusChange('now_showing')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedStatus === 'now_showing'
                  ? 'bg-cinema-accent text-white font-medium'
                  : 'text-cinema-muted hover:text-white'
              }`}
            >
              Now Showing
            </button>
            <button
              onClick={() => onStatusChange('coming_soon')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedStatus === 'coming_soon'
                  ? 'bg-cinema-accent text-white font-medium'
                  : 'text-cinema-muted hover:text-white'
              }`}
            >
              Coming Soon
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-cinema-surface-2 border border-cinema-border rounded-md px-2.5 py-1.5 text-xs text-cinema-text focus:outline-none focus:border-cinema-accent cursor-pointer"
          >
            <option value="popularity">Most Popular</option>
            <option value="rating">Highest Rating</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Genre Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] text-cinema-muted font-medium mr-1 flex-shrink-0">
          Genre:
        </span>
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => onGenreChange(g)}
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-colors flex-shrink-0 ${
              selectedGenre === g
                ? 'bg-white text-black font-semibold shadow'
                : 'bg-cinema-surface-2 text-cinema-muted hover:text-white hover:bg-zinc-700/60'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Language Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] text-cinema-muted font-medium mr-1 flex-shrink-0">
          Language:
        </span>
        {LANGUAGES.map((l) => (
          <button
            key={l}
            onClick={() => onLanguageChange(l)}
            className={`text-xs px-2.5 py-0.5 rounded-md whitespace-nowrap transition-colors flex-shrink-0 ${
              selectedLanguage === l
                ? 'bg-cinema-accent/20 border border-cinema-accent text-cinema-accent font-medium'
                : 'text-cinema-muted hover:text-white border border-transparent'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

