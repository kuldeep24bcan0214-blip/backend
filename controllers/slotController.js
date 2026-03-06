const ParkingSlot = require('../models/ParkingSlot');

// @desc    Get all parking slots
// @route   GET /api/slots
// @access  Public/User
const getSlots = async (req, res) => {
    try {
        const slots = await ParkingSlot.find({});
        res.status(200).json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a parking slot
// @route   POST /api/slots
// @access  Private/Admin
const createSlot = async (req, res) => {
    try {
        const { slotNumber, zone, pricePerHour, features } = req.body;

        const slotExists = await ParkingSlot.findOne({ slotNumber });
        if (slotExists) {
            return res.status(400).json({ message: 'Slot number already exists' });
        }

        const slot = await ParkingSlot.create({
            slotNumber,
            zone,
            pricePerHour,
            features
        });

        res.status(201).json(slot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a parking slot
// @route   PUT /api/slots/:id
// @access  Private/Admin/Staff (status update)
const updateSlot = async (req, res) => {
    try {
        let slot = await ParkingSlot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        // Restrict non-admins from changing price or slot number
        if (req.user.role !== 'admin') {
            delete req.body.pricePerHour;
            delete req.body.slotNumber;
            delete req.body.zone;
        }

        slot = await ParkingSlot.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json(slot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a parking slot
// @route   DELETE /api/slots/:id
// @access  Private/Admin
const deleteSlot = async (req, res) => {
    try {
        const slot = await ParkingSlot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        await slot.deleteOne();

        res.status(200).json({ id: req.params.id, message: 'Slot removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSlots,
    createSlot,
    updateSlot,
    deleteSlot
};
