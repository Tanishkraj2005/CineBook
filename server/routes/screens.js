const router = require('express').Router();
const { getScreens, getScreen, createScreen, updateScreen, deleteScreen } = require('../controllers/screenController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/', getScreens);
router.get('/:id', getScreen);
router.post('/', protect, adminOnly, createScreen);
router.put('/:id', protect, adminOnly, updateScreen);
router.delete('/:id', protect, adminOnly, deleteScreen);

module.exports = router;
