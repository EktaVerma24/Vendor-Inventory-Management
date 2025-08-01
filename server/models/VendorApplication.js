const mongoose = require('mongoose');

const vendorApplicationSchema = new mongoose.Schema({
    // Business Information
    businessName: {
        type: String,
        required: true
    },
    businessType: {
        type: String,
        required: true
    },
    taxId: {
        type: String,
        required: true
    },
    businessLicense: {
        type: String,
        required: true
    },
    yearsInBusiness: {
        type: Number,
        default: 0
    },
    
    // Contact Information
    ownerName: {
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
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zipCode: {
        type: String,
        required: true
    },
    
    // Location Preferences
    preferredTerminals: [{
        type: String,
        required: true
    }],
    shopType: {
        type: String,
        required: true
    },
    expectedRevenue: {
        type: String,
        required: true
    },
    
    // Additional Information
    description: {
        type: String
    },
    website: {
        type: String
    },
    socialMedia: {
        type: String
    },
    
    // Application Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    
    // Admin Review
    reviewedBy: {
        type: String
    },
    reviewedAt: {
        type: Date
    },
    
    // Application Details
    applicationNumber: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

// Generate application number before saving
vendorApplicationSchema.pre('save', function(next) {
    if (!this.applicationNumber) {
        this.applicationNumber = `APP-${Date.now().toString().slice(-6)}`;
    }
    next();
});

module.exports = mongoose.model('VendorApplication', vendorApplicationSchema); 