const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  paymentMethod: { type: String, enum: ['upi', 'card', 'cash'], required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, unique: true },
  paymentStatus: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
  paymentGatewayResponse: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
