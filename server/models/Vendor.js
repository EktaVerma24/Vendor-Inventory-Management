const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    businessName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'vendor'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorApplication',
        required: true
    },
    permissions: [{
        type: String,
        default: ['manage_inventory', 'view_reports', 'manage_cashiers']
    }],
    // Business details from application
    businessType: String,
    taxId: String,
    businessLicense: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    preferredTerminals: [String],
    shopType: String,
    expectedRevenue: String,
    description: String,
    website: String,
    socialMedia: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Vendor', vendorSchema); 