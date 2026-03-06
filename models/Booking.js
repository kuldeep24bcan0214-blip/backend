const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    slot: {
        type: mongoose.Schema.ObjectId,
        ref: 'ParkingSlot',
        required: true
    },
    vehicleNumber: {
        type: String,
        required: true
    },
    bookingTime: {
        type: Date,
        default: Date.now
    },
    checkInTime: {
        type: Date
    },
    checkOutTime: {
        type: Date
    },
    duration: {
        type: Number, // In hours (estimated initially, actual on checkout)
        default: 1
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'checked_in', 'completed', 'cancelled'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
