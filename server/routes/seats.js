const router = require('express').Router();
const { lockSeats, releaseSeats } = require('../controllers/seatController');
const { protect } = require('../middleware/auth');

router.post('/lock', protect, lockSeats);
router.delete('/lock', protect, releaseSeats);
router.post('/unlock', protect, releaseSeats);

module.exports = router;
