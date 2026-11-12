const User = require('../models/User');
const Movie = require('../models/Movie');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const AuditLog = require('../models/AuditLog');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const [
      totalBookingsResult,
      totalCustomers,
      totalMovies,
      todayBookings,
    ] = await Promise.all([
      Booking.aggregate([
        { $match: { bookingStatus: 'confirmed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$finalAmount' }, totalCount: { $sum: 1 } } },
      ]),
      User.countDocuments({ role: 'customer' }),
      Movie.countDocuments(),
      Booking.countDocuments({
        bookingStatus: 'confirmed',
        createdAt: { $gte: todayStart, $lt: todayEnd },
      }),
    ]);

    const totalRevenue = totalBookingsResult[0]?.totalRevenue || 0;
    const totalBookings = totalBookingsResult[0]?.totalCount || 0;

    // Monthly revenue - last 12 months
    const monthlyRevenue = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed', createdAt: { $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$finalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Weekly bookings - last 7 days
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyBookings = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed', createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top 5 movies
    const topMovies = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      { $group: { _id: '$showId', bookings: { $sum: 1 } } },
      { $sort: { bookings: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'shows', localField: '_id', foreignField: '_id', as: 'show' } },
      { $unwind: '$show' },
      { $group: { _id: '$show.movieId', bookings: { $sum: '$bookings' } } },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'movies', localField: '_id', foreignField: '_id', as: 'movie' } },
      { $unwind: '$movie' },
      { $project: { title: '$movie.title', poster: '$movie.poster', bookings: 1 } },
    ]);

    return successResponse(res, 'Dashboard data fetched', {
      totalRevenue,
      totalBookings,
      totalCustomers,
      totalMovies,
      todayBookings,
      monthlyRevenue,
      weeklyBookings,
      topMovies,
    });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch dashboard data', 500, err.message);
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, movieId, date } = req.query;
    const query = {};
    if (search) query.bookingId = new RegExp(search, 'i');
    if (status) query.bookingStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('userId', 'name email phone')
        .populate({
          path: 'showId',
          populate: [
            { path: 'movieId', select: 'title poster' },
            { path: 'cinemaId', select: 'name city' },
          ],
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(query),
    ]);

    return successResponse(res, 'Bookings fetched', { bookings, total, page: parseInt(page) });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch bookings', 500, err.message);
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'customer' };
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [customers, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    // Add booking counts
    const customerIds = customers.map(c => c._id);
    const bookingCounts = await Booking.aggregate([
      { $match: { userId: { $in: customerIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    bookingCounts.forEach(b => { countMap[b._id.toString()] = b.count; });

    const enriched = customers.map(c => ({
      ...c.toObject(),
      bookingCount: countMap[c._id.toString()] || 0,
    }));

    return successResponse(res, 'Customers fetched', { customers: enriched, total, page: parseInt(page) });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch customers', 500, err.message);
  }
};

exports.toggleBlockCustomer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);
    if (user.role === 'admin') return errorResponse(res, 'Cannot block admin accounts', 400);
    user.isBlocked = !user.isBlocked;
    await user.save();
    return successResponse(res, `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, user);
  } catch (err) {
    return errorResponse(res, 'Failed to update user status', 500, err.message);
  }
};

exports.getReports = async (req, res) => {
  try {
    // 1. Movie Revenue Aggregation
    const movieRevenue = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      { $lookup: { from: 'shows', localField: 'showId', foreignField: '_id', as: 'show' } },
      { $unwind: '$show' },
      { $group: { _id: '$show.movieId', totalRevenue: { $sum: '$finalAmount' }, totalBookings: { $sum: 1 } } },
      { $lookup: { from: 'movies', localField: '_id', foreignField: '_id', as: 'movie' } },
      { $unwind: '$movie' },
      { $project: { title: '$movie.title', totalRevenue: 1, totalBookings: 1 } },
      { $sort: { totalRevenue: -1 } },
    ]);

    // 2. Auditorium occupancy report reconciling confirmed seats and cancellations
    const shows = await Show.find()
      .populate('movieId', 'title duration poster')
      .populate('cinemaId', 'name city')
      .populate('screenId', 'screenName totalSeats')
      .sort({ showDate: 1, startTime: 1 })
      .limit(50);

    const showIds = shows.map(s => s._id);
    const allBookings = await Booking.find({ showId: { $in: showIds } });

    const occupancyReport = shows.map((show) => {
      const showBookings = allBookings.filter(b => b.showId.toString() === show._id.toString());
      const confirmed = showBookings.filter(b => b.bookingStatus === 'confirmed');
      const cancelled = showBookings.filter(b => b.bookingStatus === 'cancelled');

      const confirmedSeats = confirmed.reduce((acc, b) => acc + (b.seats?.length || 0), 0);
      const cancelledSeats = cancelled.reduce((acc, b) => acc + (b.seats?.length || 0), 0);
      const totalCapacity = show.screenId?.totalSeats || 80;
      const occupancyRate = Number(((confirmedSeats / totalCapacity) * 100).toFixed(1));
      const confirmedRevenue = confirmed.reduce((acc, b) => acc + b.finalAmount, 0);
      const refundedAmount = cancelled.reduce((acc, b) => acc + b.finalAmount, 0);

      return {
        showId: show._id,
        movieTitle: show.movieId?.title || 'Unknown',
        cinemaName: show.cinemaId?.name || 'Unknown',
        city: show.cinemaId?.city || 'Delhi',
        screenName: show.screenId?.screenName || 'Screen 1',
        showDate: show.showDate,
        startTime: show.startTime,
        totalCapacity,
        confirmedSeats,
        confirmedBookingsCount: confirmed.length,
        cancelledSeats,
        cancelledBookingsCount: cancelled.length,
        availableSeats: Math.max(0, totalCapacity - confirmedSeats),
        occupancyRate,
        confirmedRevenue,
        refundedAmount,
      };
    });

    // 3. Audit trail logs for material business actions
    const auditLogs = await AuditLog.find()
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50);

    return successResponse(res, 'Reports fetched', {
      movieRevenue,
      occupancyReport,
      auditLogs,
    });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch reports', 500, err.message);
  }
};
