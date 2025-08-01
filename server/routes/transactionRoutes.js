const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Inventory = require('../models/Inventory');

// Get transactions for a specific shop
router.get('/shop/:shopId', async (req, res) => {
    try {
        const transactions = await Transaction.find({ shopId: req.params.shopId })
            .populate('cashierId', 'name')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching shop transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
});

// Get transactions for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
    try {
        const transactions = await Transaction.find({ vendorId: req.params.vendorId })
            .populate('shopId', 'name location')
            .populate('cashierId', 'name')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching vendor transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
});

// Get all transactions (admin only)
router.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('shopId', 'name location')
            .populate('vendorId', 'name businessName')
            .populate('cashierId', 'name')
            .sort({ createdAt: -1 })
            .limit(200);
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching all transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
});

// Get transaction by ID
router.get('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('shopId', 'name location')
            .populate('vendorId', 'name businessName')
            .populate('cashierId', 'name');
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json(transaction);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ message: 'Error fetching transaction', error: error.message });
    }
});

// Create new transaction
router.post('/', async (req, res) => {
    try {
        const transactionData = req.body;
        
        // Create transaction
        const transaction = new Transaction(transactionData);
        await transaction.save();
        
        // Update inventory stock
        if (transactionData.items && transactionData.items.length > 0) {
            const updatePromises = transactionData.items.map(async (item) => {
                const inventoryItem = await Inventory.findById(item.itemId);
                if (inventoryItem) {
                    inventoryItem.stock = Math.max(0, inventoryItem.stock - item.quantity);
                    return inventoryItem.save();
                }
            });
            
            await Promise.all(updatePromises);
        }
        
        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            transaction
        });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Error creating transaction', error: error.message });
    }
});

// Get transactions by date range
router.get('/date-range/:startDate/:endDate', async (req, res) => {
    try {
        const { startDate, endDate } = req.params;
        const { shopId, vendorId } = req.query;
        
        let query = {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };
        
        if (shopId) query.shopId = shopId;
        if (vendorId) query.vendorId = vendorId;
        
        const transactions = await Transaction.find(query)
            .populate('shopId', 'name location')
            .populate('cashierId', 'name')
            .sort({ createdAt: -1 });
        
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions by date range:', error);
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
});

// Get transaction statistics
router.get('/stats/shop/:shopId', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }
        
        const transactions = await Transaction.find({
            shopId: req.params.shopId,
            ...dateFilter
        });
        
        const stats = {
            totalTransactions: transactions.length,
            totalRevenue: transactions.reduce((sum, t) => sum + t.total, 0),
            totalItems: transactions.reduce((sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
            averageTransactionValue: transactions.length > 0 ? transactions.reduce((sum, t) => sum + t.total, 0) / transactions.length : 0
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Error fetching transaction stats:', error);
        res.status(500).json({ message: 'Error fetching transaction stats', error: error.message });
    }
});

// Get transaction statistics for vendor
router.get('/stats/vendor/:vendorId', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }
        
        const transactions = await Transaction.find({
            vendorId: req.params.vendorId,
            ...dateFilter
        });
        
        const stats = {
            totalTransactions: transactions.length,
            totalRevenue: transactions.reduce((sum, t) => sum + t.total, 0),
            totalItems: transactions.reduce((sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
            averageTransactionValue: transactions.length > 0 ? transactions.reduce((sum, t) => sum + t.total, 0) / transactions.length : 0,
            shops: [...new Set(transactions.map(t => t.shopId.toString()))].length
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Error fetching vendor transaction stats:', error);
        res.status(500).json({ message: 'Error fetching transaction stats', error: error.message });
    }
});

// Update transaction status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        
        transaction.status = status;
        await transaction.save();
        
        res.json({
            success: true,
            message: 'Transaction status updated successfully',
            transaction
        });
    } catch (error) {
        console.error('Error updating transaction status:', error);
        res.status(500).json({ message: 'Error updating transaction status', error: error.message });
    }
});

// Get recent transactions (last 24 hours)
router.get('/recent/shop/:shopId', async (req, res) => {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const transactions = await Transaction.find({
            shopId: req.params.shopId,
            createdAt: { $gte: yesterday }
        })
        .populate('cashierId', 'name')
        .sort({ createdAt: -1 });
        
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching recent transactions:', error);
        res.status(500).json({ message: 'Error fetching recent transactions', error: error.message });
    }
});

module.exports = router; 