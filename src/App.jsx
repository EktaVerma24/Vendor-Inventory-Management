import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/auth/Login';
import VendorSignup from './components/auth/VendorSignup';
import AdminSignup from './components/auth/AdminSignup';
import AirportAuthorityDashboard from './components/dashboards/AirportAuthorityDashboard';
import VendorApprovalDashboard from './components/admin/VendorApprovalDashboard';
import VendorDashboard from './components/dashboards/VendorDashboard';
import CashierDashboard from './components/dashboards/CashierDashboard';
import Layout from './components/layout/Layout';
import InventoryManagement from './components/inventory/InventoryManagement';
import BillingSystem from './components/billing/BillingSystem';
import Reports from './components/reports/Reports';
import Settings from './components/settings/Settings';
import CashierManagement from './components/vendor/CashierManagement';
import ShopManagement from './components/vendor/ShopManagement';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

function AppRoutes() {
  console.log('AppRoutes rendering');
  const { user, loading } = useAuth();

  console.log('AppRoutes - loading:', loading, 'user:', user);
  
  if (loading) {
    console.log('Showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('Showing login screen');
    return <Login />;
  }

  const getDashboard = () => {
    switch (user.role) {
      case 'airport_authority':
        return <AirportAuthorityDashboard />;
      case 'vendor':
        return <VendorDashboard />;
      case 'cashier':
        return <CashierDashboard />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={getDashboard()} />
        <Route path="/dashboard" element={getDashboard()} />
        
        {/* Admin Routes */}
        {user.role === 'airport_authority' && (
          <Route path="/vendor-approvals" element={<VendorApprovalDashboard />} />
        )}
        
        {/* Vendor Routes */}
        {user.role === 'vendor' && (
          <>
            <Route path="/shop-management" element={<ShopManagement />} />
            <Route path="/cashier-management" element={<CashierManagement />} />
            <Route path="/inventory" element={<InventoryManagement />} />
            <Route path="/billing" element={<BillingSystem />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </>
        )}
        
        {/* Cashier Routes */}
        {user.role === 'cashier' && (
          <>
            <Route path="/inventory" element={<InventoryManagement />} />
            <Route path="/billing" element={<BillingSystem />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </>
        )}
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  console.log('App component rendering');
  
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/vendor-signup" element={<VendorSignup />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
