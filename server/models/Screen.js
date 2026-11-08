const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true },
  category: { type: String, enum: ['standard', 'premium', 'recliner'], default: 'standard' },
  price: { type: Number, required: true },
}, { _id: false });

const rowSchema = new mongoose.Schema({
  rowLabel: { type: String, required: true },
  seats: [seatSchema],
}, { _id: false });

const screenSchema = new mongoose.Schema({
  cinemaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true },
  screenName: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  rows: [rowSchema],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Screen', screenSchema);
