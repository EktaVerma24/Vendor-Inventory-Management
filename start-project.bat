@echo off
echo Starting Airport Vendor Management System...
echo.

echo Step 1: Installing dependencies...
cd server
call npm install
cd ..

echo.
echo Step 2: Installing frontend dependencies...
call npm install

echo.
echo Step 3: Populating MongoDB with demo data...
cd server
call node populate-demo-data.js
cd ..

echo.
echo Step 4: Starting the backend server...
start "Backend Server" cmd /k "cd server && npm run dev"

echo.
echo Step 5: Starting the frontend development server...
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo 🎉 Project started successfully!
echo ========================================
echo.
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:5000
echo.
echo 🔑 Demo Login Credentials:
echo    Admin: admin@airport.com / admin123
echo    Vendor: vendor@example.com / vendor123
echo    Cashier: cashier@shop1.com / cashier123
echo.
echo 📧 Email Configuration:
echo    Update server/.env with your email credentials
echo    EMAIL_USER=your-email@gmail.com
echo    EMAIL_PASS=your-app-password
echo.
echo Press any key to exit...
pause > nul 