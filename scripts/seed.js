const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const ParkingSlot = require('../models/ParkingSlot');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

// Connect DB
connectDB();

const seedData = async () => {
    try {
        await User.deleteMany();
        await ParkingSlot.deleteMany();

        // Create 3 demo users as requested
        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@jecrcu.edu.in',
                password: 'password123',
                role: 'admin'
            },
            {
                name: 'Staff Member',
                email: 'staff@jecrcu.edu.in',
                password: 'password123',
                role: 'staff'
            },
            {
                name: 'Rahul Sharma (Normal User)',
                email: 'user@jecrcu.edu.in',
                password: 'password123',
                role: 'user',
                vehicleNumber: 'RJ 14 CC 1234',
                phone: '+91 9876543210'
            }
        ]);

        console.log('Seed users created:', users.map(u => ({ email: u.email, role: u.role })));

        // Create some initial parking slots
        await ParkingSlot.create([
            { slotNumber: 'A-01', zone: 'A', status: 'available', pricePerHour: 20 },
            { slotNumber: 'A-02', zone: 'A', status: 'available', pricePerHour: 20 },
            { slotNumber: 'A-03', zone: 'A', status: 'maintenance', pricePerHour: 20 },
            { slotNumber: 'B-01', zone: 'B', status: 'available', pricePerHour: 15 },
            { slotNumber: 'B-02', zone: 'B', status: 'available', pricePerHour: 15 },
            { slotNumber: 'C-01', zone: 'C', status: 'available', pricePerHour: 10 },
            { slotNumber: 'C-02', zone: 'C', status: 'available', pricePerHour: 10 },
            { slotNumber: 'D-01', zone: 'D', status: 'available', pricePerHour: 5 },
        ]);

        console.log('Seed parking slots created!');

        console.log('Data Imported Successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
