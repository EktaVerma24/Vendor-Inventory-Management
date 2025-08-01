import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getShopById, 
  getCashiersByShopId, 
  getInventoryByShopId, 
  getTransactionsByShopId 
} from '../../utils/mockData';
import {
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  CubeIcon,
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalShops: 0,
    totalRevenue: 0,
    totalItems: 0,
    activeCashiers: 0
  });

  const [shops, setShops] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = () => {
    // Load shops for this vendor
    const allShops = JSON.parse(localStorage.getItem('shops') || '[]');
    const vendorShops = allShops.filter(shop => shop.vendorId === user.vendorId);
    
    // Calculate stats
    let totalRevenue = 0;
    let totalItems = 0;
    let totalCashiers = 0;
    const allLowStockItems = [];

    vendorShops.forEach(shop => {
      // Get shop transactions
      const shopTransactions = getTransactionsByShopId(shop.id);
      const shopRevenue = shopTransactions.reduce((sum, txn) => sum + txn.total, 0);
      totalRevenue += shopRevenue;

      // Get shop inventory
      const shopInventory = getInventoryByShopId(shop.id);
      const shopItems = shopInventory.reduce((sum, item) => sum + item.stock, 0);
      totalItems += shopItems;

      // Get low stock items
      const lowStock = shopInventory.filter(item => item.stock <= item.minStock);
      lowStock.forEach(item => {
        allLowStockItems.push({
          ...item,
          shopName: shop.name
        });
      });

      // Get shop cashiers
      const shopCashiers = getCashiersByShopId(shop.id);
      totalCashiers += shopCashiers.filter(c => c.status === 'active').length;
    });

    // Get recent transactions across all shops
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const vendorTransactions = allTransactions
      .filter(txn => vendorShops.some(shop => shop.id === txn.shopId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    setShops(vendorShops);
    setRecentTransactions(vendorTransactions);
    setLowStockItems(allLowStockItems);
    setStats({
      totalShops: vendorShops.length,
      totalRevenue,
      totalItems,
      activeCashiers: totalCashiers
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStockStatusColor = (item) => {
    if (item.stock === 0) return 'bg-red-100 text-red-800';
    if (item.stock <= item.minStock) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Vendor Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user?.name}. Manage your shops and monitor performance.
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Business: {user?.businessName}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Active Vendor
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
                <BuildingStorefrontIcon className="h-6 w-6 text-blue-500" />
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
                <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
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
                <CubeIcon className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Items</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalItems}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-indigo-500" />
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shop Management */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your Shops
              </h3>
              <Link
                to="/shop-management"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Manage
              </Link>
            </div>
            <div className="space-y-4">
              {shops.map((shop) => {
                const shopCashiers = getCashiersByShopId(shop.id);
                const shopInventory = getInventoryByShopId(shop.id);
                const shopTransactions = getTransactionsByShopId(shop.id);
                const shopRevenue = shopTransactions.reduce((sum, txn) => sum + txn.total, 0);
                const shopItems = shopInventory.reduce((sum, item) => sum + item.stock, 0);
                
                return (
                  <div key={shop.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{shop.name}</h4>
                        <p className="text-sm text-gray-500">{shop.location}</p>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                            {formatCurrency(shopRevenue)} revenue
                          </span>
                          <span className="flex items-center">
                            <UsersIcon className="h-3 w-3 mr-1" />
                            {shopCashiers.length} cashiers
                          </span>
                          <span className="flex items-center">
                            <CubeIcon className="h-3 w-3 mr-1" />
                            {shopItems} items
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          shop.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {shop.status}
                        </span>
                        <Link
                          to={`/shop-management?shop=${shop.id}`}
                          className="text-blue-600 hover:text-blue-500 text-sm font-medium flex items-center"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
              {shops.length === 0 && (
                <div className="text-center py-8">
                  <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No shops yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding your first shop.</p>
                  <div className="mt-6">
                    <Link
                      to="/shop-management"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Shop
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Transactions
            </h3>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.items.length} items sold
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.cashierName} • {formatDate(transaction.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.total)}
                    </p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <div className="text-center py-8">
                  <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Transactions will appear here once sales are made.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Low Stock Alerts
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {lowStockItems.length} items
              </span>
            </div>
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={`${item.shopName}-${item.id}`} className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.shopName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(item)}`}>
                      {item.stock} / {item.minStock}
                    </span>
                    <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                      Reorder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/shop-management"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <BuildingStorefrontIcon className="h-4 w-4 mr-2" />
              Manage Shops
            </Link>
            <Link
              to="/inventory"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <CubeIcon className="h-4 w-4 mr-2" />
              Manage Inventory
            </Link>
            <Link
              to="/cashier-management"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <UsersIcon className="h-4 w-4 mr-2" />
              Manage Cashiers
            </Link>
            <Link
              to="/reports"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Generate Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard; 