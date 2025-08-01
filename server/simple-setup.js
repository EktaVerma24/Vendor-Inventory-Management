const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory data
let users = [];
let vendors = [];
let cashiers = [];
let vendorApplications = [];
let shops = [];
let inventory = [];
let transactions = [];
let adminEmail = process.env.EMAIL_USER || 'ekta24v@gmail.com';

// Email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Send approval email
const sendApprovalEmail = async (vendorEmail, vendorName, credentials) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: adminEmail,
    to: vendorEmail,
    subject: 'Vendor Application Approved',
    html: `
      <h2>Approved!</h2>
      <p>Dear ${vendorName},</p>
      <p>Your application has been approved.</p>
      <p><strong>Email:</strong> ${credentials.email}</p>
      <p><strong>Password:</strong> ${credentials.password}</p>
    `
  };
  await transporter.sendMail(mailOptions);
};

// Send rejection email
const sendRejectionEmail = async (vendorEmail, vendorName, reason) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: adminEmail,
    to: vendorEmail,
    subject: 'Vendor Application Rejected',
    html: `
      <h2>Application Rejected</h2>
      <p>Dear ${vendorName},</p>
      <p>Reason: ${reason}</p>
    `
  };
  await transporter.sendMail(mailOptions);
};

// ✅ Admin Signup
app.post('/api/admin/signup', async (req, res) => {
  try {
    const { name, email, password, phone, organization, position } = req.body;
    const existing = users.find(user => user.email === email);
    if (existing) return res.status(400).json({ message: 'Admin already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = {
      id: `admin_${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      phone,
      organization,
      position,
      role: 'airport_authority',
      permissions: ['view_all_vendors', 'approve_vendors', 'generate_reports']
    };

    users.push(admin);
    adminEmail = email;

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        organization,
        position
      }
    });
  } catch (err) {
    console.error('Admin signup error:', err);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Admin Email Config (Optional)
app.post('/api/admin/email-config', (req, res) => {
  const { email } = req.body;
  adminEmail = email;
  res.json({ success: true, message: 'Admin email updated' });
});

// ✅ Auth Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  const vendor = vendors.find(v => v.email === email);
  const cashier = cashiers.find(c => c.email === email);

  const entity = user || vendor || cashier;
  if (!entity) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, entity.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

  const role = user ? user.role : vendor ? 'vendor' : 'cashier';

  const token = jwt.sign({ id: entity.id, role }, 'secret', { expiresIn: '24h' });

  res.json({
    success: true,
    token,
    user: {
      id: entity.id,
      email: entity.email,
      name: entity.name,
      role: role,
      ...(vendor && { businessName: vendor.businessName }),
      ...(cashier && { shopId: cashier.shopId }),
      permissions: entity.permissions || []
    }
  });
});

// ✅ Vendor Application Submission
app.post('/api/vendor-applications/submit', (req, res) => {
  const data = req.body;
  const appData = {
    id: `app_${Date.now()}`,
    ...data,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    applicationNumber: `APP-${Date.now().toString().slice(-6)}`
  };
  vendorApplications.push(appData);
  res.status(201).json({ success: true, message: 'Submitted', applicationNumber: appData.applicationNumber });
});

// ✅ Vendor Application Review
app.patch('/api/vendor-applications/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, reviewedBy, reason } = req.body;

  const app = vendorApplications.find(app => app.id === id);
  if (!app) return res.status(404).json({ message: 'Not found' });

  app.status = status;
  app.reviewedBy = reviewedBy;
  app.reviewedAt = new Date().toISOString();

  if (status === 'approved') {
    const rawPass = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPass, 10);

    const vendor = {
      id: `vendor_${Date.now()}`,
      email: app.email,
      name: app.ownerName,
      password: hashedPassword,
      businessName: app.businessName,
      businessType: app.businessType,
      status: 'active'
    };

    vendors.push(vendor);
    try {
      await sendApprovalEmail(vendor.email, vendor.name, { email: vendor.email, password: rawPass });
    } catch (err) {
      console.error('Email failed:', err);
    }

    return res.json({ success: true, message: 'Vendor created & emailed', vendor });
  } else if (status === 'rejected') {
    await sendRejectionEmail(app.email, app.ownerName, reason);
    return res.json({ success: true, message: 'Application rejected', application: app });
  }

  res.json({ success: true, message: `Status updated to ${status}`, application: app });
});

// ✅ View All Vendor Applications
app.get('/api/vendor-applications', (req, res) => {
  res.json(vendorApplications);
});

// Test Route
app.get('/', (req, res) => {
  res.send('🛫 Airport Vendor Management API is running!');
});

// Demo Data
const initializeDemoData = async () => {
  const vendorPassword = await bcrypt.hash('vendor123', 10);
  vendors.push({
    id: 'vendor_001',
    email: 'vendor@example.com',
    password: vendorPassword,
    name: 'John Vendor',
    businessName: 'Sky Retail',
    businessType: 'Retail',
    status: 'active'
  });

  const cashierPassword = await bcrypt.hash('cashier123', 10);
  cashiers.push({
    id: 'cashier_001',
    email: 'cashier@shop1.com',
    password: cashierPassword,
    name: 'Jane Cashier',
    shopId: 'shop_001',
    vendorId: 'vendor_001',
    status: 'active',
    permissions: ['process_bills', 'view_inventory']
  });

  shops.push({
    id: 'shop_001',
    name: 'Coffee Express',
    location: 'Terminal A',
    vendorId: 'vendor_001'
  });

  inventory.push({
    id: 'inv_001',
    name: 'Coffee Cup',
    price: 3.5,
    stock: 100,
    shopId: 'shop_001'
  });

  console.log('✅ Demo data loaded');
};

const PORT = process.env.PORT || 5000;
initializeDemoData().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
    console.log('🔑 Demo Admin: admin@airport.com / admin123');
    console.log('🔑 Demo Vendor: vendor@example.com / vendor123');
    console.log('🔑 Demo Cashier: cashier@shop1.com / cashier123');
  });
});
