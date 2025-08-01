import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  CreditCardIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  DocumentTextIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  BellIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const CashierDashboard = () => {
  const { user } = useAuth();
  const [currentSale, setCurrentSale] = useState({
    items: [],
    total: 0,
    tax: 0,
    finalTotal: 0
  });

  const [inventory, setInventory] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [activeCashiers, setActiveCashiers] = useState([]);
  const [shopInfo, setShopInfo] = useState(null);
  const [stats, setStats] = useState({
    todaySales: 0,
    todayTransactions: 0,
    itemsSold: 0,
    lowStockItems: 0
  });

  useEffect(() => {
    loadShopData();
    loadInventory();
    loadTransactions();
    loadActiveCashiers();
    loadStockAlerts();
    
    // Set up real-time updates (simulated)
    const interval = setInterval(() => {
      loadActiveCashiers();
      loadStockAlerts();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadShopData = () => {
    // Load shop information from localStorage
    const shops = JSON.parse(localStorage.getItem('shops') || '[]');
    const userShop = shops.find(shop => shop.id === user.shopId);
    setShopInfo(userShop);
  };

  const loadInventory = () => {
    // Load inventory specific to this shop
    const allInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const shopInventory = allInventory.filter(item => item.shopId === user.shopId);
    
    if (shopInventory.length === 0) {
      // Initialize with mock data if no inventory exists
      const mockInventory = [
        { id: 1, name: 'Coffee', price: 3.50, stock: 50, category: 'Beverages', shopId: user.shopId, minStock: 10 },
        { id: 2, name: 'Sandwich', price: 8.99, stock: 25, category: 'Food', shopId: user.shopId, minStock: 15 },
        { id: 3, name: 'Chips', price: 2.50, stock: 100, category: 'Snacks', shopId: user.shopId, minStock: 20 },
        { id: 4, name: 'Water', price: 1.99, stock: 75, category: 'Beverages', shopId: user.shopId, minStock: 25 },
        { id: 5, name: 'Cookie', price: 1.50, stock: 40, category: 'Snacks', shopId: user.shopId, minStock: 10 },
        { id: 6, name: 'Tea', price: 2.99, stock: 30, category: 'Beverages', shopId: user.shopId, minStock: 15 }
      ];
      localStorage.setItem('inventory', JSON.stringify(mockInventory));
      setInventory(mockInventory);
    } else {
      setInventory(shopInventory);
    }
  };

  const loadTransactions = () => {
    // Load transactions for this shop
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const shopTransactions = allTransactions
      .filter(t => t.shopId === user.shopId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
    
    setRecentTransactions(shopTransactions);
  };

  const loadActiveCashiers = () => {
    // Load active cashiers for this shop
    const allCashiers = JSON.parse(localStorage.getItem('cashiers') || '[]');
    const shopCashiers = allCashiers.filter(cashier => 
      cashier.shopId === user.shopId && cashier.status === 'active'
    );
    setActiveCashiers(shopCashiers);
  };

  const loadStockAlerts = () => {
    const alerts = inventory.filter(item => item.stock <= item.minStock);
    setStockAlerts(alerts);
    setStats(prev => ({ ...prev, lowStockItems: alerts.length }));
  };

  const addToSale = (item) => {
    if (item.stock <= 0) return;
    
    const existingItem = currentSale.items.find(i => i.id === item.id);
    
    if (existingItem) {
      setCurrentSale(prev => ({
        ...prev,
        items: prev.items.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
            : i
        )
      }));
    } else {
      setCurrentSale(prev => ({
        ...prev,
        items: [...prev.items, { ...item, quantity: 1, total: item.price }]
      }));
    }
    
    updateTotals();
  };

  const removeFromSale = (itemId) => {
    setCurrentSale(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
    updateTotals();
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromSale(itemId);
      return;
    }

    const item = inventory.find(i => i.id === itemId);
    if (newQuantity > item.stock) {
      alert(`Only ${item.stock} items available in stock`);
      return;
    }

    setCurrentSale(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      )
    }));
    updateTotals();
  };

  const updateTotals = () => {
    const subtotal = currentSale.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.08; // 8% tax
    const finalTotal = subtotal + tax;

    setCurrentSale(prev => ({
      ...prev,
      total: subtotal,
      tax: tax,
      finalTotal: finalTotal
    }));
  };

  const processPayment = async () => {
    if (currentSale.items.length === 0) return;

    try {
      // Create transaction record
      const transaction = {
        id: `txn_${Date.now()}`,
        shopId: user.shopId,
        cashierId: user.id,
        cashierName: user.name,
        items: currentSale.items,
        subtotal: currentSale.total,
        tax: currentSale.tax,
        total: currentSale.finalTotal,
        timestamp: new Date().toISOString(),
        status: 'completed',
        paymentMethod: 'cash' // Could be made configurable
      };

      // Save transaction
      const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      allTransactions.push(transaction);
      localStorage.setItem('transactions', JSON.stringify(allTransactions));

      // Update inventory stock
      const updatedInventory = inventory.map(item => {
        const saleItem = currentSale.items.find(si => si.id === item.id);
        if (saleItem) {
          return { ...item, stock: item.stock - saleItem.quantity };
        }
        return item;
      });

      // Save updated inventory
      const allInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
      const updatedAllInventory = allInventory.map(item => {
        const updatedItem = updatedInventory.find(ui => ui.id === item.id);
        return updatedItem || item;
      });
      localStorage.setItem('inventory', JSON.stringify(updatedAllInventory));

      // Update local state
      setInventory(updatedInventory);
      setRecentTransactions(prev => [transaction, ...prev.slice(0, 9)]);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        todaySales: prev.todaySales + transaction.total,
        todayTransactions: prev.todayTransactions + 1,
        itemsSold: prev.itemsSold + currentSale.items.reduce((sum, item) => sum + item.quantity, 0)
      }));

      // Reset current sale
      setCurrentSale({
        items: [],
        total: 0,
        tax: 0,
        finalTotal: 0
      });

      // Reload stock alerts
      loadStockAlerts();

      alert('Payment processed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStockStatusColor = (item) => {
    if (item.stock === 0) return 'bg-red-100 text-red-800';
    if (item.stock <= item.minStock) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      {/* Header with Shop Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Cashier Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome, {user?.name}. Processing transactions at {shopInfo?.name || 'Your Shop'}.
            </p>
            {shopInfo && (
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {shopInfo.location}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <UserGroupIcon className="h-4 w-4 mr-1" />
              {activeCashiers.length} active cashiers
            </div>
            <button
              onClick={() => {
                loadInventory();
                loadTransactions();
                loadActiveCashiers();
                loadStockAlerts();
              }}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Today's Sales</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.todaySales)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Transactions</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.todayTransactions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CubeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Items Sold</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.itemsSold}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Alerts</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.lowStockItems}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      {stockAlerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <h3 className="ml-2 text-sm font-medium text-yellow-800">Low Stock Alerts</h3>
          </div>
          <div className="mt-2 text-sm text-yellow-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {stockAlerts.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <span>{item.name}</span>
                  <span className="font-medium">{item.stock} left</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main POS Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory/Product Selection */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Products
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {inventory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToSale(item)}
                  disabled={item.stock <= 0}
                  className="p-3 border border-gray-200 rounded-lg text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed relative"
                >
                  <div className="font-medium text-sm text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{formatCurrency(item.price)}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">Stock: {item.stock}</div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(item)}`}>
                      {item.stock === 0 ? 'Out of Stock' : item.stock <= item.minStock ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Sale */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Current Sale
            </h3>
            
            {/* Sale Items */}
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {currentSale.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-sm text-gray-500">{formatCurrency(item.price)} each</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium w-16 text-right">
                      {formatCurrency(item.total)}
                    </span>
                    <button
                      onClick={() => removeFromSale(item.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {currentSale.items.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No items in current sale
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(currentSale.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (8%):</span>
                <span>{formatCurrency(currentSale.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-medium border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(currentSale.finalTotal)}</span>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={processPayment}
              disabled={currentSale.items.length === 0}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <DocumentTextIcon className="h-5 w-5" />
              <span>Process Payment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions and Active Cashiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Transactions
            </h3>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.items.length} items sold
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.timestamp).toLocaleTimeString()} • {transaction.cashierName}
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
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent transactions
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Active Cashiers */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Active Cashiers
            </h3>
            <div className="space-y-3">
              {activeCashiers.map((cashier) => (
                <div key={cashier.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {cashier.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cashier.name}</p>
                      <p className="text-xs text-gray-500">{cashier.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                    {cashier.id === user.id && (
                      <span className="text-xs text-blue-600 font-medium">You</span>
                    )}
                  </div>
                </div>
              ))}
              {activeCashiers.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No active cashiers
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard; 