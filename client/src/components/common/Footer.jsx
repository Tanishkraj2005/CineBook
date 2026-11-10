import { Link } from 'react-router-dom';
import { Film, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-cinema-surface border-t border-cinema-border mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cinema-accent flex items-center justify-center text-white">
                <Film size={18} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Cine<span className="text-cinema-accent">Book</span>
              </span>
            </Link>
            <p className="text-xs text-cinema-muted leading-relaxed">
              Your Movie. Your Seat. Your Experience. Seamless cinema ticketing designed for film lovers across India.
            </p>
            <div className="pt-2 text-xs text-cinema-muted">
              Built with Node.js, Express, MongoDB & React.
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-cinema-muted">
              <li>
                <Link to="/" className="hover:text-cinema-accent transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-cinema-accent transition-colors">Now Showing</Link>
              </li>
              <li>
                <Link to="/movies?status=coming_soon" className="hover:text-cinema-accent transition-colors">Coming Soon</Link>
              </li>
              <li>
                <Link to="/movies?tab=cinemas" className="hover:text-cinema-accent transition-colors">Cinema Locations</Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-cinema-accent transition-colors">My Bookings</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Cities */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Cinemas by City
            </h4>
            <ul className="space-y-2 text-xs text-cinema-muted">
              <li>
                <Link to="/movies?city=Delhi" className="hover:text-cinema-accent transition-colors">Delhi NCR (Select City Walk)</Link>
              </li>
              <li>
                <Link to="/movies?city=Mumbai" className="hover:text-cinema-accent transition-colors">Mumbai (INOX Megaplex)</Link>
              </li>
              <li>
                <Link to="/movies?city=Chandigarh" className="hover:text-cinema-accent transition-colors">Chandigarh (Cinepolis Elante)</Link>
              </li>
              <li>
                <Link to="/movies?city=Ludhiana" className="hover:text-cinema-accent transition-colors">Ludhiana (Grand Walk)</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Demo details */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Support & Demo Info
            </h4>
            <div className="space-y-2 text-xs text-cinema-muted">
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-cinema-accent" />
                <span>support@cinebook.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-cinema-accent" />
                <span>+91 1800-CINE-BOOK</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-cinema-accent" />
                <span>India</span>
              </div>
              <div className="mt-4 pt-3 border-t border-cinema-border/50 text-[11px] text-zinc-500">
                <span className="text-amber-400 font-medium">Demo Mode:</span> Payments and QR tickets are simulated for academic evaluation.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-cinema-border/50 flex flex-col sm:flex-row items-center justify-between text-xs text-cinema-muted gap-4">
          <p>© {new Date().getFullYear()} CineBook Inc. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Crafted with</span>
            <Heart size={12} className="text-cinema-accent fill-cinema-accent" />
            <span>for cinema audiences</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

