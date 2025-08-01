# Airport Vendor Management System

A comprehensive multi-tenant airport vendor management system with MongoDB backend, email notifications, and automated vendor approval workflow.

## 🚀 Features

### Core Functionality
- **Multi-Role Authentication**: Airport Authority/Admin, Vendor, Cashier
- **Vendor Application System**: Online application form with admin approval
- **Automated Email System**: Approval/rejection emails with login credentials
- **Shop Management**: Location-based shop management for vendors
- **Cashier Management**: Assign cashiers to specific shops
- **Inventory Management**: Stock tracking with low stock alerts
- **Point of Sale (POS)**: Complete billing system for cashiers
- **Reports & Analytics**: Comprehensive reporting system

### Technical Features
- **MongoDB Database**: Persistent data storage
- **Real-time Email Notifications**: Automated credential delivery
- **JWT Authentication**: Secure token-based authentication
- **Responsive UI**: Modern, mobile-friendly interface
- **Role-based Access Control**: Granular permissions system

## 🛠️ Technology Stack

### Frontend
- **React.js** - UI framework
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Heroicons** - Icon library
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Nodemailer** - Email service
- **bcryptjs** - Password hashing

## 📋 Prerequisites

Before running this project, make sure you have:

1. **Node.js** (v16 or higher)
2. **MongoDB** (v4.4 or higher)
3. **Git** (for cloning the repository)

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Internship-Project
   ```

2. **Run the automated setup script**
   ```bash
   start-project.bat
   ```

This script will:
- Install all dependencies
- Populate MongoDB with demo data
- Start both backend and frontend servers

### Option 2: Manual Setup

1. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd server
   npm install
   cd ..
   ```

2. **Configure environment variables**
   
   Create `server/.env` file:
   ```env
   MONGO_URI=mongodb://localhost:27017/airport_vendor_system
   PORT=5000
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

3. **Populate demo data**
   ```bash
   cd server
   node populate-demo-data.js
   cd ..
   ```

4. **Start the servers**
   ```bash
   # Start backend (in one terminal)
   cd server
   npm run dev
   
   # Start frontend (in another terminal)
   npm run dev
   ```

## 📧 Email Configuration

To enable email notifications for vendor approvals:

1. **Gmail Setup** (Recommended)
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password
   - Update `server/.env`:
     ```env
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASS=your-app-password
     ```

2. **Other Email Providers**
   - Update the email configuration in `server/utils/emailService.js`
   - Modify the transporter settings as needed

## 🔑 Demo Login Credentials

After running the setup, you can login with:

### Admin User
- **Email**: `admin@airport.com`
- **Password**: `admin123`
- **Role**: Airport Authority/Admin
- **Permissions**: Full system access, vendor approval

### Demo Vendor
- **Email**: `vendor@example.com`
- **Password**: `vendor123`
- **Role**: Vendor
- **Permissions**: Shop management, inventory, cashier management

### Demo Cashier
- **Email**: `cashier@shop1.com`
- **Password**: `cashier123`
- **Role**: Cashier
- **Permissions**: POS operations, inventory viewing

## 📱 Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Vendor Signup**: http://localhost:5173/vendor-signup

## 🔄 Workflow

### Vendor Application Process

1. **Vendor applies** via `/vendor-signup`
2. **Admin reviews** application in approval dashboard
3. **Admin approves/rejects** with comments
4. **System sends email** with login credentials (if approved)
5. **Vendor logs in** and sets up shops/cashiers
6. **Cashiers operate** location-specific POS systems

### Email Notifications

- **Approval Email**: Contains login credentials and next steps
- **Rejection Email**: Includes reason and reapplication instructions
- **Automated Delivery**: Sent immediately upon admin action

## 📊 Database Schema

### Collections
- **Users**: Admin/Authority accounts
- **VendorApplications**: Pending vendor applications
- **Vendors**: Approved vendor accounts
- **Shops**: Location-based shop data
- **Cashiers**: Shop-specific cashier accounts
- **Inventory**: Stock management
- **Transactions**: Sales records

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based sessions
- **Password Hashing**: bcryptjs for secure password storage
- **Role-based Access**: Granular permissions system
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Cross-origin request handling

## 📈 Features by Role

### Airport Authority/Admin
- View all vendor applications
- Approve/reject applications
- Monitor system-wide statistics
- Generate comprehensive reports
- Manage all vendors and shops

### Vendor
- Manage multiple shops
- Assign cashiers to shops
- Monitor inventory across locations
- View sales reports
- Manage business profile

### Cashier
- Process transactions (POS)
- View shop-specific inventory
- Generate receipts
- Monitor stock levels
- Handle customer interactions

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `server/.env`
   - Verify MongoDB installation

2. **Email Not Sending**
   - Check email credentials in `.env`
   - Verify Gmail App Password setup
   - Check network connectivity

3. **Frontend Not Loading**
   - Ensure backend is running on port 5000
   - Check CORS configuration
   - Verify API endpoints

4. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT token expiration
   - Verify user credentials in database

### Development Commands

```bash
# Reset database
cd server
node populate-demo-data.js

# Check server logs
cd server
npm run dev

# Check frontend logs
npm run dev

# Install new dependencies
npm install <package-name>
cd server && npm install <package-name>
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification

### Vendor Applications
- `POST /api/vendor-applications/submit` - Submit application
- `GET /api/vendor-applications` - Get all applications
- `PATCH /api/vendor-applications/:id/status` - Update status

### Shops
- `GET /api/shops` - Get all shops
- `POST /api/shops` - Create shop
- `PUT /api/shops/:id` - Update shop

### Cashiers
- `GET /api/cashiers` - Get all cashiers
- `POST /api/cashiers` - Create cashier
- `PATCH /api/cashiers/:id/assign` - Assign to shop

### Inventory
- `GET /api/inventory` - Get all inventory
- `POST /api/inventory` - Create inventory item
- `PATCH /api/inventory/:id/stock` - Update stock

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/stats/:shopId` - Get statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Note**: This is a comprehensive airport vendor management system designed for real-world deployment. The email system requires proper configuration for production use.
