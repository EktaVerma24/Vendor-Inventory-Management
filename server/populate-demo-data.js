const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const VendorApplication = require('./models/VendorApplication');
const Shop = require('./models/Shop');
const Cashier = require('./models/Cashier');
const Inventory = require('./models/Inventory');
const Transaction = require('./models/Transaction');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const populateDemoData = async () => {
  try {
    console.log('Starting to populate demo data...');

    // Clear existing data
    await User.deleteMany({});
    await Vendor.deleteMany({});
    await VendorApplication.deleteMany({});
    await Shop.deleteMany({});
    await Cashier.deleteMany({});
    await Inventory.deleteMany({});
    await Transaction.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Airport Authority Admin',
      email: 'admin@airport.com',
      password: adminPassword,
      role: 'airport_authority',
      permissions: ['view_all_vendors', 'view_all_shops', 'view_all_transactions', 'generate_reports', 'approve_vendors']
    });
    await admin.save();
    console.log('Created admin user');

    // Create demo vendor applications
    const applications = [
      {
        businessName: 'Skyway Coffee',
        businessType: 'Food & Beverage',
        taxId: 'TAX123456789',
        businessLicense: 'LIC789456123',
        yearsInBusiness: '5',
        ownerName: 'John Smith',
        email: 'john@skywaycoffee.com',
        phone: '+1-555-0123',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        preferredTerminals: ['Terminal A', 'Terminal B'],
        shopType: 'Cafe',
        expectedRevenue: '25000-50000',
        description: 'Premium coffee and light snacks for travelers',
        website: 'https://skywaycoffee.com',
        socialMedia: '@skywaycoffee',
        status: 'pending',
        applicationNumber: 'APP-001'
      },
      {
        businessName: 'Travel Essentials Plus',
        businessType: 'Retail',
        taxId: 'TAX987654321',
        businessLicense: 'LIC456789123',
        yearsInBusiness: '8',
        ownerName: 'Sarah Johnson',
        email: 'sarah@travelessentials.com',
        phone: '+1-555-0456',
        address: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        preferredTerminals: ['Terminal C', 'Terminal D'],
        shopType: 'Gift Shop',
        expectedRevenue: '50000-100000',
        description: 'Travel accessories, gifts, and convenience items',
        website: 'https://travelessentials.com',
        socialMedia: '@travelessentials',
        status: 'approved',
        applicationNumber: 'APP-002'
      },
      {
        businessName: 'Quick Bites Express',
        businessType: 'Food & Beverage',
        taxId: 'TAX456789123',
        businessLicense: 'LIC123789456',
        yearsInBusiness: '3',
        ownerName: 'Mike Davis',
        email: 'mike@quickbites.com',
        phone: '+1-555-0789',
        address: '789 Pine Street',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        preferredTerminals: ['Terminal A'],
        shopType: 'Restaurant',
        expectedRevenue: '100000+',
        description: 'Fast-casual dining with healthy options',
        website: 'https://quickbites.com',
        socialMedia: '@quickbites',
        status: 'rejected',
        applicationNumber: 'APP-003'
      }
    ];

    for (const appData of applications) {
      const application = new VendorApplication(appData);
      await application.save();
    }
    console.log('Created vendor applications');

    // Create approved vendors
    const vendorPassword = await bcrypt.hash('vendor123', 10);
    const vendor = new Vendor({
      email: 'vendor@example.com',
      password: vendorPassword,
      name: 'John Doe Vendor',
      businessName: 'Demo Vendor Business',
      businessType: 'Retail',
      taxId: 'TAX123456789',
      businessLicense: 'LIC789456123',
      phone: '+1-555-0123',
      address: '123 Business Ave',
      city: 'Demo City',
      state: 'DC',
      zipCode: '20001',
      preferredTerminals: ['Terminal A', 'Terminal B'],
      shopType: 'Gift Shop',
      expectedRevenue: '25000-50000',
      description: 'Demo vendor for testing purposes',
      status: 'active'
    });
    await vendor.save();
    console.log('Created demo vendor');

    // Create shops
    const shops = [
      {
        name: 'Skyway Coffee - Terminal A',
        location: 'Terminal A, Level 2',
        vendorId: vendor._id,
        shopType: 'Cafe',
        status: 'active',
        openingHours: '06:00-22:00',
        contactNumber: '+1-555-0123'
      },
      {
        name: 'Travel Essentials - Terminal B',
        location: 'Terminal B, Level 1',
        vendorId: vendor._id,
        shopType: 'Gift Shop',
        status: 'active',
        openingHours: '07:00-23:00',
        contactNumber: '+1-555-0456'
      }
    ];

    for (const shopData of shops) {
      const shop = new Shop(shopData);
      await shop.save();
    }
    console.log('Created shops');

    // Create cashiers
    const cashierPassword = await bcrypt.hash('cashier123', 10);
    const cashier = new Cashier({
      email: 'cashier@shop1.com',
      password: cashierPassword,
      name: 'Jane Smith',
      phone: '+1-555-0789',
      shopId: shops[0]._id,
      vendorId: vendor._id,
      status: 'active',
      permissions: ['process_bills', 'view_inventory', 'generate_receipts']
    });
    await cashier.save();
    console.log('Created cashier');

    // Create inventory items
    const inventoryItems = [
      {
        name: 'Premium Coffee',
        category: 'Beverages',
        price: 4.50,
        cost: 2.00,
        stock: 50,
        minStock: 10,
        shopId: shops[0]._id,
        vendorId: vendor._id,
        description: 'Premium arabica coffee',
        sku: 'COF-001'
      },
      {
        name: 'Sandwich',
        category: 'Food',
        price: 8.99,
        cost: 4.50,
        stock: 25,
        minStock: 5,
        shopId: shops[0]._id,
        vendorId: vendor._id,
        description: 'Fresh deli sandwich',
        sku: 'SND-001'
      },
      {
        name: 'Travel Mug',
        category: 'Accessories',
        price: 15.99,
        cost: 8.00,
        stock: 8,
        minStock: 10,
        shopId: shops[1]._id,
        vendorId: vendor._id,
        description: 'Insulated travel mug',
        sku: 'MUG-001'
      }
    ];

    for (const itemData of inventoryItems) {
      const item = new Inventory(itemData);
      await item.save();
    }
    console.log('Created inventory items');

    // Create sample transactions
    const transactions = [
      {
        shopId: shops[0]._id,
        vendorId: vendor._id,
        cashierId: cashier._id,
        items: [
          {
            itemId: inventoryItems[0]._id,
            name: 'Premium Coffee',
            quantity: 2,
            price: 4.50,
            total: 9.00
          }
        ],
        subtotal: 9.00,
        tax: 0.72,
        total: 9.72,
        paymentMethod: 'card',
        status: 'completed',
        customerInfo: {
          name: 'John Traveler',
          email: 'john@example.com'
        }
      },
      {
        shopId: shops[1]._id,
        vendorId: vendor._id,
        cashierId: cashier._id,
        items: [
          {
            itemId: inventoryItems[2]._id,
            name: 'Travel Mug',
            quantity: 1,
            price: 15.99,
            total: 15.99
          }
        ],
        subtotal: 15.99,
        tax: 1.28,
        total: 17.27,
        paymentMethod: 'cash',
        status: 'completed',
        customerInfo: {
          name: 'Sarah Passenger',
          email: 'sarah@example.com'
        }
      }
    ];

    for (const transactionData of transactions) {
      const transaction = new Transaction(transactionData);
      await transaction.save();
    }
    console.log('Created sample transactions');

    console.log('Demo data populated successfully!');
    console.log('\nDemo Login Credentials:');
    console.log('Admin: admin@airport.com / admin123');
    console.log('Vendor: vendor@example.com / vendor123');
    console.log('Cashier: cashier@shop1.com / cashier123');

  } catch (error) {
    console.error('Error populating demo data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
connectDB().then(() => {
  populateDemoData();
});
