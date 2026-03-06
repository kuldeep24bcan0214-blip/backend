const express = require('express');
const router = express.Router();
const { getSlots, createSlot, updateSlot, deleteSlot } = require('../controllers/slotController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
    .get(protect, getSlots)
    .post(protect, authorize('admin'), createSlot);

router.route('/:id')
    .put(protect, authorize('admin', 'staff'), updateSlot)
    .delete(protect, authorize('admin'), deleteSlot);

module.exports = router;
