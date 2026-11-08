const mongoose = require('mongoose');

const bookedSeatDetailSchema = new mongoose.Schema({
  row: String, seatNumber: Number, category: String, price: Number,
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  seats: [bookedSeatDetailSchema],
  totalAmount: { type: Number, required: true },
  convenienceFee: { type: Number, default: 30 },
  taxes: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  bookingStatus: { type: String, enum: ['confirmed', 'cancelled', 'pending'], default: 'pending' },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'refunded'], default: 'pending' },
  cancellationReason: { type: String, default: '' },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  isAdmitted: { type: Boolean, default: false },
  admittedAt: { type: Date, default: null },
  admittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

bookingSchema.index({ userId: 1 });
bookingSchema.index({ showId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
