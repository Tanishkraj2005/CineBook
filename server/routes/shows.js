const router = require('express').Router();
const { getShows, getShow, getShowsByMovie, createShow, updateShow, deleteShow } = require('../controllers/showController');
const { getShowSeats } = require('../controllers/seatController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/', getShows);
router.get('/movie/:movieId', getShowsByMovie);
router.get('/:id', getShow);
router.get('/:showId/seats', getShowSeats);
router.post('/', protect, adminOnly, createShow);
router.put('/:id', protect, adminOnly, updateShow);
router.delete('/:id', protect, adminOnly, deleteShow);

module.exports = router;
