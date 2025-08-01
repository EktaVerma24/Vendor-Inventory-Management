const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    minStock: {
        type: Number,
        required: true,
        default: 10
    },
    category: {
        type: String,
        required: true
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    description: String,
    sku: {
        type: String,
        unique: true
    },
    unit: {
        type: String,
        default: 'piece'
    }
}, {
    timestamps: true
});

// Generate SKU before saving
inventorySchema.pre('save', function(next) {
    if (!this.sku) {
        this.sku = `SKU-${Date.now().toString().slice(-8)}`;
    }
    next();
});

module.exports = mongoose.model('Inventory', inventorySchema); 