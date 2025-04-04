import api from './api';

const ShiftService = {
  // Get all shifts
  getAllShifts: async (filters = {}) => {
    try {
      const response = await api.get('/shifts', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در دریافت اطلاعات شیفت‌ها' };
    }
  },

  // Get shift by ID
  getShiftById: async (id) => {
    try {
      const response = await api.get(`/shifts/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در دریافت اطلاعات شیفت' };
    }
  },

  // Create new shift
  createShift: async (shiftData) => {
    try {
      const response = await api.post('/shifts', shiftData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در ایجاد شیفت جدید' };
    }
  },

  // Update shift
  updateShift: async (id, shiftData) => {
    try {
      const response = await api.put(`/shifts/${id}`, shiftData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در به‌روزرسانی اطلاعات شیفت' };
    }
  },

  // Delete shift
  deleteShift: async (id) => {
    try {
      const response = await api.delete(`/shifts/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در حذف شیفت' };
    }
  },

  // Generate weekly shifts
  generateWeeklyShifts: async (weekData) => {
    try {
      const response = await api.post('/shifts/generate-shifts', weekData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در تولید شیفت‌های هفتگی' };
    }
  },

  // Get shifts by guard
  getShiftsByGuard: async (guardId) => {
    try {
      const response = await api.get(`/shifts/guard/${guardId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در دریافت شیفت‌های نگهبان' };
    }
  },

  // Get shifts by area
  getShiftsByArea: async (areaId) => {
    try {
      const response = await api.get(`/shifts/area/${areaId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در دریافت شیفت‌های منطقه' };
    }
  }
};

export default ShiftService; 