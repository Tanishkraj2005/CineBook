const Show = require('../models/Show');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getShows = async (req, res) => {
  try {
    const { movieId, cinemaId, date, city } = req.query;
    const query = { status: 'active' };
    if (movieId) query.movieId = movieId;
    if (cinemaId) query.cinemaId = cinemaId;
    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      query.showDate = { $gte: d, $lt: nextDay };
    }

    let shows = await Show.find(query)
      .populate('movieId', 'title poster duration genre')
      .populate('cinemaId', 'name city address')
      .populate('screenId', 'screenName')
      .sort({ showDate: 1, startTime: 1 });

    if (city) {
      shows = shows.filter(s => s.cinemaId?.city?.toLowerCase() === city.toLowerCase());
    }

    return successResponse(res, 'Shows fetched', shows);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch shows', 500, err.message);
  }
};

exports.getShow = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movieId')
      .populate('cinemaId')
      .populate('screenId');
    if (!show) return errorResponse(res, 'Show not found', 404);
    return successResponse(res, 'Show fetched', show);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch show', 500, err.message);
  }
};

exports.getShowsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const shows = await Show.find({ movieId, status: 'active', showDate: { $gte: today } })
      .populate('cinemaId', 'name city address facilities')
      .populate('screenId', 'screenName')
      .sort({ showDate: 1, startTime: 1 });

    // Group by city → cinema → date → shows
    const grouped = {};
    for (const show of shows) {
      if (!show.cinemaId) continue;
      const city = show.cinemaId.city;
      const cinemaId = show.cinemaId._id.toString();
      const dateStr = show.showDate.toISOString().split('T')[0];

      if (!grouped[city]) grouped[city] = {};
      if (!grouped[city][cinemaId]) {
        grouped[city][cinemaId] = {
          cinema: show.cinemaId,
          dates: {},
        };
      }
      if (!grouped[city][cinemaId].dates[dateStr]) {
        grouped[city][cinemaId].dates[dateStr] = [];
      }
      grouped[city][cinemaId].dates[dateStr].push({
        _id: show._id,
        startTime: show.startTime,
        endTime: show.endTime,
        pricing: show.pricing,
        availableSeats: show.screenId ? (show.screenId.totalSeats - show.bookedSeats.length) : 0,
        status: show.status,
      });
    }

    return successResponse(res, 'Shows fetched', grouped);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch shows', 500, err.message);
  }
};

exports.createShow = async (req, res) => {
  try {
    const { screenId, showDate, startTime, endTime } = req.body;
    // Check for overlapping shows
    const dateStart = new Date(showDate);
    const dateEnd = new Date(showDate);
    dateEnd.setDate(dateEnd.getDate() + 1);

    const overlapping = await Show.find({
      screenId,
      showDate: { $gte: dateStart, $lt: dateEnd },
      status: { $ne: 'cancelled' },
    });

    for (const existing of overlapping) {
      const newStart = startTime;
      const newEnd = endTime;
      const exStart = existing.startTime;
      const exEnd = existing.endTime;
      if (
        (newStart >= exStart && newStart < exEnd) ||
        (newEnd > exStart && newEnd <= exEnd) ||
        (newStart <= exStart && newEnd >= exEnd)
      ) {
        return errorResponse(res, `Show overlaps with existing show at ${exStart} - ${exEnd}`, 400);
      }
    }

    const show = await Show.create(req.body);
    return successResponse(res, 'Show created', show, 201);
  } catch (err) {
    return errorResponse(res, 'Failed to create show', 500, err.message);
  }
};

exports.updateShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!show) return errorResponse(res, 'Show not found', 404);
    return successResponse(res, 'Show updated', show);
  } catch (err) {
    return errorResponse(res, 'Failed to update show', 500, err.message);
  }
};

exports.deleteShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) return errorResponse(res, 'Show not found', 404);
    return successResponse(res, 'Show deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete show', 500, err.message);
  }
};
