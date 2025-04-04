import api from './api';

const AuthService = {
  // Login user and return token
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('authUser', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Logout user and remove token from storage
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  },
  
  // Register a new user (only used by admins)
  register: async (userData) => {
    try {
      return await api.post('/auth/register', userData);
    } catch (error) {
      throw error;
    }
  },
  
  // Verify if token is valid
  verifyToken: async () => {
    try {
      return await api.get('/auth/verify');
    } catch (error) {
      throw error;
    }
  },
  
  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      return await api.post('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
    } catch (error) {
      throw error;
    }
  },
  
  // Get current user from local storage
  getCurrentUser: () => {
    const user = localStorage.getItem('authUser');
    return user ? JSON.parse(user) : null;
  },
  
  // Check if the user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در برقراری ارتباط با سرور' };
    }
  },
};

export default AuthService; 