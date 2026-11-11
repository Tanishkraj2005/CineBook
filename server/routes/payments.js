const router = require('express').Router();
const { createPayment, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create', protect, createPayment);
router.post('/verify', protect, verifyPayment);

module.exports = router;
