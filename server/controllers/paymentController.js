const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const SeatLock = require('../models/SeatLock');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../services/auditService');

exports.createPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, amount } = req.body;
    if (!bookingId || !paymentMethod) return errorResponse(res, 'Booking ID and payment method are required', 400);

    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, 'Booking not found', 404);
    if (booking.userId.toString() !== req.user._id.toString()) return errorResponse(res, 'Access denied', 403);
    if (booking.bookingStatus !== 'pending') return errorResponse(res, 'This booking cannot be paid', 400);

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const payment = await Payment.create({
      bookingId: booking._id,
      userId: req.user._id,
      paymentMethod,
      amount: amount || booking.finalAmount,
      transactionId,
      paymentStatus: 'pending',
    });

    return successResponse(res, 'Payment initiated', { paymentId: payment._id, transactionId }, 201);
  } catch (err) {
    return errorResponse(res, 'Failed to initiate payment', 500, err.message);
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, transactionId } = req.body;
    if (!paymentId) return errorResponse(res, 'Payment ID is required', 400);

    const payment = await Payment.findById(paymentId).populate('bookingId');
    if (!payment) return errorResponse(res, 'Payment not found', 404);

    // Simulate payment verification - always succeeds in demo mode
    payment.paymentStatus = 'success';
    payment.paymentGatewayResponse = {
      status: 'SUCCESS',
      transactionId: payment.transactionId,
      timestamp: new Date().toISOString(),
      mode: 'DEMO',
    };
    await payment.save();

    // Confirm the booking
    const booking = await Booking.findById(payment.bookingId._id);
    booking.bookingStatus = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.paymentId = payment._id;
    await booking.save();

    // Update show's booked seats
    const seatsToAdd = booking.seats.map(s => ({ row: s.row, seatNumber: s.seatNumber }));
    await Show.findByIdAndUpdate(booking.showId, {
      $push: { bookedSeats: { $each: seatsToAdd } },
    });

    // Release seat locks
    await SeatLock.deleteMany({
      showId: booking.showId,
      $or: booking.seats.map(s => ({ row: s.row, seatNumber: s.seatNumber })),
    });

    await logAudit({
      action: 'PAYMENT_COMPLETED',
      entityType: 'Booking',
      entityId: booking.bookingId,
      performedBy: req.user._id,
      details: {
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        amount: payment.amount,
      },
    });

    return successResponse(res, 'Payment verified. Booking confirmed!', {
      bookingId: booking.bookingId,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
    });
  } catch (err) {
    return errorResponse(res, 'Payment verification failed', 500, err.message);
  }
};
