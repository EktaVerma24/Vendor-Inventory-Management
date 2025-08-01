const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data storage (for demo purposes)
let users = [];
let vendorApplications = [];
let vendors = [];
let shops = [];
let cashiers = [];
let inventory = [];
let transactions = [];
let adminEmail = 'ekta24v@gmail.com'; // Default admin email

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Send approval email with credentials
const sendApprovalEmail = async (vendorEmail, vendorName, credentials) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: adminEmail,
      to: vendorEmail,
      subject: 'Vendor Application Approved - Airport Vendor Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Congratulations! Your Vendor Application is Approved</h2>
          
          <p>Dear ${vendorName},</p>
          
          <p>We are pleased to inform you that your vendor application has been approved by our admin team.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${credentials.email}</p>
            <p><strong>Password:</strong> ${credentials.password}</p>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Visit our vendor portal at: http://localhost:5173</li>
            <li>Use the credentials above to login</li>
            <li>Set up your shop and start managing your business</li>
            <li>Change your password after first login for security</li>
          </ol>
          
          <p style="color: #dc2626;"><strong>Important:</strong> Please keep these credentials secure and change your password after first login.</p>
          
          <p>Welcome to the Airport Vendor Management System!</p>
          
          <p>Best regards,<br>Admin Team<br>${adminEmail}</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Approval email sent successfully to:', vendorEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending approval email:', error);
    throw error;
  }
};

// Send rejection email
const sendRejectionEmail = async (vendorEmail, vendorName, reason) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: adminEmail,
      to: vendorEmail,
      subject: 'Vendor Application Status - Airport Vendor Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Vendor Application Update</h2>
          
          <p>Dear ${vendorName},</p>
          
          <p>Thank you for your interest in becoming a vendor with our Airport Vendor Management System.</p>
          
          <p>After careful review, we regret to inform you that your application has not been approved at this time.</p>
          
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          
          <p>You are welcome to reapply in the future. Please ensure all requirements are met before resubmitting.</p>
          
          <p>Thank you for your understanding.</p>
          
          <p>Best regards,<br>Admin Team<br>${adminEmail}</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Rejection email sent successfully to:', vendorEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending rejection email:', error);
    throw error;
  }
};

// Initialize demo data
const initializeDemoData = async () => {
  // No default admin user - admins must sign up through the form

  // Create demo vendor
  const vendorPassword = await bcrypt.hash('vendor123', 10);
  vendors.push({
    id: 'vendor_001',
    email: 'vendor@example.com',
    password: vendorPassword,
    name: 'John Doe Vendor',
    businessName: 'Demo Vendor Business',
    businessType: 'Retail',
    status: 'active'
  });

  // Create demo cashier
  const cashierPassword = await bcrypt.hash('cashier123', 10);
  cashiers.push({
    id: 'cashier_001',
    email: 'cashier@shop1.com',
    password: cashierPassword,
    name: 'Jane Smith',
    shopId: 'shop_001',
    vendorId: 'vendor_001',
    status: 'active',
    permissions: ['process_bills', 'view_inventory', 'generate_receipts']
  });

  // Create demo shops
  shops.push({
    id: 'shop_001',
    name: 'Skyway Coffee - Terminal A',
    location: 'Terminal A, Level 2',
    vendorId: 'vendor_001',
    shopType: 'Cafe',
    status: 'active',
    openingHours: '06:00-22:00',
    contactNumber: '+1-555-0123'
  });

  // Create demo inventory
  inventory.push({
    id: 'inv_001',
    name: 'Premium Coffee',
    category: 'Beverages',
    price: 4.50,
    cost: 2.00,
    stock: 50,
    minStock: 10,
    shopId: 'shop_001',
    vendorId: 'vendor_001',
    description: 'Premium arabica coffee',
    sku: 'COF-001'
  });

  console.log('Demo data initialized successfully!');
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check admin users
    let user = users.find(u => u.email === email);
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const token = jwt.sign(
          { userId: user.id, role: user.role },
          'your-secret-key',
          { expiresIn: '24h' }
        );

        return res.json({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.permissions
          }
        });
      }
    }

    // Check vendors
    let vendor = vendors.find(v => v.email === email);
    if (vendor) {
      const isMatch = await bcrypt.compare(password, vendor.password);
      if (isMatch) {
        const token = jwt.sign(
          { userId: vendor.id, role: 'vendor' },
          'your-secret-key',
          { expiresIn: '24h' }
        );

        return res.json({
          success: true,
          token,
          user: {
            id: vendor.id,
            email: vendor.email,
            name: vendor.name,
            businessName: vendor.businessName,
            role: 'vendor',
            vendorId: vendor.id,
            status: vendor.status,
            permissions: ['manage_inventory', 'view_reports', 'manage_cashiers']
          }
        });
      }
    }

    // Check cashiers
    let cashier = cashiers.find(c => c.email === email);
    if (cashier) {
      const isMatch = await bcrypt.compare(password, cashier.password);
      if (isMatch) {
        const token = jwt.sign(
          { userId: cashier.id, role: 'cashier' },
          'your-secret-key',
          { expiresIn: '24h' }
        );

        return res.json({
          success: true,
          token,
          user: {
            id: cashier.id,
            email: cashier.email,
            name: cashier.name,
            role: 'cashier',
            shopId: cashier.shopId,
            vendorId: cashier.vendorId,
            status: cashier.status,
            permissions: ['process_bills', 'view_inventory', 'generate_receipts']
          }
        });
      }
    }

    res.status(400).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin signup
app.post('/api/admin/signup', async (req, res) => {
  try {
    const { name, email, password, phone, organization, position } = req.body;

    // Check if admin already exists
    const existingAdmin = users.find(u => u.email === email);
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin account already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = {
      id: `admin_${Date.now()}`,
      name: name,
      email: email,
      password: hashedPassword,
      phone: phone,
      organization: organization,
      position: position,
      role: 'airport_authority',
      permissions: ['view_all_vendors', 'view_all_shops', 'view_all_transactions', 'generate_reports', 'approve_vendors']
    };

    users.push(adminUser);

    // Set admin email for email system
    adminEmail = email;

    console.log('✅ Admin account created:', email);
    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      admin: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        organization: adminUser.organization,
        position: adminUser.position
      }
    });
  } catch (error) {
    console.error('Error creating admin account:', error);
    res.status(500).json({ message: 'Error creating admin account' });
  }
});

// Admin email configuration
app.post('/api/admin/email-config', (req, res) => {
  try {
    const { email } = req.body;
    adminEmail = email;
    console.log('✅ Admin email updated to:', adminEmail);
    res.json({ success: true, message: 'Admin email updated successfully' });
  } catch (error) {
    console.error('Error updating admin email:', error);
    res.status(500).json({ message: 'Error updating admin email' });
  }
});

app.get('/api/admin/email-config', (req, res) => {
  res.json({ email: adminEmail });
});

// Vendor application routes
app.post('/api/vendor-applications/submit', (req, res) => {
  try {
    const applicationData = req.body;
    const newApplication = {
      id: `app_${Date.now()}`,
      ...applicationData,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      applicationNumber: `APP-${Date.now().toString().slice(-6)}`
    };
    
    vendorApplications.push(newApplication);
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationNumber: newApplication.applicationNumber
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Error submitting application' });
  }
});

app.get('/api/vendor-applications', (req, res) => {
  try {
    res.json(vendorApplications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

app.patch('/api/vendor-applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewedBy, reason } = req.body;
    
    const application = vendorApplications.find(app => app.id === id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    application.reviewedBy = reviewedBy;
    application.reviewedAt = new Date().toISOString();

    if (status === 'approved') {
      const password = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(password, 10);

      const vendor = {
        id: `vendor_${Date.now()}`,
        email: application.email,
        password: hashedPassword,
        name: application.ownerName,
        businessName: application.businessName,
        businessType: application.businessType,
        status: 'active'
      };

      vendors.push(vendor);

      // Send approval email
      try {
        await sendApprovalEmail(application.email, application.ownerName, {
          email: vendor.email,
          password: password
        });
      } catch (emailError) {
        console.error('Email sending failed, but vendor account created:', emailError);
      }

      res.json({
        success: true,
        message: 'Application approved, vendor account created, and approval email sent',
        vendor: {
          email: vendor.email,
          password: password,
          name: vendor.name,
          businessName: vendor.businessName
        }
      });
    } else if (status === 'rejected') {
      // Send rejection email
      try {
        await sendRejectionEmail(application.email, application.ownerName, reason);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      res.json({
        success: true,
        message: `Application rejected and rejection email sent`,
        application
      });
    } else {
      res.json({
        success: true,
        message: `Application ${status}`,
        application
      });
    }
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
});

// Test route
app.get('/', (req, res) => {
  res.send('Airport Vendor Management System API is running!');
});

// Initialize demo data and start server
const PORT = process.env.PORT || 5000;

initializeDemoData().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:5173`);
    console.log(`🔧 Backend: http://localhost:${PORT}`);
    console.log('\n🔑 Demo Login Credentials:');
    console.log('   Admin: admin@airport.com / admin123');
    console.log('   Vendor: vendor@example.com / vendor123');
    console.log('   Cashier: cashier@shop1.com / cashier123');
    console.log('\n📧 Email Configuration:');
    console.log('   Update server/.env with EMAIL_USER and EMAIL_PASS');
    console.log('   Or configure admin email in the dashboard');
  });
}); 