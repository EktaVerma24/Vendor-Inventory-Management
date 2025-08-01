// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin'); // create this schema if missing
const bcrypt = require('bcryptjs');

// POST /api/admin/signup
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, phone, organization, position, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({
      fullName,
      email,
      phone,
      organization,
      position,
      password: hashedPassword
    });

    await admin.save();
    res.status(201).json({ message: 'Admin created successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
