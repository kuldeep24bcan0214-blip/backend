const express = require('express');
const router = express.Router();
const {
    bookSlot, getMyBookings, cancelBooking,
    checkIn, checkOut, getActiveBookings
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// User Booking Routes
router.post('/', protect, authorize('user'), bookSlot);
router.get('/my', protect, authorize('user'), getMyBookings);
router.put('/:id/cancel', protect, authorize('user'), cancelBooking);

// Staff Routes
router.get('/active', protect, authorize('staff', 'admin'), getActiveBookings);
router.put('/:id/checkin', protect, authorize('staff', 'admin'), checkIn);
router.put('/:id/checkout', protect, authorize('staff', 'admin'), checkOut);

module.exports = router;
