import api from './api';

const LeaveService = {
  // Get all leaves
  getAllLeaves: async (filters = {}) => {
    try {
      const response = await api.get('/leaves', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در دریافت اطلاعات مرخصی‌ها' };
    }
  },

  // Get leave by ID
  getLeaveById: async (id) => {
    try {
      if (!id) {
        throw new Error('شناسه مرخصی نامعتبر است');
      }
      const response = await api.get(`/leaves/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leave:', error);
      if (error.response?.status === 404) {
        throw { message: 'مرخصی مورد نظر یافت نشد' };
      }
      throw error.response?.data || { message: 'خطا در دریافت اطلاعات مرخصی' };
    }
  },

  // Create new leave request
  createLeave: async (leaveData) => {
    try {
      const response = await api.post('/leaves', leaveData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در ثبت درخواست مرخصی جدید' };
    }
  },

  // Update leave
  updateLeave: async (id, leaveData) => {
    try {
      const response = await api.put(`/leaves/${id}`, leaveData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در به‌روزرسانی اطلاعات مرخصی' };
    }
  },

  // Delete leave
  deleteLeave: async (id) => {
    try {
      const response = await api.delete(`/leaves/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در حذف مرخصی' };
    }
  },

  // Handle leave approval
  handleLeave: async (id, handleData) => {
    try {
      const response = await api.post(`/leaves/${id}/handle`, handleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در رسیدگی به درخواست مرخصی' };
    }
  },

  // Approve leave - convenience method
  approveLeave: async (id, replacementGuardId) => {
    try {
      const data = {
        status: 'تأیید شده',
        replacementGuardId
      };
      return await LeaveService.handleLeave(id, data);
    } catch (error) {
      throw error;
    }
  },

  // Reject leave - convenience method
  rejectLeave: async (id, { reason }) => {
    try {
      const data = {
        status: 'رد شده',
        rejectionReason: reason
      };
      return await LeaveService.handleLeave(id, data);
    } catch (error) {
      throw error;
    }
  },

  // Get replacement options for a leave
  getReplacementOptions: async (guardId, startDate, endDate) => {
    try {
      const response = await api.get(`/leaves/replacement-options`, {
        params: { guardId, startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در دریافت گزینه‌های جایگزین' };
    }
  },

  // Get leaves by guard
  getLeavesByGuard: async (guardId) => {
    try {
      const response = await api.get(`/leaves/guard/${guardId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'خطا در دریافت مرخصی‌های نگهبان' };
    }
  }
};

export default LeaveService; 