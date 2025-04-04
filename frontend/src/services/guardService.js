import api from './api';

const GuardService = {
  // Get all guards
  getAllGuards: async () => {
    try {
      const response = await api.get('/guards');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در دریافت اطلاعات نگهبانان' };
    }
  },

  // Get guard by ID
  getGuardById: async (id) => {
    try {
      const response = await api.get(`/guards/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در دریافت اطلاعات نگهبان' };
    }
  },

  // Create new guard
  createGuard: async (guardData) => {
    try {
      const response = await api.post('/guards', guardData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در ایجاد نگهبان جدید' };
    }
  },

  // Update guard
  updateGuard: async (id, guardData) => {
    try {
      const response = await api.put(`/guards/${id}`, guardData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در به‌روزرسانی اطلاعات نگهبان' };
    }
  },

  // Delete guard
  deleteGuard: async (id) => {
    try {
      const response = await api.delete(`/guards/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در حذف نگهبان' };
    }
  }
};

export default GuardService; 