const router = require('express').Router();
const { getDashboard, getAllBookings, getAllCustomers, toggleBlockCustomer, getReports } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);
router.get('/bookings', getAllBookings);
router.get('/customers', getAllCustomers);
router.put('/customers/:id/block', toggleBlockCustomer);
router.get('/reports', getReports);

module.exports = router;
