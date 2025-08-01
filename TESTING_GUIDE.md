# Airport Vendor Management System - Testing Guide

This guide will walk you through testing all features of the system step by step.

## Prerequisites

1. **MongoDB** must be installed and running
2. **Node.js** (v14 or higher) installed
3. **npm** or **yarn** package manager

## Step 1: Setup and Installation

### 1.1 Install Frontend Dependencies
```bash
# In the root project directory
npm install
```

### 1.2 Install Backend Dependencies
```bash
# Navigate to server directory
cd server
npm install
```

### 1.3 Setup Environment Variables
Create `.env` file in the `server` directory:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/airport-vendor-system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### 1.4 Initialize Database
```bash
# In the server directory
node setup.js
```
**Expected Output:**
```
Connected to MongoDB
Admin user created successfully
Email: admin@airport.com
Password: admin123
Database setup completed
```

## Step 2: Start the Application

### 2.1 Start Backend Server
```bash
# In the server directory
npm run dev
```
**Expected Output:**
```
Server is running on port 5000
MongoDB connected successfully
```

### 2.2 Start Frontend Application
```bash
# In a new terminal, from the root directory
npm run dev
```
**Expected Output:**
```
Local:   http://localhost:5173/
```

## Step 3: Testing Admin/Airport Authority Features

### 3.1 Admin Login
1. Open browser and go to `http://localhost:5173`
2. Click "Login"
3. Use admin credentials:
   - **Email:** `admin@airport.com`
   - **Password:** `admin123`
4. Click "Login"
5. **Expected Result:** You should be redirected to the Airport Authority Dashboard

### 3.2 Test Admin Dashboard
1. Verify you can see:
   - Welcome message with admin name
   - Quick Actions section
   - Statistics cards
   - Recent activity
2. Click "Vendor Approvals" in Quick Actions
3. **Expected Result:** You should see the Vendor Approval Dashboard

### 3.3 Test Vendor Approval Dashboard
1. Initially, you should see:
   - Total Applications: 0
   - Pending Applications: 0
   - Approved Applications: 0
   - Rejected Applications: 0
2. No applications should be listed initially

## Step 4: Testing Vendor Application Process

### 4.1 Submit Vendor Application
1. Go back to the main page (`http://localhost:5173`)
2. Click "Vendor Signup" or navigate to `/vendor-signup`
3. Fill out the vendor application form with test data:

**Business Information:**
- Business Name: `Test Coffee Shop`
- Business Type: `Food & Beverage`
- Tax ID: `TAX123456789`
- Business License: `LIC789456123`
- Years in Business: `5`

**Contact Information:**
- Owner Name: `John Doe`
- Email: `john.doe@testcoffee.com`
- Phone: `555-123-4567`
- Address: `123 Airport Blvd`
- City: `New York`
- State: `NY`
- Zip Code: `10001`

**Location Preferences:**
- Preferred Terminals: Select `Terminal 1`, `Terminal 2`
- Shop Type: `Coffee Shop`
- Expected Revenue: `$50,000 - $100,000`

**Additional Information:**
- Description: `Premium coffee and snacks for travelers`
- Website: `www.testcoffee.com`
- Social Media: `@testcoffee`

4. Click "Submit Application"
5. **Expected Result:** Success message with application number

### 4.2 Check Application Status
1. Go back to login page
2. Click "Check Application Status"
3. Enter the email: `john.doe@testcoffee.com`
4. **Expected Result:** Status should show "pending"

### 4.3 Admin Review Application
1. Login as admin (`admin@airport.com` / `admin123`)
2. Go to Vendor Approvals dashboard
3. You should now see:
   - Total Applications: 1
   - Pending Applications: 1
4. Click on the application to view details
5. Click "Approve"
6. **Expected Result:** 
   - Application status changes to "approved"
   - Vendor account is created
   - You should see vendor credentials (email and generated password)

## Step 5: Testing Vendor Features

### 5.1 Vendor Login
1. Use the vendor credentials from the approval process:
   - **Email:** `john.doe@testcoffee.com`
   - **Password:** (generated password from approval)
2. **Expected Result:** Redirected to Vendor Dashboard

### 5.2 Test Vendor Dashboard
1. Verify you can see:
   - Welcome message with business name
   - Quick Actions section
   - Statistics cards
2. Click "Add Shop" in Quick Actions

### 5.3 Create Shop
1. Fill out shop details:
   - Shop Name: `Test Coffee Shop - Terminal 1`
   - Location: `Terminal 1, Gate A1`
   - Terminal: `Terminal 1`
   - Shop Type: `Coffee Shop`
   - Description: `Premium coffee and snacks`
2. Click "Add Shop"
3. **Expected Result:** Shop is created and listed

### 5.4 Add Cashier
1. Go back to Vendor Dashboard
2. Click "Add Cashier"
3. Fill out cashier details:
   - Name: `Jane Smith`
   - Email: `jane.smith@testcoffee.com`
   - Phone: `555-987-6543`
   - Shop: Select the shop you just created
4. Click "Add Cashier"
5. **Expected Result:** Cashier is created with login credentials

### 5.5 Add Inventory Items
1. Go to Inventory Management
2. Click "Add Item"
3. Add a test item:
   - Name: `Premium Coffee`
   - Price: `4.99`
   - Stock: `100`
   - Min Stock: `10`
   - Category: `Beverages`
   - Description: `Premium Arabica coffee`
4. Click "Add Item"
5. **Expected Result:** Item is added to inventory

## Step 6: Testing Cashier Features

### 6.1 Cashier Login
1. Use the cashier credentials from the creation process:
   - **Email:** `jane.smith@testcoffee.com`
   - **Password:** (generated password)
2. **Expected Result:** Redirected to Cashier Dashboard

### 6.2 Test Cashier Dashboard
1. Verify you can see:
   - Shop information (name, location)
   - Active cashiers
   - Low stock alerts
   - Product selection buttons
   - Current sale items
   - Payment processing section

### 6.3 Process a Sale
1. Click on "Premium Coffee" product button
2. **Expected Result:** Item should be added to current sale
3. Update quantity to 2
4. Click "Process Payment"
5. **Expected Result:** 
   - Transaction is completed
   - Receipt is generated
   - Inventory stock is updated
   - Transaction appears in recent transactions

### 6.4 Check Inventory Updates
1. Go to Inventory Management
2. **Expected Result:** Premium Coffee stock should be reduced by 2

## Step 7: Testing Reports and Analytics

### 7.1 Vendor Reports
1. Login as vendor
2. Go to Reports section
3. **Expected Result:** Should see transaction reports and analytics

### 7.2 Admin Reports
1. Login as admin
2. Go to Reports section
3. **Expected Result:** Should see comprehensive system reports

## Step 8: Testing Multiple Cashiers

### 8.1 Add Another Cashier
1. Login as vendor
2. Add another cashier to the same shop
3. **Expected Result:** Both cashiers can access the same shop profile

### 8.2 Test Concurrent Access
1. Login as first cashier
2. In another browser/incognito window, login as second cashier
3. **Expected Result:** Both can see the same shop data and process transactions

## Step 9: Testing Error Scenarios

### 9.1 Invalid Login
1. Try logging in with wrong credentials
2. **Expected Result:** Error message should appear

### 9.2 Duplicate Email
1. Try submitting another vendor application with the same email
2. **Expected Result:** Error message about duplicate application

### 9.3 Insufficient Stock
1. As cashier, try to sell more items than available in stock
2. **Expected Result:** Should prevent the sale and show error

### 9.4 Low Stock Alert
1. Reduce inventory stock below minimum threshold
2. **Expected Result:** Low stock alert should appear on cashier dashboard

## Step 10: Database Verification

### 10.1 Check MongoDB Collections
1. Open MongoDB Compass or mongo shell
2. Connect to `airport-vendor-system` database
3. Verify collections exist:
   - `users`
   - `vendorapplications`
   - `vendors`
   - `shops`
   - `cashiers`
   - `inventory`
   - `transactions`

### 10.2 Verify Data Integrity
1. Check that vendor applications are properly linked to vendor accounts
2. Verify shop assignments to vendors
3. Confirm cashier assignments to shops
4. Check transaction relationships

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check connection string in `.env` file

2. **Port Already in Use:**
   - Change PORT in `.env` file
   - Kill existing processes on the port

3. **CORS Errors:**
   - Ensure backend is running on correct port
   - Check API_BASE_URL in frontend

4. **JWT Token Issues:**
   - Clear browser localStorage
   - Check JWT_SECRET in `.env`

### Testing Checklist:

- [ ] MongoDB is running
- [ ] Backend server starts without errors
- [ ] Frontend application loads
- [ ] Admin can login
- [ ] Vendor application can be submitted
- [ ] Admin can approve vendor application
- [ ] Vendor can login with generated credentials
- [ ] Vendor can create shops
- [ ] Vendor can add cashiers
- [ ] Cashier can login
- [ ] Cashier can process transactions
- [ ] Inventory updates correctly
- [ ] Reports are generated
- [ ] Multiple cashiers can access same shop
- [ ] Error handling works properly

## Performance Testing

1. **Load Testing:**
   - Submit multiple vendor applications
   - Create multiple shops and cashiers
   - Process multiple transactions

2. **Concurrent User Testing:**
   - Multiple cashiers processing transactions simultaneously
   - Multiple vendors managing their accounts

3. **Data Volume Testing:**
   - Add large number of inventory items
   - Process many transactions
   - Generate comprehensive reports

This testing guide covers all major features and should help you verify that the system is working correctly end-to-end. 