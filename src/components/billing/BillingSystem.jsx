import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  CreditCardIcon,
  BanknotesIcon,
  DocumentTextIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  MagnifyingGlassIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const BillingSystem = () => {
  const { user } = useAuth();
  const [currentTransaction, setCurrentTransaction] = useState({
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    paymentMethod: 'cash',
    change: 0,
    customerPayment: 0
  });

  const [products, setProducts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState(null);

  useEffect(() => {
    // Mock products data
    setProducts([
      { id: 1, name: 'Coffee', price: 3.50, category: 'Beverages' },
      { id: 2, name: 'Sandwich', price: 8.99, category: 'Food' },
      { id: 3, name: 'Chips', price: 2.50, category: 'Snacks' },
      { id: 4, name: 'Water', price: 1.99, category: 'Beverages' },
      { id: 5, name: 'Cookie', price: 1.50, category: 'Snacks' },
      { id: 6, name: 'Tea', price: 2.99, category: 'Beverages' },
      { id: 7, name: 'Phone Charger', price: 15.99, category: 'Electronics' },
      { id: 8, name: 'Souvenir Mug', price: 12.50, category: 'Gifts' }
    ]);

    setRecentTransactions([
      {
        id: 1,
        items: 3,
        total: 12.50,
        paymentMethod: 'card',
        time: '2 minutes ago',
        status: 'completed'
      },
      {
        id: 2,
        items: 2,
        total: 8.75,
        paymentMethod: 'cash',
        time: '5 minutes ago',
        status: 'completed'
      }
    ]);
  }, []);

  const addToTransaction = (product) => {
    const existingItem = currentTransaction.items.find(item => item.id === product.id);
    
    if (existingItem) {
      setCurrentTransaction(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        )
      }));
    } else {
      setCurrentTransaction(prev => ({
        ...prev,
        items: [...prev.items, { ...product, quantity: 1, total: product.price }]
      }));
    }
    
    updateTotals();
  };

  const removeFromTransaction = (productId) => {
    setCurrentTransaction(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== productId)
    }));
    updateTotals();
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromTransaction(productId);
      return;
    }

    setCurrentTransaction(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      )
    }));
    updateTotals();
  };

  const updateTotals = () => {
    const subtotal = currentTransaction.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    setCurrentTransaction(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setCurrentTransaction(prev => ({
      ...prev,
      paymentMethod: method,
      customerPayment: 0,
      change: 0
    }));
  };

  const handleCustomerPayment = (amount) => {
    const payment = parseFloat(amount) || 0;
    const change = payment - currentTransaction.total;
    
    setCurrentTransaction(prev => ({
      ...prev,
      customerPayment: payment,
      change: change > 0 ? change : 0
    }));
  };

  const processTransaction = () => {
    if (currentTransaction.items.length === 0) {
      alert('Please add items to the transaction');
      return;
    }

    if (currentTransaction.paymentMethod === 'cash' && currentTransaction.customerPayment < currentTransaction.total) {
      alert('Customer payment must be greater than or equal to the total');
      return;
    }

    const transaction = {
      id: Date.now(),
      items: currentTransaction.items,
      subtotal: currentTransaction.subtotal,
      tax: currentTransaction.tax,
      total: currentTransaction.total,
      paymentMethod: currentTransaction.paymentMethod,
      customerPayment: currentTransaction.customerPayment,
      change: currentTransaction.change,
      cashier: user?.name,
      time: new Date().toLocaleString(),
      status: 'completed'
    };

    setCompletedTransaction(transaction);
    setRecentTransactions(prev => [transaction, ...prev]);
    setShowReceipt(true);

    // Reset current transaction
    setCurrentTransaction({
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      paymentMethod: 'cash',
      change: 0,
      customerPayment: 0
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Billing System</h1>
        <p className="mt-1 text-sm text-gray-500">
          Process transactions and generate receipts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Selection */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Products
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToTransaction(product)}
                  className="p-3 border border-gray-200 rounded-lg text-left hover:bg-gray-50"
                >
                  <div className="font-medium text-sm text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-500">{formatCurrency(product.price)}</div>
                  <div className="text-xs text-gray-400">{product.category}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Current Transaction
            </h3>
            
            {/* Transaction Items */}
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {currentTransaction.items.map((item) => (
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
                      onClick={() => removeFromTransaction(item.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {currentTransaction.items.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No items in transaction
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(currentTransaction.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (8%):</span>
                <span>{formatCurrency(currentTransaction.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-medium border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(currentTransaction.total)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <div className="flex space-x-4">
                <button
                  onClick={() => handlePaymentMethodChange('cash')}
                  className={`flex items-center px-3 py-2 border rounded-md text-sm ${
                    currentTransaction.paymentMethod === 'cash'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BanknotesIcon className="h-4 w-4 mr-2" />
                  Cash
                </button>
                <button
                  onClick={() => handlePaymentMethodChange('card')}
                  className={`flex items-center px-3 py-2 border rounded-md text-sm ${
                    currentTransaction.paymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Card
                </button>
              </div>
            </div>

            {/* Cash Payment Input */}
            {currentTransaction.paymentMethod === 'cash' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Payment</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentTransaction.customerPayment}
                  onChange={(e) => handleCustomerPayment(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount received"
                />
                {currentTransaction.customerPayment > 0 && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-500">Change: </span>
                    <span className="font-medium">{formatCurrency(currentTransaction.change)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Process Payment Button */}
            <button
              onClick={processTransaction}
              disabled={currentTransaction.items.length === 0}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <DocumentTextIcon className="h-5 w-5" />
              <span>Process Payment</span>
            </button>
          </div>
        </div>
      </div>

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
                      {transaction.items} items • {transaction.paymentMethod}
                    </p>
                    <p className="text-xs text-gray-500">{transaction.time}</p>
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
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && completedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Receipt</h3>
                <div className="text-sm text-gray-500 mb-4">
                  Airport Vendor System<br />
                  {completedTransaction.time}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {completedTransaction.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(completedTransaction.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>{formatCurrency(completedTransaction.tax)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatCurrency(completedTransaction.total)}</span>
                </div>
                {completedTransaction.paymentMethod === 'cash' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Payment:</span>
                      <span>{formatCurrency(completedTransaction.customerPayment)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Change:</span>
                      <span>{formatCurrency(completedTransaction.change)}</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowReceipt(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingSystem; 