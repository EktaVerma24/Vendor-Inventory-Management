import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getVendorById,
  getCashiersByShopId,
  getInventoryByShopId,
  getTransactionsByShopId
} from '../../utils/mockData';
import {
  UsersIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  DocumentTextIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const AirportAuthorityDashboard = () => {
  const [stats, setStats] = useState({
    totalVendors: 0,
    totalShops: 0,
    totalRevenue: 0,
    activeCashiers: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Load all data from localStorage
    const allVendors = JSON.parse(localStorage.getItem('vendors') || '[]');
    const allShops = JSON.parse(localStorage.getItem('shops') || '[]');
    const allCashiers = JSON.parse(localStorage.getItem('cashiers') || '[]');
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const allApplications = JSON.parse(localStorage.getItem('vendor_applications') || '[]');

    // Calculate stats
    const totalRevenue = allTransactions.reduce((sum, txn) => sum + txn.total, 0);
    const activeCashiers = allCashiers.filter(c => c.status === 'active').length;
    const pendingApps = allApplications.filter(app => app.status === 'pending');

    setStats({
      totalVendors: allVendors.length,
      totalShops: allShops.length,
      totalRevenue,
      activeCashiers
    });

    // Load vendor details with their shops and revenue
    const vendorDetails = allVendors.map(vendor => {
      const vendorShops = allShops.filter(shop => shop.vendorId === vendor.id);
      const vendorTransactions = allTransactions.filter(txn => 
        vendorShops.some(shop => shop.id === txn.shopId)
      );
      const vendorRevenue = vendorTransactions.reduce((sum, txn) => sum + txn.total, 0);
      
      return {
        ...vendor,
        shops: vendorShops.length,
        revenue: vendorRevenue,
        lastActivity: vendorTransactions.length > 0 
          ? formatTimeAgo(new Date(vendorTransactions[0].timestamp))
          : 'No activity'
      };
    });

    setVendors(vendorDetails);
    setPendingApplications(pendingApps);

    // Generate recent activities
    const activities = [];
    
    // Add recent transactions
    allTransactions.slice(0, 3).forEach(txn => {
      activities.push({
        id: `txn_${txn.id}`,
        type: 'transaction',
        message: `New transaction at ${getShopName(txn.shopId)} - ${formatCurrency(txn.total)}`,
        time: formatTimeAgo(new Date(txn.timestamp)),
        status: 'success'
      });
    });

    // Add low stock alerts
    const allInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const lowStockItems = allInventory.filter(item => item.stock <= item.minStock);
    lowStockItems.slice(0, 2).forEach(item => {
      activities.push({
        id: `stock_${item.id}`,
        type: 'inventory',
        message: `Low stock alert for ${getShopName(item.shopId)} - ${item.name}`,
        time: 'Recently',
        status: 'warning'
      });
    });

    // Add pending applications
    pendingApps.slice(0, 2).forEach(app => {
      activities.push({
        id: `app_${app.id}`,
        type: 'vendor',
        message: `New vendor application - ${app.businessName}`,
        time: formatTimeAgo(new Date(app.submittedAt)),
        status: 'info'
      });
    });

    setRecentActivities(activities.sort((a, b) => {
      // Sort by time (most recent first)
      if (a.time.includes('minutes') && b.time.includes('hours')) return -1;
      if (a.time.includes('hours') && b.time.includes('minutes')) return 1;
      return 0;
    }));
  };

  const getShopName = (shopId) => {
    const shops = JSON.parse(localStorage.getItem('shops') || '[]');
    const shop = shops.find(s => s.id === shopId);
    return shop ? shop.name : 'Unknown Shop';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Airport Authority Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor all vendors, shops, and activities across the airport
            </p>
            <p className="mt-1 text-sm text-gray-400">
              System Overview and Management
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              System Active
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Vendors</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalVendors}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingStorefrontIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Shops</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalShops}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.totalRevenue)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Cashiers</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activeCashiers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Applications Alert */}
      {pendingApplications.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              <h3 className="ml-2 text-sm font-medium text-yellow-800">
                Pending Vendor Applications
              </h3>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {pendingApplications.length} pending
            </span>
          </div>
          <div className="mt-2 text-sm text-yellow-700">
            <p>You have {pendingApplications.length} vendor application(s) waiting for review.</p>
            <Link
              to="/vendor-approvals"
              className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
            >
              Review Applications
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activities
            </h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="text-center py-8">
                  <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activities</h3>
                  <p className="mt-1 text-sm text-gray-500">Activities will appear here as they occur.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vendor Management */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Vendor Overview
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {vendors.length} vendors
              </span>
            </div>
            <div className="space-y-4">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{vendor.name}</h4>
                      <p className="text-sm text-gray-500">
                        {vendor.shops} shops • {formatCurrency(vendor.revenue)} revenue
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Last activity: {vendor.lastActivity}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vendor.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {vendor.status}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {vendors.length === 0 && (
                <div className="text-center py-8">
                  <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Vendors will appear here once they register.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/reports"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Generate Report
            </Link>
            <Link
              to="/vendor-approvals"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <UsersIcon className="h-4 w-4 mr-2" />
              Vendor Approvals
            </Link>
            <Link
              to="/reports"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <BuildingStorefrontIcon className="h-4 w-4 mr-2" />
              Monitor Shops
            </Link>
            <Link
              to="/settings"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <CogIcon className="h-4 w-4 mr-2" />
              System Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirportAuthorityDashboard; 