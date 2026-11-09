const Cinema = require('../models/Cinema');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getCinemas = async (req, res) => {
  try {
    const { city } = req.query;
    const query = { status: 'active' };
    if (city) query.city = new RegExp(city, 'i');
    const cinemas = await Cinema.find(query).sort({ city: 1, name: 1 });
    return successResponse(res, 'Cinemas fetched', cinemas);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch cinemas', 500, err.message);
  }
};

exports.getCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) return errorResponse(res, 'Cinema not found', 404);
    return successResponse(res, 'Cinema fetched', cinema);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch cinema', 500, err.message);
  }
};

exports.createCinema = async (req, res) => {
  try {
    const cinema = await Cinema.create(req.body);
    return successResponse(res, 'Cinema created', cinema, 201);
  } catch (err) {
    return errorResponse(res, 'Failed to create cinema', 500, err.message);
  }
};

exports.updateCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cinema) return errorResponse(res, 'Cinema not found', 404);
    return successResponse(res, 'Cinema updated', cinema);
  } catch (err) {
    return errorResponse(res, 'Failed to update cinema', 500, err.message);
  }
};

exports.deleteCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findByIdAndDelete(req.params.id);
    if (!cinema) return errorResponse(res, 'Cinema not found', 404);
    return successResponse(res, 'Cinema deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete cinema', 500, err.message);
  }
};
