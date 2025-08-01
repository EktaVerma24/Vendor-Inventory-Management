const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Cashier = require('../models/Cashier');

// Login route for all user types
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if it's an admin/airport authority user
        let user = await User.findOne({ email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            return res.json({
                success: true,
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    permissions: user.permissions
                }
            });
        }

        // Check if it's a vendor
        let vendor = await Vendor.findOne({ email });
        if (vendor) {
            const isMatch = await bcrypt.compare(password, vendor.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { userId: vendor._id, role: 'vendor' },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            return res.json({
                success: true,
                token,
                user: {
                    id: vendor._id,
                    email: vendor.email,
                    name: vendor.name,
                    businessName: vendor.businessName,
                    role: 'vendor',
                    vendorId: vendor._id,
                    status: vendor.status,
                    permissions: vendor.permissions
                }
            });
        }

        // Check if it's a cashier
        let cashier = await Cashier.findOne({ email });
        if (cashier) {
            const isMatch = await bcrypt.compare(password, cashier.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { userId: cashier._id, role: 'cashier' },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            return res.json({
                success: true,
                token,
                user: {
                    id: cashier._id,
                    email: cashier.email,
                    name: cashier.name,
                    role: 'cashier',
                    shopId: cashier.shopId,
                    vendorId: cashier.vendorId,
                    status: cashier.status,
                    permissions: cashier.permissions
                }
            });
        }

        // If no user found
        res.status(400).json({ message: 'Invalid credentials' });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Register admin user (for initial setup)
router.post('/register-admin', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin user already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create admin user
        const admin = new User({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            permissions: ['view_all_vendors', 'view_all_shops', 'view_all_transactions', 'generate_reports', 'approve_vendors']
        });

        await admin.save();

        res.status(201).json({
            success: true,
            message: 'Admin user created successfully'
        });

    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Verify token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Find user based on role
        let user;
        if (decoded.role === 'admin' || decoded.role === 'airport_authority') {
            user = await User.findById(decoded.userId);
        } else if (decoded.role === 'vendor') {
            user = await Vendor.findById(decoded.userId);
        } else if (decoded.role === 'cashier') {
            user = await Cashier.findById(decoded.userId);
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: decoded.role,
                permissions: user.permissions
            }
        });

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router; 