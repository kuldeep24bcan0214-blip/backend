const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
    slotNumber: {
        type: String,
        required: [true, 'Please add a slot number'],
        unique: true,
        trim: true
    },
    zone: {
        type: String,
        required: [true, 'Please specify the parking zone'],
        enum: ['A', 'B', 'C', 'D'],
        default: 'A'
    },
    status: {
        type: String,
        enum: ['available', 'booked', 'occupied', 'maintenance'],
        default: 'available'
    },
    pricePerHour: {
        type: Number,
        required: [true, 'Please add the price per hour'],
        default: 10
    },
    features: {
        type: [String],
        default: ['Covered', '24/7 Access']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
