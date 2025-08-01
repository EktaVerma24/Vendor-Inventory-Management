const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');

// Get all shops for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
    try {
        const shops = await Shop.find({ vendorId: req.params.vendorId }).sort({ createdAt: -1 });
        res.json(shops);
    } catch (error) {
        console.error('Error fetching shops:', error);
        res.status(500).json({ message: 'Error fetching shops', error: error.message });
    }
});

// Get all shops (admin only)
router.get('/', async (req, res) => {
    try {
        const shops = await Shop.find().populate('vendorId', 'name businessName').sort({ createdAt: -1 });
        res.json(shops);
    } catch (error) {
        console.error('Error fetching all shops:', error);
        res.status(500).json({ message: 'Error fetching shops', error: error.message });
    }
});

// Get shop by ID
router.get('/:id', async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id).populate('vendorId', 'name businessName');
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        res.json(shop);
    } catch (error) {
        console.error('Error fetching shop:', error);
        res.status(500).json({ message: 'Error fetching shop', error: error.message });
    }
});

// Create new shop
router.post('/', async (req, res) => {
    try {
        const shopData = req.body;
        const shop = new Shop(shopData);
        await shop.save();
        
        res.status(201).json({
            success: true,
            message: 'Shop created successfully',
            shop
        });
    } catch (error) {
        console.error('Error creating shop:', error);
        res.status(500).json({ message: 'Error creating shop', error: error.message });
    }
});

// Update shop
router.put('/:id', async (req, res) => {
    try {
        const shop = await Shop.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        
        res.json({
            success: true,
            message: 'Shop updated successfully',
            shop
        });
    } catch (error) {
        console.error('Error updating shop:', error);
        res.status(500).json({ message: 'Error updating shop', error: error.message });
    }
});

// Delete shop
router.delete('/:id', async (req, res) => {
    try {
        const shop = await Shop.findByIdAndDelete(req.params.id);
        
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        
        res.json({
            success: true,
            message: 'Shop deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting shop:', error);
        res.status(500).json({ message: 'Error deleting shop', error: error.message });
    }
});

// Update shop statistics
router.patch('/:id/stats', async (req, res) => {
    try {
        const { revenue, cashiers, items } = req.body;
        const shop = await Shop.findById(req.params.id);
        
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        
        if (revenue !== undefined) shop.revenue = revenue;
        if (cashiers !== undefined) shop.cashiers = cashiers;
        if (items !== undefined) shop.items = items;
        
        await shop.save();
        
        res.json({
            success: true,
            message: 'Shop statistics updated',
            shop
        });
    } catch (error) {
        console.error('Error updating shop statistics:', error);
        res.status(500).json({ message: 'Error updating shop statistics', error: error.message });
    }
});

// Get shops by terminal
router.get('/terminal/:terminal', async (req, res) => {
    try {
        const shops = await Shop.find({ terminal: req.params.terminal }).populate('vendorId', 'name businessName');
        res.json(shops);
    } catch (error) {
        console.error('Error fetching shops by terminal:', error);
        res.status(500).json({ message: 'Error fetching shops', error: error.message });
    }
});

module.exports = router; 