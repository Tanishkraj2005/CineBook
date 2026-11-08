const mongoose = require('mongoose');

const bookedSeatSchema = new mongoose.Schema({ row: String, seatNumber: Number }, { _id: false });

const showSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  cinemaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true },
  screenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen', required: true },
  showDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  pricing: {
    standard: { type: Number, default: 200 },
    premium: { type: Number, default: 350 },
    recliner: { type: Number, default: 500 },
  },
  status: { type: String, enum: ['active', 'cancelled', 'completed'], default: 'active' },
  bookedSeats: [bookedSeatSchema],
}, { timestamps: true });

showSchema.index({ movieId: 1, showDate: 1 });
showSchema.index({ cinemaId: 1, screenId: 1, showDate: 1 });

module.exports = mongoose.model('Show', showSchema);
