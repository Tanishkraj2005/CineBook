const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);

    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return errorResponse(res, 'An account with this email already exists', 400);

    const user = await User.create({ name, email, password, phone });
    const token = signToken(user._id, user.role);
    return successResponse(res, 'Registration successful', { token, user }, 201);
  } catch (err) {
    return errorResponse(res, 'Registration failed', 500, err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, 'Invalid email or password', 401);
    if (user.isBlocked) return errorResponse(res, 'Your account has been blocked. Contact support.', 403);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return errorResponse(res, 'Invalid email or password', 401);

    const token = signToken(user._id, user.role);
    return successResponse(res, 'Login successful', { token, user });
  } catch (err) {
    return errorResponse(res, 'Login failed', 500, err.message);
  }
};

exports.getMe = async (req, res) => {
  return successResponse(res, 'User profile', req.user);
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return errorResponse(res, 'Please provide old and new passwords', 400);
    if (newPassword.length < 6) return errorResponse(res, 'New password must be at least 6 characters', 400);

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return errorResponse(res, 'Current password is incorrect', 400);

    user.password = newPassword;
    await user.save();
    return successResponse(res, 'Password changed successfully');
  } catch (err) {
    return errorResponse(res, 'Failed to change password', 500, err.message);
  }
};
