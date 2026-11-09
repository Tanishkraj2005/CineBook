const router = require('express').Router();
const { body } = require('express-validator');
const { getMovies, getMovie, createMovie, updateMovie, deleteMovie } = require('../controllers/movieController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/', getMovies);
router.get('/:id', getMovie);
router.post('/', protect, adminOnly, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
], createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

module.exports = router;
