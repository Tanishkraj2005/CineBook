import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { getBooking } from '../services/bookingService';
import TicketView from '../components/booking/TicketView';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  CheckCircle2,
  Download,
  Printer,
  Ticket,
  Film,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const ticketRef = useRef(null);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const res = await getBooking(bookingId);
        if (res.success && res.data) {
          setBooking(res.data);
        }
      } catch (err) {
        console.error('Failed to load booking details:', err);
        toast.error('Could not find booking reference');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleDownloadPdf = async () => {
    if (!ticketRef.current) return;
    try {
      setDownloading(true);
      toast.loading('Generating your PDF ticket...', { id: 'pdf-toast' });

      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#181818',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 20, imgWidth, imgHeight);
      pdf.save(`CineBook-Ticket-${bookingId}.pdf`);

      toast.success('Ticket downloaded successfully!', { id: 'pdf-toast' });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      toast.error('Could not export PDF ticket', { id: 'pdf-toast' });
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Retrieving booking confirmation..." />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Booking Not Found</h2>
        <p className="text-xs text-cinema-muted">
          No records matching booking ID <strong className="text-white">#{bookingId}</strong> were located.
        </p>
        <Link to="/movies" className="btn-primary inline-flex items-center gap-1.5 text-xs">
          Browse Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Success banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto text-green-400 shadow-xl shadow-green-500/10 animate-bounce">
          <CheckCircle2 size={36} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Booking Confirmed!
        </h1>
        <p className="text-xs sm:text-sm text-cinema-muted max-w-md mx-auto">
          Your cinema seats have been successfully reserved. A copy of your digital boarding ticket has been issued below.
        </p>
        <div className="inline-flex items-center gap-2 bg-cinema-surface border border-cinema-border px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-cinema-accent">
          <span>Booking Reference: #{booking.bookingId}</span>
        </div>
      </div>

      {/* Digital Ticket Presentation */}
      <div className="py-2">
        <TicketView ref={ticketRef} booking={booking} />
      </div>

      {/* Action Buttons: PDF Download, Print, Nav */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="btn-primary flex items-center gap-2 text-xs !py-2.5 !px-5 shadow-lg shadow-cinema-accent/20"
        >
          <Download size={14} />
          <span>{downloading ? 'Preparing PDF...' : 'Download PDF Ticket'}</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="btn-secondary flex items-center gap-2 text-xs !py-2.5 !px-4"
        >
          <Printer size={14} />
          <span>Print Ticket</span>
        </button>

        <Link
          to="/my-bookings"
          className="btn-secondary flex items-center gap-2 text-xs !py-2.5 !px-4"
        >
          <Ticket size={14} />
          <span>Go to My Bookings</span>
        </Link>

        <Link
          to="/movies"
          className="btn-ghost flex items-center gap-1.5 text-xs text-cinema-muted hover:text-white"
        >
          <span>Book Another Movie</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Guidelines footer note */}
      <div className="card p-4 text-xs text-cinema-muted space-y-1.5 max-w-xl mx-auto text-center border-cinema-border/60">
        <p className="font-semibold text-white flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-green-400" />
          Cinema Entry Guidelines
        </p>
        <p>
          Please arrive 15 minutes before showtime. You can present either the digital QR pass on your mobile screen or a printed paper ticket at the security podium.
        </p>
      </div>
    </div>
  );
}
