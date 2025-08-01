import { useState, useEffect } from 'react';
import {
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingStorefrontIcon,
  KeyIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { vendorApplicationAPI } from '../../services/api';

const VendorApprovalDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [emailConfigLoading, setEmailConfigLoading] = useState(false);

  useEffect(() => {
    loadApplications();
    loadAdminEmail();
  }, []);

  const loadAdminEmail = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/email-config');
      const data = await response.json();
      setAdminEmail(data.email);
    } catch (error) {
      console.error('Error loading admin email:', error);
    }
  };

  const updateAdminEmail = async (email) => {
    setEmailConfigLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/email-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setAdminEmail(email);
        setShowEmailConfig(false);
        alert('Admin email updated successfully!');
      } else {
        throw new Error('Failed to update email');
      }
    } catch (error) {
      console.error('Error updating admin email:', error);
      alert('Failed to update admin email. Please try again.');
    } finally {
      setEmailConfigLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const response = await vendorApplicationAPI.getAll();
      setApplications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading applications:', error);
      setLoading(false);
    }
  };

  const handleApproval = async (applicationId, status, reason = '') => {
    try {
      // Update application status in MongoDB
      const response = await vendorApplicationAPI.updateStatus(applicationId, status, 'admin@airport.com', reason);
      
      if (response.data.success) {
        // Reload applications to get updated data
        await loadApplications();
        
        // If approved, show generated credentials
        if (status === 'approved' && response.data.vendor) {
          setGeneratedCredentials({
            email: response.data.vendor.email,
            password: response.data.vendor.password
          });
          
          // Show success message with email info
          alert(`Application approved successfully!\n\nVendor account created and approval email sent to: ${response.data.vendor.email}\n\nGenerated credentials:\nEmail: ${response.data.vendor.email}\nPassword: ${response.data.vendor.password}`);
        } else if (status === 'rejected') {
          alert(`Application rejected successfully!\n\nRejection email sent to: ${selectedApplication.email}`);
        }
        
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Error processing application. Please try again.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Vendor Approval Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage vendor applications. Approved vendors will receive automated login credentials via email.
          </p>
        </div>
        
        {/* Email Configuration Button */}
        <button
          onClick={() => setShowEmailConfig(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <EnvelopeIcon className="h-4 w-4 mr-2" />
          Configure Email
        </button>
      </div>

      {/* Email Configuration Modal */}
      {showEmailConfig && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Configure Admin Email
                </h3>
                <button
                  onClick={() => setShowEmailConfig(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="admin@airport.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This email will be used to send approval/rejection emails to vendors.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Email Configuration Required
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>To send automated emails, you need to:</p>
                        <ol className="list-decimal list-inside mt-1">
                          <li>Update server/.env with EMAIL_USER and EMAIL_PASS</li>
                          <li>Use Gmail App Password for security</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowEmailConfig(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateAdminEmail(adminEmail)}
                    disabled={emailConfigLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {emailConfigLoading ? 'Updating...' : 'Update Email'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Credentials Alert */}
      {generatedCredentials && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <KeyIcon className="h-5 w-5 text-green-400" />
              <h3 className="ml-2 text-sm font-medium text-green-800">
                Vendor Account Created Successfully!
              </h3>
            </div>
            <button
              onClick={() => setGeneratedCredentials(null)}
              className="text-green-400 hover:text-green-600"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2 text-sm text-green-700">
            <p className="font-medium">Generated Login Credentials:</p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <span>Email:</span>
                <div className="flex items-center space-x-2">
                  <code className="bg-green-100 px-2 py-1 rounded text-xs">{generatedCredentials.email}</code>
                  <button
                    onClick={() => copyToClipboard(generatedCredentials.email)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Password:</span>
                <div className="flex items-center space-x-2">
                  <code className="bg-green-100 px-2 py-1 rounded text-xs">{generatedCredentials.password}</code>
                  <button
                    onClick={() => copyToClipboard(generatedCredentials.password)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs">
              ⚠️ Please share these credentials securely with the vendor. They can change their password after first login.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pending}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.approved}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.rejected}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Applications
            </h3>
            <div className="flex space-x-2">
              {['all', 'pending', 'approved', 'rejected'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    filter === filterOption
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' ? 'No applications found.' : `No ${filter} applications found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div
                  key={application.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedApplication(application)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(application.status)}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {application.businessName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {application.contactPerson} • {application.businessType}
                        </p>
                        <p className="text-xs text-gray-400">
                          Applied: {new Date(application.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Application Details
                </h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Business Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
                    Business Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.businessName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Type</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.businessType}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.contactPerson}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Location & Business Details */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    Location & Business Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Preferred Location</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.preferredLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Application Status */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Application Status</h4>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedApplication.status)}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedApplication.status)}`}>
                      {selectedApplication.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Application ID: {selectedApplication.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(selectedApplication.submittedAt).toLocaleString()}
                  </p>
                </div>

                {/* Action Buttons */}
                {selectedApplication.status === 'pending' && (
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        const reason = prompt('Please provide a reason for rejection (optional):');
                        handleApproval(selectedApplication.id, 'rejected', reason);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleApproval(selectedApplication.id, 'approved')}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                    >
                      Approve & Send Email
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorApprovalDashboard; 