const mongoose = require('mongoose');

const seatLockSchema = new mongoose.Schema({
  showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  row: { type: String, required: true },
  seatNumber: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
}, { timestamps: true });

seatLockSchema.index({ showId: 1, row: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('SeatLock', seatLockSchema);
