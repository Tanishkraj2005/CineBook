const Show = require('../models/Show');
const Screen = require('../models/Screen');
const SeatLock = require('../models/SeatLock');
const { lockSeats, releaseSeats } = require('../services/seatLockService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getShowSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const show = await Show.findById(showId).populate('screenId');
    if (!show) return errorResponse(res, 'Show not found', 404);

    const screen = show.screenId;
    if (!screen) return errorResponse(res, 'Screen configuration not found', 404);

    const now = new Date();
    const activeLocks = await SeatLock.find({ showId, expiresAt: { $gt: now } });
    const currentUserId = req.user ? req.user._id.toString() : null;

    // Build seat layout with status
    const rows = screen.rows.map(row => ({
      rowLabel: row.rowLabel,
      seats: row.seats.map(seat => {
        const isBooked = show.bookedSeats.some(
          bs => bs.row === row.rowLabel && bs.seatNumber === seat.seatNumber
        );
        const lock = activeLocks.find(
          l => l.row === row.rowLabel && l.seatNumber === seat.seatNumber
        );
        const isLockedByOther = lock && lock.userId.toString() !== currentUserId;
        const isLockedByMe = lock && lock.userId.toString() === currentUserId;

        let status = 'available';
        if (isBooked) status = 'booked';
        else if (isLockedByOther) status = 'locked';

        return {
          seatNumber: seat.seatNumber,
          category: seat.category,
          price: seat.price,
          status,
          lockedByCurrentUser: !!isLockedByMe,
        };
      }),
    }));

    return successResponse(res, 'Seat layout fetched', {
      show: { _id: show._id, startTime: show.startTime, endTime: show.endTime, pricing: show.pricing },
      screen: { _id: screen._id, screenName: screen.screenName },
      rows,
    });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch seats', 500, err.message);
  }
};

exports.lockSeats = async (req, res) => {
  try {
    const { showId, seats } = req.body;
    if (!showId || !seats || !seats.length) return errorResponse(res, 'Show ID and seats are required', 400);
    const result = await lockSeats(showId, seats, req.user._id);
    return successResponse(res, 'Seats locked successfully', result);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

exports.releaseSeats = async (req, res) => {
  try {
    const { showId, seats } = req.body;
    if (!showId || !seats) return errorResponse(res, 'Show ID and seats are required', 400);
    await releaseSeats(showId, seats, req.user._id);
    return successResponse(res, 'Seats released');
  } catch (err) {
    return errorResponse(res, 'Failed to release seats', 500, err.message);
  }
};
