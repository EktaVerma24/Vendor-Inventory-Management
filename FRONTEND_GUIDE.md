# Airport Vendor Management System - Frontend Guide

## 🚀 Quick Start

1. **Start the application:**
   ```bash
   npm start
   ```

2. **Open your browser** and go to `http://localhost:3000`

3. **Use the demo credentials** to test different user roles:

## 👥 Demo User Accounts

### Airport Authority (Admin)
- **Email:** `admin@airport.com`
- **Password:** `admin123`
- **Access:** Full system access, vendor approvals, reports

### Vendor
- **Email:** `vendor@example.com`
- **Password:** `vendor123`
- **Access:** Manage shops, cashiers, inventory, view reports

### Cashier
- **Email:** `cashier@shop1.com`
- **Password:** `cashier123`
- **Access:** Process transactions, manage inventory, view shop data

## 🏪 System Features

### For Airport Authority (Admin)
- **Dashboard:** Overview of all vendors, shops, and transactions
- **Vendor Approvals:** Review and approve/reject vendor applications
- **Reports:** Generate comprehensive system reports
- **Settings:** System configuration

### For Vendors
- **Dashboard:** Overview of their shops, revenue, and performance
- **Shop Management:** Add, edit, and manage shop locations
- **Cashier Management:** Add and manage cashier accounts
- **Inventory Management:** Track stock levels across all shops
- **Billing System:** View transaction history
- **Reports:** Generate business reports
- **Settings:** Account and business settings

### For Cashiers
- **Dashboard:** Point-of-sale interface with real-time data
- **Inventory:** View and manage shop inventory
- **Billing:** Process transactions and generate receipts
- **Reports:** View shop-specific reports
- **Settings:** Personal account settings

## 🛍️ How to Test the System

### 1. Test Vendor Application Process
1. Go to the login page
2. Click "Apply Now" to access vendor signup
3. Fill out the vendor application form
4. Submit the application
5. Login as admin to approve the application

### 2. Test Cashier Operations
1. Login as a cashier (`cashier@shop1.com`)
2. Add items to the current sale
3. Process a payment
4. Check that inventory updates automatically
5. View recent transactions

### 3. Test Vendor Management
1. Login as a vendor (`vendor@example.com`)
2. View dashboard with shop statistics
3. Navigate to "Manage Shops" to add new locations
4. Go to "Manage Cashiers" to add new cashiers
5. Check inventory and reports

### 4. Test Admin Functions
1. Login as admin (`admin@airport.com`)
2. Go to "Vendor Approvals" to review applications
3. Approve or reject vendor applications
4. View system-wide reports and statistics

## 📊 Mock Data Structure

The system uses localStorage to store mock data:

- **Shops:** 3 demo shops across different terminals
- **Cashiers:** 3 demo cashiers assigned to different shops
- **Inventory:** 12 items across different categories
- **Transactions:** Sample transaction history
- **Vendor Applications:** 2 demo applications (1 approved, 1 pending)

## 🎨 UI Features

- **Responsive Design:** Works on desktop, tablet, and mobile
- **Real-time Updates:** Data updates automatically
- **Role-based Access:** Different interfaces for different user types
- **Modern UI:** Clean, professional design with Tailwind CSS
- **Interactive Elements:** Hover effects, loading states, and smooth transitions

## 🔧 Technical Details

- **Frontend:** React.js with React Router
- **State Management:** React Context API
- **Styling:** Tailwind CSS
- **Icons:** Heroicons
- **Data Storage:** localStorage (mock data)
- **Build Tool:** Vite

## 🚨 Important Notes

1. **Data Persistence:** All data is stored in browser localStorage and will be lost on page refresh
2. **Mock System:** This is a frontend-only demo with simulated data
3. **No Backend:** No actual database or server communication
4. **Demo Purpose:** Designed for demonstration and testing purposes

## 🐛 Troubleshooting

### If the app doesn't start:
1. Make sure you're in the correct directory
2. Run `npm install` to install dependencies
3. Check that Node.js is installed (version 14 or higher)

### If data seems incorrect:
1. Clear browser localStorage: `localStorage.clear()`
2. Refresh the page to reinitialize mock data

### If components don't load:
1. Check browser console for errors
2. Ensure all dependencies are installed
3. Try clearing browser cache

## 📱 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🎯 Next Steps

To extend this system:
1. Add more user roles
2. Implement additional features
3. Connect to a real backend
4. Add more sophisticated reporting
5. Implement real-time notifications

---

**Enjoy testing the Airport Vendor Management System!** 🛫 