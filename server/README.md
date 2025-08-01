# Airport Vendor Management System - Backend API

This is the backend API server for the Airport Vendor Management System, built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication for multiple user roles (Admin, Vendor, Cashier)
- **Vendor Management**: Complete vendor application and approval workflow
- **Shop Management**: Location-based shop management for vendors
- **Cashier Management**: Cashier creation and shop assignment
- **Inventory Management**: Real-time inventory tracking with low stock alerts
- **Transaction Processing**: Complete POS system with transaction history
- **Reporting**: Comprehensive reporting and analytics

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the server directory with:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/airport-vendor-system
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

3. **Start MongoDB**:
   Make sure MongoDB is running on your system.

4. **Setup database**:
   ```bash
   node setup.js
   ```

5. **Start the server**:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login for all user types
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/register-admin` - Register admin user

### Vendor Applications
- `POST /api/vendor-applications/submit` - Submit vendor application
- `GET /api/vendor-applications` - Get all applications (admin)
- `GET /api/vendor-applications/:id` - Get application by ID
- `PATCH /api/vendor-applications/:id/status` - Update application status
- `GET /api/vendor-applications/status/:status` - Get applications by status
- `GET /api/vendor-applications/check/:email` - Check application status

### Shops
- `GET /api/shops` - Get all shops (admin)
- `GET /api/shops/vendor/:vendorId` - Get shops by vendor
- `POST /api/shops` - Create new shop
- `PUT /api/shops/:id` - Update shop
- `DELETE /api/shops/:id` - Delete shop
- `PATCH /api/shops/:id/stats` - Update shop statistics

### Cashiers
- `GET /api/cashiers` - Get all cashiers (admin)
- `GET /api/cashiers/vendor/:vendorId` - Get cashiers by vendor
- `GET /api/cashiers/shop/:shopId` - Get cashiers by shop
- `POST /api/cashiers` - Create new cashier
- `PUT /api/cashiers/:id` - Update cashier
- `DELETE /api/cashiers/:id` - Delete cashier
- `PATCH /api/cashiers/:id/assign-shop` - Assign cashier to shop
- `PATCH /api/cashiers/:id/status` - Update cashier status

### Inventory
- `GET /api/inventory` - Get all inventory (admin)
- `GET /api/inventory/shop/:shopId` - Get inventory by shop
- `GET /api/inventory/vendor/:vendorId` - Get inventory by vendor
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item
- `PATCH /api/inventory/:id/stock` - Update stock quantity
- `GET /api/inventory/shop/:shopId/low-stock` - Get low stock items
- `POST /api/inventory/bulk-update` - Bulk update inventory

### Transactions
- `GET /api/transactions` - Get all transactions (admin)
- `GET /api/transactions/shop/:shopId` - Get transactions by shop
- `GET /api/transactions/vendor/:vendorId` - Get transactions by vendor
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/stats/shop/:shopId` - Get shop transaction stats
- `GET /api/transactions/stats/vendor/:vendorId` - Get vendor transaction stats
- `PATCH /api/transactions/:id/status` - Update transaction status

## Database Models

### User
- Admin and Airport Authority users
- Role-based permissions

### VendorApplication
- Complete vendor application data
- Status tracking (pending, approved, rejected)

### Vendor
- Approved vendor accounts
- Business information and permissions

### Shop
- Location-based shop management
- Vendor relationships and statistics

### Cashier
- Cashier accounts with shop assignments
- Login credentials and permissions

### Inventory
- Product management with stock tracking
- Low stock alerts and categories

### Transaction
- Complete transaction records
- Item details and payment information

## Default Admin Credentials

After running `node setup.js`:
- **Email**: admin@airport.com
- **Password**: admin123

## Development

The server uses nodemon for development, which automatically restarts when files change.

## Production

For production deployment:
1. Set `NODE_ENV=production`
2. Use a strong JWT_SECRET
3. Configure MongoDB connection string for production
4. Set up proper CORS settings
5. Use environment variables for sensitive data

## Error Handling

All API endpoints include proper error handling with meaningful error messages and appropriate HTTP status codes.

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration 