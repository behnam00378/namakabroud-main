import api from './api';

const AreaService = {
  // Get all areas
  getAllAreas: async () => {
    try {
      const response = await api.get('/areas');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در دریافت اطلاعات مناطق' };
    }
  },

  // Get area by ID
  getAreaById: async (id) => {
    try {
      const response = await api.get(`/areas/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در دریافت اطلاعات منطقه' };
    }
  },

  // Create new area
  createArea: async (areaData) => {
    try {
      const response = await api.post('/areas', areaData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در ایجاد منطقه جدید' };
    }
  },

  // Update area
  updateArea: async (id, areaData) => {
    try {
      const response = await api.put(`/areas/${id}`, areaData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در به‌روزرسانی اطلاعات منطقه' };
    }
  },

  // Delete area
  deleteArea: async (id) => {
    try {
      const response = await api.delete(`/areas/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در حذف منطقه' };
    }
  }
};

export default AreaService; 