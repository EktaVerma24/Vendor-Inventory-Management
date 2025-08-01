const mongoose = require('mongoose');

const cashierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    loginId: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        default: 'cashier'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    permissions: [{
        type: String,
        default: ['process_bills', 'view_inventory', 'generate_receipts']
    }]
}, {
    timestamps: true
});

// Generate login ID before saving
cashierSchema.pre('save', function(next) {
    if (!this.loginId) {
        this.loginId = `cashier_${Date.now().toString().slice(-6)}`;
    }
    next();
});

module.exports = mongoose.model('Cashier', cashierSchema); 