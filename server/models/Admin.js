// models/Admin.js


const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  organization: String,
  position: String,
  password: String
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
