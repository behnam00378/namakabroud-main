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
      console.log('Fetching shift with ID:', id);
      const response = await api.get(`/shifts/${id}`);
      console.log('Shift API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Shift API error:', error.response || error);
      throw error.response?.data || { message: 'خطا در دریافت اطلاعات شیفت' };
    }
  },

  // Create new shift
  createShift: async (shiftData) => {
    try {
      // Ensure required fields are present
      if (!shiftData.guardId) {
        throw new Error('نگهبان باید مشخص شود');
      }
      if (!shiftData.areaId) {
        throw new Error('منطقه باید مشخص شود');
      }
      if (!shiftData.shiftType) {
        throw new Error('نوع شیفت باید مشخص شود');
      }
      
      // Ensure status is valid
      if (!shiftData.status) {
        // Set default status
        shiftData.status = 'برنامه‌ریزی شده';
      } else if (!['برنامه‌ریزی شده', 'در حال انجام', 'تکمیل شده', 'لغو شده'].includes(shiftData.status)) {
        // If status is not valid, reset to default
        console.warn(`Invalid status: ${shiftData.status}, resetting to default`);
        shiftData.status = 'برنامه‌ریزی شده';
      }
      
      const response = await api.post('/shifts', shiftData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در ایجاد شیفت جدید' };
    }
  },

  // Update shift
  updateShift: async (id, shiftData) => {
    try {
      console.log('Updating shift:', id, 'with data:', shiftData);
      const response = await api.put(`/shifts/${id}`, shiftData);
      return response.data;
    } catch (error) {
      console.error('Update shift error:', error.response || error);
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
  generateWeeklyShifts: async (data) => {
    try {
      // Ensure weekNumber is provided
      if (!data.weekNumber) {
        throw new Error('لطفا شماره هفته را مشخص کنید');
      }
      
      // Ensure at least one guard and one area are selected
      if (!data.guardIds || data.guardIds.length === 0) {
        throw new Error('لطفا حداقل یک نگهبان انتخاب کنید');
      }
      
      if (!data.areaIds || data.areaIds.length === 0) {
        throw new Error('لطفا حداقل یک منطقه انتخاب کنید');
      }
      
      // Check if there are at least 3 guards for each area (optimal scheduling)
      if (data.guardIds.length < 3) {
        console.warn('کمتر از 3 نگهبان انتخاب شده است. ممکن است در برنامه‌ریزی شیفت‌ها مشکل ایجاد شود.');
      }
      
      // Log the data being sent
      console.log('Generating shifts with data:', JSON.stringify(data, null, 2));
      
      const response = await api.post('/shifts/generate-shifts', data);
      return response.data;
    } catch (error) {
      console.error('Error in generateWeeklyShifts:', error);
      throw error.response?.data || { message: error.message || 'خطا در تولید شیفت‌های هفتگی' };
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