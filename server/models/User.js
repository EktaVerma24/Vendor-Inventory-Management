const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true      
    },
    email: {
        type: String,
        required: true,
        unique: true    
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'airport_authority'],
        default: 'airport_authority'
    },
    permissions: [{
        type: String,
        default: ['view_all_vendors', 'view_all_shops', 'view_all_transactions', 'generate_reports', 'approve_vendors']
    }],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);