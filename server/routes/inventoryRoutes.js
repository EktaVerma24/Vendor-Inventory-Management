const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// Get inventory for a specific shop
router.get('/shop/:shopId', async (req, res) => {
    try {
        const inventory = await Inventory.find({ shopId: req.params.shopId }).sort({ createdAt: -1 });
        res.json(inventory);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ message: 'Error fetching inventory', error: error.message });
    }
});

// Get inventory for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
    try {
        const inventory = await Inventory.find({ vendorId: req.params.vendorId }).populate('shopId', 'name location').sort({ createdAt: -1 });
        res.json(inventory);
    } catch (error) {
        console.error('Error fetching vendor inventory:', error);
        res.status(500).json({ message: 'Error fetching inventory', error: error.message });
    }
});

// Get all inventory (admin only)
router.get('/', async (req, res) => {
    try {
        const inventory = await Inventory.find().populate('shopId', 'name location').populate('vendorId', 'name businessName').sort({ createdAt: -1 });
        res.json(inventory);
    } catch (error) {
        console.error('Error fetching all inventory:', error);
        res.status(500).json({ message: 'Error fetching inventory', error: error.message });
    }
});

// Get inventory item by ID
router.get('/:id', async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id).populate('shopId', 'name location').populate('vendorId', 'name businessName');
        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        res.json(item);
    } catch (error) {
        console.error('Error fetching inventory item:', error);
        res.status(500).json({ message: 'Error fetching inventory item', error: error.message });
    }
});

// Create new inventory item
router.post('/', async (req, res) => {
    try {
        const itemData = req.body;
        const item = new Inventory(itemData);
        await item.save();
        
        res.status(201).json({
            success: true,
            message: 'Inventory item created successfully',
            item
        });
    } catch (error) {
        console.error('Error creating inventory item:', error);
        res.status(500).json({ message: 'Error creating inventory item', error: error.message });
    }
});

// Update inventory item
router.put('/:id', async (req, res) => {
    try {
        const item = await Inventory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        
        res.json({
            success: true,
            message: 'Inventory item updated successfully',
            item
        });
    } catch (error) {
        console.error('Error updating inventory item:', error);
        res.status(500).json({ message: 'Error updating inventory item', error: error.message });
    }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
    try {
        const item = await Inventory.findByIdAndDelete(req.params.id);
        
        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        
        res.json({
            success: true,
            message: 'Inventory item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        res.status(500).json({ message: 'Error deleting inventory item', error: error.message });
    }
});

// Update stock quantity
router.patch('/:id/stock', async (req, res) => {
    try {
        const { stock } = req.body;
        const item = await Inventory.findById(req.params.id);
        
        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        
        item.stock = stock;
        await item.save();
        
        res.json({
            success: true,
            message: 'Stock updated successfully',
            item
        });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ message: 'Error updating stock', error: error.message });
    }
});

// Get low stock items for a shop
router.get('/shop/:shopId/low-stock', async (req, res) => {
    try {
        const lowStockItems = await Inventory.find({
            shopId: req.params.shopId,
            $expr: { $lte: ['$stock', '$minStock'] }
        });
        res.json(lowStockItems);
    } catch (error) {
        console.error('Error fetching low stock items:', error);
        res.status(500).json({ message: 'Error fetching low stock items', error: error.message });
    }
});

// Get low stock items for a vendor
router.get('/vendor/:vendorId/low-stock', async (req, res) => {
    try {
        const lowStockItems = await Inventory.find({
            vendorId: req.params.vendorId,
            $expr: { $lte: ['$stock', '$minStock'] }
        }).populate('shopId', 'name location');
        res.json(lowStockItems);
    } catch (error) {
        console.error('Error fetching vendor low stock items:', error);
        res.status(500).json({ message: 'Error fetching low stock items', error: error.message });
    }
});

// Bulk update inventory (for transactions)
router.post('/bulk-update', async (req, res) => {
    try {
        const { updates } = req.body; // Array of { itemId, quantity }
        
        const updatePromises = updates.map(async (update) => {
            const item = await Inventory.findById(update.itemId);
            if (item) {
                item.stock = Math.max(0, item.stock - update.quantity);
                return item.save();
            }
        });
        
        await Promise.all(updatePromises);
        
        res.json({
            success: true,
            message: 'Inventory updated successfully'
        });
    } catch (error) {
        console.error('Error bulk updating inventory:', error);
        res.status(500).json({ message: 'Error updating inventory', error: error.message });
    }
});

// Get inventory by category
router.get('/shop/:shopId/category/:category', async (req, res) => {
    try {
        const items = await Inventory.find({
            shopId: req.params.shopId,
            category: req.params.category
        });
        res.json(items);
    } catch (error) {
        console.error('Error fetching inventory by category:', error);
        res.status(500).json({ message: 'Error fetching inventory', error: error.message });
    }
});

module.exports = router; 