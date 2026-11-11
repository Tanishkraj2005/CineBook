const Booking = require('../models/Booking');
const Show = require('../models/Show');
const { verifyLocksExist } = require('../services/seatLockService');
const generateBookingId = require('../utils/generateBookingId');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../services/auditService');

exports.createBooking = async (req, res) => {
  try {
    const { showId, seats } = req.body;
    if (!showId || !seats || !seats.length) return errorResponse(res, 'Show and seats are required', 400);

    const show = await Show.findById(showId).populate('screenId');
    if (!show) return errorResponse(res, 'Show not found', 404);

    // Verify locks exist for this user
    await verifyLocksExist(showId, seats, req.user._id);

    // Calculate pricing
    const screen = show.screenId;
    let totalAmount = 0;
    const enrichedSeats = seats.map(seat => {
      const rowData = screen.rows.find(r => r.rowLabel === seat.row);
      const seatData = rowData?.seats.find(s => s.seatNumber === seat.seatNumber);
      const category = seatData?.category || 'standard';
      const price = show.pricing[category] || seatData?.price || 200;
      totalAmount += price;
      return { row: seat.row, seatNumber: seat.seatNumber, category, price };
    });

    const convenienceFee = 30;
    const finalAmount = totalAmount + convenienceFee;

    // Generate unique bookingId
    let bookingId;
    let attempts = 0;
    do {
      bookingId = generateBookingId();
      attempts++;
    } while (attempts < 5 && await Booking.findOne({ bookingId }));

    const booking = await Booking.create({
      bookingId,
      userId: req.user._id,
      showId,
      seats: enrichedSeats,
      totalAmount,
      convenienceFee,
      taxes: 0,
      finalAmount,
      bookingStatus: 'pending',
      paymentStatus: 'pending',
    });

    await logAudit({
      action: 'BOOKING_CREATED',
      entityType: 'Booking',
      entityId: booking.bookingId,
      performedBy: req.user._id,
      details: { seats: enrichedSeats.map(s => `${s.row}${s.seatNumber}`), finalAmount },
    });

    return successResponse(res, 'Booking created. Proceed to payment.', booking, 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      Booking.find({ userId: req.user._id })
        .populate({
          path: 'showId',
          populate: [
            { path: 'movieId', select: 'title poster genre duration language' },
            { path: 'cinemaId', select: 'name city address' },
            { path: 'screenId', select: 'screenName' },
          ],
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments({ userId: req.user._id }),
    ]);

    return successResponse(res, 'Bookings fetched', { bookings, total, page: parseInt(page) });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch bookings', 500, err.message);
  }
};

exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id })
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId' },
          { path: 'cinemaId' },
          { path: 'screenId', select: 'screenName' },
        ],
      })
      .populate('userId', 'name email phone')
      .populate('paymentId');

    if (!booking) return errorResponse(res, 'Booking not found', 404);

    // Only allow owner or admin
    if (req.user.role !== 'admin' && booking.userId._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    return successResponse(res, 'Booking fetched', booking);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch booking', 500, err.message);
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id }).populate({
      path: 'showId',
      populate: { path: 'movieId', select: 'title' },
    });

    if (!booking) return errorResponse(res, 'Booking not found', 404);
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied', 403);
    }
    if (booking.bookingStatus === 'cancelled') return errorResponse(res, 'Booking is already cancelled', 400);

    // Check if show is at least 1 hour away
    const show = booking.showId;
    if (show) {
      const showDateTime = new Date(show.showDate);
      const [hours, minutes] = show.startTime.split(':');
      showDateTime.setHours(parseInt(hours), parseInt(minutes));
      const hourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      if (showDateTime < hourFromNow) {
        return errorResponse(res, 'Bookings can only be cancelled at least 1 hour before the show', 400);
      }

      // Remove from show's booked seats
      await Show.findByIdAndUpdate(show._id, {
        $pull: { bookedSeats: { $in: booking.seats.map(s => ({ row: s.row, seatNumber: s.seatNumber })) } },
      });
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refunded';
    await booking.save();

    await logAudit({
      action: 'BOOKING_CANCELLED',
      entityType: 'Booking',
      entityId: booking.bookingId,
      performedBy: req.user._id,
      details: { reason: booking.cancellationReason, refunded: booking.paymentStatus === 'refunded' },
    });

    return successResponse(res, 'Booking cancelled successfully', booking);
  } catch (err) {
    return errorResponse(res, 'Failed to cancel booking', 500, err.message);
  }
};

// Validates a ticket QR identifier at gate entry
exports.verifyTicket = async (req, res) => {
  try {
    const { ticketIdentifier } = req.body;
    if (!ticketIdentifier) return errorResponse(res, 'Ticket identifier or QR code string is required', 400);

    // Support raw bookingId (CB-XXXXXXX) or full QR format (CINEBOOK-VERIFY-CB-XXXXXXX)
    let cleanId = ticketIdentifier.trim();
    if (cleanId.startsWith('CINEBOOK-VERIFY-')) {
      cleanId = cleanId.replace('CINEBOOK-VERIFY-', '');
    }

    const booking = await Booking.findOne({ bookingId: cleanId })
      .populate('userId', 'name email phone')
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId', select: 'title poster duration certification' },
          { path: 'cinemaId', select: 'name city' },
          { path: 'screenId', select: 'screenName' },
        ],
      });

    if (!booking) {
      return errorResponse(res, `Ticket Invalid: No booking found for reference "${cleanId}"`, 404);
    }

    if (booking.bookingStatus === 'cancelled') {
      return errorResponse(res, `Entry Rejected: Booking ${booking.bookingId} was CANCELLED and refunded`, 400);
    }

    if (booking.bookingStatus !== 'confirmed' || booking.paymentStatus !== 'paid') {
      return errorResponse(res, `Entry Rejected: Booking ${booking.bookingId} payment is unconfirmed (${booking.paymentStatus})`, 400);
    }

    if (booking.isAdmitted) {
      return errorResponse(
        res,
        `Duplicate Entry Blocked: Ticket ${booking.bookingId} was ALREADY ADMITTED at ${new Date(booking.admittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        409,
        {
          alreadyAdmitted: true,
          admittedAt: booking.admittedAt,
          bookingId: booking.bookingId,
        }
      );
    }

    // Mark as admitted
    booking.isAdmitted = true;
    booking.admittedAt = new Date();
    booking.admittedBy = req.user._id;
    await booking.save();

    await logAudit({
      action: 'TICKET_ADMITTED',
      entityType: 'Booking',
      entityId: booking.bookingId,
      performedBy: req.user._id,
      details: {
        admittedAt: booking.admittedAt,
        movie: booking.showId?.movieId?.title,
        seats: booking.seats.map(s => `${s.row}${s.seatNumber}`),
      },
    });

    return successResponse(res, `Ticket Verified! Entry Granted for ${booking.seats.length} attendee(s).`, {
      admitted: true,
      admittedAt: booking.admittedAt,
      booking,
    });
  } catch (err) {
    return errorResponse(res, 'Failed to verify ticket', 500, err.message);
  }
};
