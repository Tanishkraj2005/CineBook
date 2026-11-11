const router = require('express').Router();
const { createBooking, getMyBookings, getBooking, cancelBooking, verifyTicket } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.post('/verify-ticket', protect, adminOnly, verifyTicket);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
