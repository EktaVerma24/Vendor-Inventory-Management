const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    cashierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cashier',
        required: true
    },
    cashierName: {
        type: String,
        required: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    items: [{
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Inventory'
        },
        name: String,
        price: Number,
        quantity: Number,
        total: Number
    }],
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'digital'],
        default: 'cash'
    },
    status: {
        type: String,
        enum: ['completed', 'pending', 'cancelled', 'refunded'],
        default: 'completed'
    },
    customerInfo: {
        name: String,
        email: String,
        phone: String
    }
}, {
    timestamps: true
});

// Generate transaction ID before saving
transactionSchema.pre('save', function(next) {
    if (!this.transactionId) {
        this.transactionId = `TXN-${Date.now().toString().slice(-8)}`;
    }
    next();
});

module.exports = mongoose.model('Transaction', transactionSchema); 