@echo off
echo ========================================
echo Airport Vendor Management System
echo Testing Setup Script
echo ========================================

echo.
echo Step 1: Installing frontend dependencies...
cd /d "%~dp0"
call npm install

echo.
echo Step 2: Installing backend dependencies...
cd server
call npm install

echo.
echo Step 3: Setting up environment variables...
if not exist .env (
    echo PORT=5000 > .env
    echo MONGO_URI=mongodb://localhost:27017/airport-vendor-system >> .env
    echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production >> .env
    echo NODE_ENV=development >> .env
    echo Environment file created successfully!
) else (
    echo Environment file already exists.
)

echo.
echo Step 4: Initializing database...
node setup.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Start the backend server: cd server && npm run dev
echo 3. Start the frontend: npm run dev
echo 4. Open http://localhost:5173 in your browser
echo.
echo Default Admin Login:
echo Email: admin@airport.com
echo Password: admin123
echo.
pause 