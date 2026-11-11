const SeatLock = require('../models/SeatLock');
const Show = require('../models/Show');

const getLockDuration = () =>
  parseInt(process.env.SEAT_LOCK_DURATION_MINUTES || '10') * 60 * 1000;

const lockSeats = async (showId, seats, userId) => {
  const show = await Show.findById(showId);
  if (!show) throw new Error('Show not found');
  if (show.status !== 'active') throw new Error('This show is not available for booking');

  // Check permanently booked seats
  for (const seat of seats) {
    const isBooked = show.bookedSeats.some(
      bs => bs.row === seat.row && bs.seatNumber === seat.seatNumber
    );
    if (isBooked) {
      throw new Error(`Seat ${seat.row}${seat.seatNumber} is already booked`);
    }
  }

  // Check locks by other users
  const now = new Date();
  const lockConflicts = await SeatLock.find({
    showId,
    $or: seats.map(s => ({ row: s.row, seatNumber: s.seatNumber })),
    userId: { $ne: userId },
    expiresAt: { $gt: now },
  });

  if (lockConflicts.length > 0) {
    const conflictSeats = lockConflicts.map(l => `${l.row}${l.seatNumber}`).join(', ');
    throw new Error(`Seats ${conflictSeats} are temporarily held by another user. Please try again.`);
  }

  // Remove any existing locks by this user for these seats
  await SeatLock.deleteMany({
    showId,
    userId,
    $or: seats.map(s => ({ row: s.row, seatNumber: s.seatNumber })),
  });

  // Create new locks
  const expiresAt = new Date(Date.now() + getLockDuration());
  const lockDocs = seats.map(s => ({
    showId,
    row: s.row,
    seatNumber: s.seatNumber,
    userId,
    expiresAt,
  }));

  await SeatLock.insertMany(lockDocs);
  return { expiresAt, lockedSeats: seats };
};

const releaseSeats = async (showId, seats, userId) => {
  await SeatLock.deleteMany({
    showId,
    userId,
    $or: seats.map(s => ({ row: s.row, seatNumber: s.seatNumber })),
  });
};

const verifyLocksExist = async (showId, seats, userId) => {
  const now = new Date();
  for (const seat of seats) {
    const lock = await SeatLock.findOne({
      showId,
      row: seat.row,
      seatNumber: seat.seatNumber,
      userId,
      expiresAt: { $gt: now },
    });
    if (!lock) {
      throw new Error(`Lock for seat ${seat.row}${seat.seatNumber} has expired. Please re-select your seats.`);
    }
  }
  return true;
};

module.exports = { lockSeats, releaseSeats, verifyLocksExist };
