export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
export const TMDB_POSTER_SM = `${TMDB_IMAGE_BASE}/w342`;
export const TMDB_POSTER_MD = `${TMDB_IMAGE_BASE}/w500`;
export const TMDB_BANNER = `${TMDB_IMAGE_BASE}/original`;

export const CITIES = ['Delhi', 'Mumbai', 'Chandigarh', 'Ludhiana'];

export const SEAT_CATEGORIES = {
  standard: { label: 'Standard', color: 'bg-zinc-700', text: 'text-zinc-200', border: 'border-zinc-600' },
  premium: { label: 'Premium', color: 'bg-amber-900/60', text: 'text-amber-300', border: 'border-amber-700' },
  recliner: { label: 'Recliner', color: 'bg-indigo-900/60', text: 'text-indigo-300', border: 'border-indigo-700' },
};

export const GENRES = [
  'All',
  'Action',
  'Drama',
  'Sci-Fi',
  'Thriller',
  'Comedy',
  'Crime',
  'Adventure',
];

export const LANGUAGES = ['All', 'Hindi', 'English', 'Tamil', 'Telugu', 'Korean'];

export const BOOKING_STATUS = {
  confirmed: { label: 'Confirmed', badgeClass: 'bg-green-500/10 text-green-400 border border-green-500/30' },
  pending: { label: 'Pending', badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-red-500/10 text-red-400 border border-red-500/30' },
};

export const PAYMENT_STATUS = {
  paid: { label: 'Paid', badgeClass: 'bg-green-500/10 text-green-400 border border-green-500/30' },
  pending: { label: 'Pending', badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' },
  refunded: { label: 'Refunded', badgeClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/30' },
  failed: { label: 'Failed', badgeClass: 'bg-red-500/10 text-red-400 border border-red-500/30' },
};

