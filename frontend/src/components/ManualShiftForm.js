import React, { useState } from 'react';
import ShiftService from '../services/shiftService';
import { useAuth } from '../context/AuthContext';

const ManualShiftForm = ({ guards, areas, onSuccess, onError }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'supervisor');
  
  const daysOfWeek = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
  
  const [formData, setFormData] = useState({
    guardId: '',
    areaId: '',
    shiftType: 'صبح',
    date: new Date().toISOString().split('T')[0],
    day: 0,
    notes: '',
    useDay: false
  });
  
  const [loading, setLoading] = useState(false);

  // Filter out guards with fixed areas if needed
  const getAvailableGuards = () => {
    return guards;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'day' ? parseInt(value, 10) : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.guardId || !formData.areaId || !formData.shiftType) {
      onError('لطفا نگهبان، منطقه و نوع شیفت را انتخاب کنید');
      return;
    }
    
    try {
      setLoading(true);
      
      // Calculate shift times based on shift type
      let startHour, endHour;
      
      switch (formData.shiftType) {
        case 'صبح':
          startHour = 7;
          endHour = 15;
          break;
        case 'بعد از ظهر':
          startHour = 15;
          endHour = 23;
          break;
        case 'شب':
          startHour = 23;
          endHour = 7; // Next day
          break;
        default:
          startHour = 0;
          endHour = 8;
      }
      
      // Create date object from selected date or calculate from current date and day of week
      let shiftDate = new Date(formData.date);
      
      // If using day of week, calculate the appropriate date
      if (formData.useDay) {
        const today = new Date();
        const currentDay = today.getDay(); // 0 is Sunday, so we need to adjust
        const targetDay = formData.day; // 0 is Saturday in our Persian calendar
        
        // Convert to our system where 0 = Saturday, 6 = Friday
        const adjustedCurrentDay = (currentDay + 1) % 7;
        
        // Calculate days to add
        let daysToAdd = targetDay - adjustedCurrentDay;
        if (daysToAdd < 0) daysToAdd += 7; // If it's in the past, get next week
        
        shiftDate = new Date();
        shiftDate.setDate(today.getDate() + daysToAdd);
      }
      
      // Create start and end times
      const startTime = new Date(shiftDate);
      startTime.setHours(startHour, 0, 0, 0);
      
      const endTime = new Date(shiftDate);
      if (formData.shiftType === 'شب') {
        // For night shift, end time is next day
        endTime.setDate(endTime.getDate() + 1);
      }
      endTime.setHours(endHour, 0, 0, 0);
      
      const shiftData = {
        guardId: formData.guardId,
        areaId: formData.areaId,
        shiftType: formData.shiftType,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: 'برنامه‌ریزی شده',
        notes: formData.notes || ''
      };
      
      const response = await ShiftService.createShift(shiftData);
      
      onSuccess('شیفت با موفقیت ایجاد شد');
      
      // Reset form
      setFormData({
        guardId: '',
        areaId: '',
        shiftType: 'صبح',
        date: new Date().toISOString().split('T')[0],
        day: 0,
        notes: '',
        useDay: false
      });
    } catch (err) {
      console.error('Error creating shift:', err);
      onError(err.message || 'خطا در ایجاد شیفت');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-3 mb-3">
          <label htmlFor="guardId" className="form-label">نگهبان</label>
          <select
            className="form-select"
            id="guardId"
            name="guardId"
            value={formData.guardId}
            onChange={handleChange}
            required
          >
            <option value="">انتخاب نگهبان...</option>
            {getAvailableGuards().map(guard => (
              <option key={guard._id} value={guard._id}>
                {guard.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="col-md-3 mb-3">
          <label htmlFor="areaId" className="form-label">منطقه</label>
          <select
            className="form-select"
            id="areaId"
            name="areaId"
            value={formData.areaId}
            onChange={handleChange}
            required
          >
            <option value="">انتخاب منطقه...</option>
            {areas.map(area => (
              <option key={area._id} value={area._id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="col-md-3 mb-3">
          <label htmlFor="shiftType" className="form-label">نوع شیفت</label>
          <select
            className="form-select"
            id="shiftType"
            name="shiftType"
            value={formData.shiftType}
            onChange={handleChange}
            required
          >
            <option value="صبح">صبح (۷ صبح - ۳ بعد از ظهر)</option>
            <option value="بعد از ظهر">بعد از ظهر (۳ بعد از ظهر - ۱۱ شب)</option>
            <option value="شب">شب (۱۱ شب - ۷ صبح)</option>
          </select>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="form-check form-switch mt-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="useDay"
              name="useDay"
              checked={formData.useDay}
              onChange={(e) => setFormData(prev => ({...prev, useDay: e.target.checked}))}
            />
            <label className="form-check-label" htmlFor="useDay">
              انتخاب براساس روز هفته
            </label>
          </div>
        </div>
      </div>
      
      <div className="row">
        {formData.useDay ? (
          <div className="col-md-6 mb-3">
            <label htmlFor="day" className="form-label">روز هفته</label>
            <select
              className="form-select"
              id="day"
              name="day"
              value={formData.day}
              onChange={handleChange}
            >
              {daysOfWeek.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="col-md-6 mb-3">
            <label htmlFor="date" className="form-label">تاریخ</label>
            <input
              type="date"
              className="form-control"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
        )}
        
        <div className="col-md-6 mb-3">
          <label htmlFor="notes" className="form-label">یادداشت</label>
          <input
            type="text"
            className="form-control"
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="یادداشت اختیاری..."
          />
        </div>
      </div>
      
      <div className="d-flex justify-content-end">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              در حال ایجاد شیفت...
            </>
          ) : (
            <>
              <i className="bi bi-plus-lg me-1"></i> ایجاد شیفت
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ManualShiftForm; 