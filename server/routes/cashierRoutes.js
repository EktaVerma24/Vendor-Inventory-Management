const express = require('express');
const router = express.Router();
const Cashier = require('../models/Cashier');
const bcrypt = require('bcryptjs');

// Get all cashiers for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
    try {
        const cashiers = await Cashier.find({ vendorId: req.params.vendorId }).sort({ createdAt: -1 });
        res.json(cashiers);
    } catch (error) {
        console.error('Error fetching cashiers:', error);
        res.status(500).json({ message: 'Error fetching cashiers', error: error.message });
    }
});

// Get cashiers by shop
router.get('/shop/:shopId', async (req, res) => {
    try {
        const cashiers = await Cashier.find({ shopId: req.params.shopId }).sort({ createdAt: -1 });
        res.json(cashiers);
    } catch (error) {
        console.error('Error fetching cashiers by shop:', error);
        res.status(500).json({ message: 'Error fetching cashiers', error: error.message });
    }
});

// Get all cashiers (admin only)
router.get('/', async (req, res) => {
    try {
        const cashiers = await Cashier.find().populate('vendorId', 'name businessName').populate('shopId', 'name location').sort({ createdAt: -1 });
        res.json(cashiers);
    } catch (error) {
        console.error('Error fetching all cashiers:', error);
        res.status(500).json({ message: 'Error fetching cashiers', error: error.message });
    }
});

// Get cashier by ID
router.get('/:id', async (req, res) => {
    try {
        const cashier = await Cashier.findById(req.params.id).populate('vendorId', 'name businessName').populate('shopId', 'name location');
        if (!cashier) {
            return res.status(404).json({ message: 'Cashier not found' });
        }
        res.json(cashier);
    } catch (error) {
        console.error('Error fetching cashier:', error);
        res.status(500).json({ message: 'Error fetching cashier', error: error.message });
    }
});

// Create new cashier
router.post('/', async (req, res) => {
    try {
        const cashierData = req.body;
        
        // Check if email already exists
        const existingCashier = await Cashier.findOne({ email: cashierData.email });
        if (existingCashier) {
            return res.status(400).json({ message: 'Cashier with this email already exists' });
        }

        // Generate password if not provided
        if (!cashierData.password) {
            cashierData.password = Math.random().toString(36).slice(-8);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        cashierData.password = await bcrypt.hash(cashierData.password, salt);

        const cashier = new Cashier(cashierData);
        await cashier.save();
        
        res.status(201).json({
            success: true,
            message: 'Cashier created successfully',
            cashier: {
                ...cashier.toObject(),
                password: req.body.password || cashierData.password // Return plain password
            }
        });
    } catch (error) {
        console.error('Error creating cashier:', error);
        res.status(500).json({ message: 'Error creating cashier', error: error.message });
    }
});

// Update cashier
router.put('/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        // Hash password if provided
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const cashier = await Cashier.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!cashier) {
            return res.status(404).json({ message: 'Cashier not found' });
        }
        
        res.json({
            success: true,
            message: 'Cashier updated successfully',
            cashier
        });
    } catch (error) {
        console.error('Error updating cashier:', error);
        res.status(500).json({ message: 'Error updating cashier', error: error.message });
    }
});

// Delete cashier
router.delete('/:id', async (req, res) => {
    try {
        const cashier = await Cashier.findByIdAndDelete(req.params.id);
        
        if (!cashier) {
            return res.status(404).json({ message: 'Cashier not found' });
        }
        
        res.json({
            success: true,
            message: 'Cashier deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting cashier:', error);
        res.status(500).json({ message: 'Error deleting cashier', error: error.message });
    }
});

// Assign cashier to shop
router.patch('/:id/assign-shop', async (req, res) => {
    try {
        const { shopId } = req.body;
        const cashier = await Cashier.findById(req.params.id);
        
        if (!cashier) {
            return res.status(404).json({ message: 'Cashier not found' });
        }
        
        cashier.shopId = shopId;
        await cashier.save();
        
        res.json({
            success: true,
            message: 'Cashier assigned to shop successfully',
            cashier
        });
    } catch (error) {
        console.error('Error assigning cashier to shop:', error);
        res.status(500).json({ message: 'Error assigning cashier to shop', error: error.message });
    }
});

// Update cashier status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const cashier = await Cashier.findById(req.params.id);
        
        if (!cashier) {
            return res.status(404).json({ message: 'Cashier not found' });
        }
        
        cashier.status = status;
        await cashier.save();
        
        res.json({
            success: true,
            message: 'Cashier status updated successfully',
            cashier
        });
    } catch (error) {
        console.error('Error updating cashier status:', error);
        res.status(500).json({ message: 'Error updating cashier status', error: error.message });
    }
});

// Get active cashiers for a shop
router.get('/shop/:shopId/active', async (req, res) => {
    try {
        const cashiers = await Cashier.find({ 
            shopId: req.params.shopId, 
            status: 'active' 
        }).sort({ createdAt: -1 });
        res.json(cashiers);
    } catch (error) {
        console.error('Error fetching active cashiers:', error);
        res.status(500).json({ message: 'Error fetching active cashiers', error: error.message });
    }
});

module.exports = router; 