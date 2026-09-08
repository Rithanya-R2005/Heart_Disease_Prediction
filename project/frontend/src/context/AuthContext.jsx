import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return { success: true };
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';

      if (error.response) {
        const status = error.response.status;
        const detail = error.response.data?.detail;

        if (status === 401) {
          errorMessage = typeof detail === 'string' ? detail : 'Invalid email or password.';
        } else if (status === 422) {
          if (Array.isArray(detail)) {
            const firstError = detail[0];
            const field = firstError?.loc?.[firstError.loc.length - 1] || 'field';
            const msg = firstError?.msg || 'is invalid';
            errorMessage = `Validation error: ${field} ${msg}.`;
          } else if (typeof detail === 'string') {
            errorMessage = detail;
          } else {
            errorMessage = 'Please enter a valid email and password.';
          }
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        }
      } else if (error.request) {
        errorMessage = 'Cannot connect to the server. Please make sure the backend is running.';
      }

      return { success: false, error: errorMessage };
    }
  };

  const signup = async (userData) => {
    try {
      await authAPI.signup(userData);
      return { success: true };
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';

      if (error.response) {
        const status = error.response.status;
        const detail = error.response.data?.detail;

        if (status === 400) {
          // Check for duplicate email
          if (
            typeof detail === 'string' &&
            detail.toLowerCase().includes('email already registered')
          ) {
            errorMessage = 'An account with this email already exists.';
          } else if (typeof detail === 'string') {
            errorMessage = detail;
          } else {
            errorMessage = 'Invalid registration data. Please check your inputs.';
          }
        } else if (status === 422) {
          // Pydantic validation error — extract the first meaningful message
          if (Array.isArray(detail)) {
            const firstError = detail[0];
            const field = firstError?.loc?.[firstError.loc.length - 1] || 'field';
            const msg = firstError?.msg || 'is invalid';
            errorMessage = `Validation error: ${field} ${msg}.`;
          } else if (typeof detail === 'string') {
            errorMessage = detail;
          } else {
            errorMessage = 'Please check all fields and try again.';
          }
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        errorMessage = 'Cannot connect to the server. Please make sure the backend is running.';
      }

      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return !!token;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
