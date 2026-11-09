const Movie = require('../models/Movie');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { validationResult } = require('express-validator');

exports.getMovies = async (req, res) => {
  try {
    const { genre, language, status, search, sort, page = 1, limit = 20 } = req.query;
    const query = {};
    if (genre) query.genre = { $in: [genre] };
    if (language) query.language = { $in: [language] };
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    let sortObj = { createdAt: -1 };
    if (sort === 'rating') sortObj = { avgRating: -1 };
    else if (sort === 'popularity') sortObj = { totalRatings: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [movies, total] = await Promise.all([
      Movie.find(query).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Movie.countDocuments(query),
    ]);

    return successResponse(res, 'Movies fetched', { movies, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch movies', 500, err.message);
  }
};

exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return errorResponse(res, 'Movie not found', 404);
    return successResponse(res, 'Movie fetched', movie);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch movie', 500, err.message);
  }
};

exports.createMovie = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);
    const movie = await Movie.create(req.body);
    return successResponse(res, 'Movie created', movie, 201);
  } catch (err) {
    return errorResponse(res, 'Failed to create movie', 500, err.message);
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!movie) return errorResponse(res, 'Movie not found', 404);
    return successResponse(res, 'Movie updated', movie);
  } catch (err) {
    return errorResponse(res, 'Failed to update movie', 500, err.message);
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return errorResponse(res, 'Movie not found', 404);
    return successResponse(res, 'Movie deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete movie', 500, err.message);
  }
};
