const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const VendorApplication = require('./models/VendorApplication');
const Vendor = require('./models/Vendor');
const Shop = require('./models/Shop');
const Cashier = require('./models/Cashier');
const Inventory = require('./models/Inventory');
require('dotenv').config();

const createTestData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/airport-vendor-system');
    console.log('Connected to MongoDB');

    // Clear existing test data
    await VendorApplication.deleteMany({});
    await Vendor.deleteMany({});
    await Shop.deleteMany({});
    await Cashier.deleteMany({});
    await Inventory.deleteMany({});
    console.log('Cleared existing test data');

    // Create test vendor applications
    const applications = [
      {
        businessName: 'Sky Coffee',
        businessType: 'Food & Beverage',
        taxId: 'TAX123456789',
        businessLicense: 'LIC789456123',
        yearsInBusiness: 3,
        ownerName: 'Sarah Johnson',
        email: 'sarah@skycoffee.com',
        phone: '555-111-2222',
        address: '456 Airport Way',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        preferredTerminals: ['Terminal 1', 'Terminal 3'],
        shopType: 'Coffee Shop',
        expectedRevenue: '$25,000 - $50,000',
        description: 'Premium coffee and pastries',
        status: 'approved'
      },
      {
        businessName: 'Travel Essentials',
        businessType: 'Retail',
        taxId: 'TAX987654321',
        businessLicense: 'LIC321654987',
        yearsInBusiness: 7,
        ownerName: 'Mike Chen',
        email: 'mike@travelessentials.com',
        phone: '555-333-4444',
        address: '789 Terminal Blvd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        preferredTerminals: ['Terminal 2'],
        shopType: 'Convenience Store',
        expectedRevenue: '$75,000 - $100,000',
        description: 'Travel essentials and snacks',
        status: 'pending'
      }
    ];

    for (const appData of applications) {
      const application = new VendorApplication(appData);
      await application.save();
      console.log(`Created application for ${appData.businessName}`);

      // If approved, create vendor account
      if (appData.status === 'approved') {
        const password = 'vendor123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const vendor = new Vendor({
          email: appData.email,
          password: hashedPassword,
          name: appData.ownerName,
          businessName: appData.businessName,
          applicationId: application._id,
          businessType: appData.businessType,
          taxId: appData.taxId,
          businessLicense: appData.businessLicense,
          phone: appData.phone,
          address: appData.address,
          city: appData.city,
          state: appData.state,
          zipCode: appData.zipCode,
          preferredTerminals: appData.preferredTerminals,
          shopType: appData.shopType,
          expectedRevenue: appData.expectedRevenue,
          description: appData.description
        });

        await vendor.save();
        console.log(`Created vendor account for ${appData.businessName}`);
        console.log(`Email: ${appData.email}, Password: ${password}`);

        // Create shops for approved vendors
        const shops = [
          {
            name: `${appData.businessName} - Terminal 1`,
            location: 'Terminal 1, Gate A1',
            terminal: 'Terminal 1',
            shopType: appData.shopType,
            description: appData.description,
            vendorId: vendor._id,
            vendorName: appData.businessName
          },
          {
            name: `${appData.businessName} - Terminal 3`,
            location: 'Terminal 3, Gate C2',
            terminal: 'Terminal 3',
            shopType: appData.shopType,
            description: appData.description,
            vendorId: vendor._id,
            vendorName: appData.businessName
          }
        ];

        for (const shopData of shops) {
          const shop = new Shop(shopData);
          await shop.save();
          console.log(`Created shop: ${shopData.name}`);

          // Create cashiers for each shop
          const cashiers = [
            {
              name: 'Alex Rodriguez',
              email: `alex.${shop._id}@${appData.businessName.toLowerCase().replace(/\s+/g, '')}.com`,
              phone: '555-555-1111',
              password: 'cashier123',
              vendorId: vendor._id,
              shopId: shop._id
            },
            {
              name: 'Emily Davis',
              email: `emily.${shop._id}@${appData.businessName.toLowerCase().replace(/\s+/g, '')}.com`,
              phone: '555-555-2222',
              password: 'cashier123',
              vendorId: vendor._id,
              shopId: shop._id
            }
          ];

          for (const cashierData of cashiers) {
            const hashedPassword = await bcrypt.hash(cashierData.password, 10);
            const cashier = new Cashier({
              ...cashierData,
              password: hashedPassword
            });
            await cashier.save();
            console.log(`Created cashier: ${cashierData.name} (${cashierData.email})`);
          }

          // Create inventory items for each shop
          const inventoryItems = [
            {
              name: 'Premium Coffee',
              price: 4.99,
              stock: 100,
              minStock: 10,
              category: 'Beverages',
              description: 'Premium Arabica coffee',
              shopId: shop._id,
              vendorId: vendor._id
            },
            {
              name: 'Chocolate Croissant',
              price: 3.49,
              stock: 50,
              minStock: 5,
              category: 'Pastries',
              description: 'Buttery chocolate croissant',
              shopId: shop._id,
              vendorId: vendor._id
            },
            {
              name: 'Bottled Water',
              price: 2.99,
              stock: 200,
              minStock: 20,
              category: 'Beverages',
              description: 'Spring water',
              shopId: shop._id,
              vendorId: vendor._id
            },
            {
              name: 'Energy Bar',
              price: 2.49,
              stock: 75,
              minStock: 8,
              category: 'Snacks',
              description: 'Protein energy bar',
              shopId: shop._id,
              vendorId: vendor._id
            }
          ];

          for (const itemData of inventoryItems) {
            const item = new Inventory(itemData);
            await item.save();
            console.log(`Created inventory item: ${itemData.name}`);
          }
        }
      }
    }

    console.log('\n========================================');
    console.log('Test Data Created Successfully!');
    console.log('========================================');
    console.log('\nTest Accounts:');
    console.log('\nAdmin:');
    console.log('Email: admin@airport.com');
    console.log('Password: admin123');
    console.log('\nVendor (Sky Coffee):');
    console.log('Email: sarah@skycoffee.com');
    console.log('Password: vendor123');
    console.log('\nCashiers:');
    console.log('Email: alex.[shopId]@skycoffee.com');
    console.log('Password: cashier123');
    console.log('Email: emily.[shopId]@skycoffee.com');
    console.log('Password: cashier123');

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDatabase connection closed');
  }
};

createTestData(); 