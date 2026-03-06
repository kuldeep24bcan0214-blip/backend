const User = require('../models/User');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = req.body.role || user.role;
        await user.save();

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (req.user.id === req.params.id) {
            return res.status(400).json({ message: 'Cannot delete your own admin account' });
        }

        await user.deleteOne();
        res.status(200).json({ id: req.params.id, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get system revenue and analytics
// @route   GET /api/admin/revenue
// @access  Private/Admin
const getRevenue = async (req, res) => {
    try {
        // 1. Total users
        const totalUsers = await User.countDocuments();

        // 2. Slot stats
        const allSlots = await ParkingSlot.find({});
        const totalSlots = allSlots.length;
        const availableSlots = allSlots.filter(s => s.status === 'available').length;

        // 3. Booking & Revenue stats
        const bookings = await Booking.find({});
        const totalBookings = bookings.length;

        const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        // Today's revenue
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const todaysBookings = bookings.filter(b => b.createdAt >= startOfToday);
        const todayRevenue = todaysBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        // Recent users for admin dashboard table
        const recentUsers = await User.find({}).sort('-createdAt').limit(10);

        res.status(200).json({
            stats: {
                totalUsers,
                totalSlots,
                availableSlots,
                totalRevenue,
                todayRevenue,
                totalBookings
            },
            recentUsers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    updateUserRole,
    deleteUser,
    getRevenue
};
