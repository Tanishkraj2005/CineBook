const Screen = require('../models/Screen');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getScreens = async (req, res) => {
  try {
    const { cinemaId } = req.query;
    const query = {};
    if (cinemaId) query.cinemaId = cinemaId;
    const screens = await Screen.find(query).populate('cinemaId', 'name city');
    return successResponse(res, 'Screens fetched', screens);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch screens', 500, err.message);
  }
};

exports.getScreen = async (req, res) => {
  try {
    const screen = await Screen.findById(req.params.id).populate('cinemaId', 'name city');
    if (!screen) return errorResponse(res, 'Screen not found', 404);
    return successResponse(res, 'Screen fetched', screen);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch screen', 500, err.message);
  }
};

exports.createScreen = async (req, res) => {
  try {
    const screen = await Screen.create(req.body);
    return successResponse(res, 'Screen created', screen, 201);
  } catch (err) {
    return errorResponse(res, 'Failed to create screen', 500, err.message);
  }
};

exports.updateScreen = async (req, res) => {
  try {
    const screen = await Screen.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!screen) return errorResponse(res, 'Screen not found', 404);
    return successResponse(res, 'Screen updated', screen);
  } catch (err) {
    return errorResponse(res, 'Failed to update screen', 500, err.message);
  }
};

exports.deleteScreen = async (req, res) => {
  try {
    const screen = await Screen.findByIdAndDelete(req.params.id);
    if (!screen) return errorResponse(res, 'Screen not found', 404);
    return successResponse(res, 'Screen deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete screen', 500, err.message);
  }
};
