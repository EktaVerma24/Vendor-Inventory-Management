import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  console.log('AuthProvider rendering');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data and token on app load
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('airport_vendor_user');
      
      if (token && storedUser) {
        try {
          // Verify token with backend
          const response = await authAPI.verifyToken();
          setUser(response.data.user);
        } catch (error) {
          console.error('Token verification failed:', error);
          // Clear invalid data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('airport_vendor_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    
    try {
      const response = await authAPI.login({ email, password });
      const { user: userData, token } = response.data;
      
      // Store token and user data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('airport_vendor_user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('airport_vendor_user');
  };

  const checkApplicationStatus = async (email) => {
    try {
      const response = await fetch(`http://localhost:5000/api/vendor-applications/check/${email}`);
      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Error checking application status:', error);
      return null;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkApplicationStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 