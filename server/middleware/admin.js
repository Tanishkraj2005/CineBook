const { errorResponse } = require('../utils/apiResponse');

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return errorResponse(res, 'Admin access required', 403);
};

module.exports = { adminOnly };
