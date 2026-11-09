const router = require('express').Router();
const { getCinemas, getCinema, createCinema, updateCinema, deleteCinema } = require('../controllers/cinemaController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/', getCinemas);
router.get('/:id', getCinema);
router.post('/', protect, adminOnly, createCinema);
router.put('/:id', protect, adminOnly, updateCinema);
router.delete('/:id', protect, adminOnly, deleteCinema);

module.exports = router;
