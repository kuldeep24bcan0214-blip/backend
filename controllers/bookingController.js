const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const User = require('../models/User');

// @desc    Book a parking slot
// @route   POST /api/bookings
// @access  Private/User
const bookSlot = async (req, res) => {
    try {
        const { slotId, vehicleNumber, duration } = req.body;

        // Verify slot exists and is available
        const slot = await ParkingSlot.findById(slotId);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });
        if (slot.status !== 'available') return res.status(400).json({ message: 'Slot is not available' });

        // Ensure user only has ONE active booking
        const existingBooking = await Booking.findOne({
            user: req.user.id,
            status: { $in: ['active', 'checked_in'] }
        });
        if (existingBooking) {
            return res.status(400).json({ message: 'You already have an active booking' });
        }

        // Create booking
        const booking = await Booking.create({
            user: req.user.id,
            slot: slotId,
            vehicleNumber,
            duration: duration || 1,
            totalAmount: slot.pricePerHour * (duration || 1) // Estimated upfront
        });

        // Update slot status
        slot.status = 'booked';
        await slot.save();

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's own bookings
// @route   GET /api/bookings/my
// @access  Private/User
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('slot', 'slotNumber zone pricePerHour')
            .sort('-createdAt');
        res.status(200).json({ bookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private/User
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'active') {
            return res.status(400).json({ message: 'Can only cancel active bookings that are not checked in' });
        }

        booking.status = 'cancelled';
        await booking.save();

        // Free the slot
        const slot = await ParkingSlot.findById(booking.slot);
        if (slot) {
            slot.status = 'available';
            await slot.save();
        }

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Staff Check-In Vehicle
// @route   PUT /api/bookings/:id/checkin
// @access  Private/Staff
const checkIn = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status !== 'active') {
            return res.status(400).json({ message: 'Booking is not in active state' });
        }

        booking.status = 'checked_in';
        booking.checkInTime = Date.now();
        await booking.save();

        // Update slot to occupied
        const slot = await ParkingSlot.findById(booking.slot);
        if (slot) {
            slot.status = 'occupied';
            await slot.save();
        }

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Staff Check-Out Vehicle
// @route   PUT /api/bookings/:id/checkout
// @access  Private/Staff
const checkOut = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('slot');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status !== 'checked_in') {
            return res.status(400).json({ message: 'Vehicle must be checked in first' });
        }

        booking.checkOutTime = Date.now();
        booking.status = 'completed';

        // Calculate actual duration and cost
        const hoursParked = Math.max(
            1, // Minimum 1 hour charge
            Math.ceil((booking.checkOutTime - booking.checkInTime) / (1000 * 60 * 60))
        );
        booking.duration = hoursParked;
        booking.totalAmount = hoursParked * booking.slot.pricePerHour;

        await booking.save();

        // Free the slot
        const slot = await ParkingSlot.findById(booking.slot._id);
        if (slot) {
            slot.status = 'available';
            await slot.save();
        }

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active bookings (for staff)
// @route   GET /api/bookings/active
// @access  Private/Staff
const getActiveBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ status: { $in: ['active', 'checked_in'] } })
            .populate('user', 'name email')
            .populate('slot', 'slotNumber zone');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    bookSlot,
    getMyBookings,
    cancelBooking,
    checkIn,
    checkOut,
    getActiveBookings
};
