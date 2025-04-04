/**
 * Format date to Persian locale
 * @param {string} dateString - Date string to format
 * @param {boolean} includeTime - Whether to include time in the formatted date
 * @returns {string} Formatted date string
 */
export const formatPersianDate = (dateString, includeTime = false) => {
  try {
    const date = new Date(dateString);
    
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('fa-IR', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString || '';
  }
};

/**
 * Get the Persian name of a role
 * @param {string} role - Role to convert
 * @returns {string} Persian role name
 */
export const getPersianRoleName = (role) => {
  switch (role) {
    case 'admin':
      return 'مدیر';
    case 'supervisor':
      return 'گشت';
    case 'guard':
      return 'نگهبان';
    default:
      return role;
  }
};

/**
 * Get the Persian name of a status
 * @param {string} status - Status to convert
 * @returns {string} Persian status name
 */
export const getPersianStatusName = (status) => {
  switch (status) {
    case 'active':
      return 'فعال';
    case 'inactive':
      return 'غیرفعال';
    case 'on-leave':
      return 'در مرخصی';
    case 'pending':
      return 'در انتظار بررسی';
    case 'approved':
      return 'تایید شده';
    case 'rejected':
      return 'رد شده';
    default:
      return status;
  }
};

/**
 * Get Bootstrap badge class for a status
 * @param {string} status - Status to convert
 * @returns {string} Bootstrap badge class
 */
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'active':
      return 'bg-success';
    case 'inactive':
      return 'bg-danger';
    case 'on-leave':
      return 'bg-warning text-dark';
    case 'pending':
      return 'bg-info';
    case 'approved':
      return 'bg-success';
    case 'rejected':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  
  return text.length > maxLength
    ? `${text.substring(0, maxLength)}...`
    : text;
};

/**
 * Format error message from API response
 * @param {Error} error - Error object from API call
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return 'خطای نامشخص رخ داده است';
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'خطا در برقراری ارتباط با سرور';
}; 