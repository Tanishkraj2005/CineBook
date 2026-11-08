const mongoose = require('mongoose');

const castSchema = new mongoose.Schema({ name: String, role: String }, { _id: false });

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  genre: [{ type: String }],
  duration: { type: Number, required: true },
  language: [{ type: String }],
  poster: { type: String, default: '' },
  banner: { type: String, default: '' },
  releaseDate: { type: Date },
  certification: { type: String, default: 'U/A' },
  cast: [castSchema],
  director: { type: String, default: '' },
  trailerUrl: { type: String, default: '' },
  status: { type: String, enum: ['now_showing', 'coming_soon', 'ended'], default: 'now_showing' },
  avgRating: { type: Number, default: 0, min: 0, max: 10 },
  totalRatings: { type: Number, default: 0 },
}, { timestamps: true });

movieSchema.index({ title: 'text', description: 'text' }, { default_language: 'none', language_override: 'none' });
movieSchema.index({ status: 1 });
movieSchema.index({ genre: 1 });

module.exports = mongoose.model('Movie', movieSchema);
