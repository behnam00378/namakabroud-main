import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ShiftService from '../../services/shiftService';
import GuardService from '../../services/guardService';
import AreaService from '../../services/areaService';
import Alert from '../../components/layout/Alert';

const ShiftForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [guards, setGuards] = useState([]);
  const [areas, setAreas] = useState([]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '16:00',
    guardId: '',
    areaId: '',
    status: 'scheduled',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingShift, setLoadingShift] = useState(isEditMode);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    fetchGuards();
    fetchAreas();
    
    if (isEditMode) {
      fetchShift();
    }
  }, [id]);

  const fetchShift = async () => {
    try {
      setLoadingShift(true);
      const response = await ShiftService.getShiftById(id);
      console.log('Shift data received:', response.data);
      const shift = response.data;
      
      // Format date for the input (YYYY-MM-DD)
      let formattedDate;
      try {
        formattedDate = new Date(shift.date || shift.startTime).toISOString().split('T')[0];
      } catch (err) {
        console.error('Error formatting date:', err);
        formattedDate = new Date().toISOString().split('T')[0];
      }
      
      // Extract time from ISO string
      let startTime = '08:00';
      let endTime = '16:00';
      try {
        if (shift.startTime) {
          const startDate = new Date(shift.startTime);
          startTime = startDate.getHours().toString().padStart(2, '0') + ':' + 
                     startDate.getMinutes().toString().padStart(2, '0');
        }
        if (shift.endTime) {
          const endDate = new Date(shift.endTime);
          endTime = endDate.getHours().toString().padStart(2, '0') + ':' + 
                   endDate.getMinutes().toString().padStart(2, '0');
        }
      } catch (err) {
        console.error('Error formatting time:', err);
      }
      
      setFormData({
        date: formattedDate,
        startTime: startTime,
        endTime: endTime,
        guardId: shift.guardId?._id || shift.guardId || '',
        areaId: shift.areaId?._id || shift.areaId || '',
        status: shift.status || 'scheduled',
        notes: shift.notes || ''
      });
    } catch (err) {
      console.error('Error fetching shift:', err);
      setError('خطا در دریافت اطلاعات شیفت');
    } finally {
      setLoadingShift(false);
    }
  };

  const fetchGuards = async () => {
    try {
      const response = await GuardService.getAllGuards();
      setGuards(response.data || []);
    } catch (err) {
      console.error('Error fetching guards:', err);
      setError('خطا در دریافت لیست نگهبانان');
    } finally {
      setLoadingOptions(false);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await AreaService.getAllAreas();
      setAreas(response.data || []);
    } catch (err) {
      console.error('Error fetching areas:', err);
      setError('خطا در دریافت لیست مناطق');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.guardId) {
      setError('لطفا یک نگهبان انتخاب کنید');
      return;
    }
    
    if (!formData.areaId) {
      setError('لطفا یک منطقه انتخاب کنید');
      return;
    }
    
    const shiftData = {
      date: formData.date,
      startTime: formData.date + 'T' + formData.startTime + ':00',
      endTime: formData.date + 'T' + formData.endTime + ':00',
      guardId: formData.guardId,
      areaId: formData.areaId,
      status: formData.status,
      notes: formData.notes
    };
    
    // Handle time crossing to next day
    const startHour = parseInt(formData.startTime.split(':')[0], 10);
    const endHour = parseInt(formData.endTime.split(':')[0], 10);
    
    if (endHour < startHour) {
      // End time is on the next day, adjust the end date
      const endDate = new Date(formData.date);
      endDate.setDate(endDate.getDate() + 1);
      shiftData.endTime = endDate.toISOString().split('T')[0] + 'T' + formData.endTime + ':00';
    }
    
    try {
      setLoading(true);
      setError('');
      
      if (isEditMode) {
        await ShiftService.updateShift(id, shiftData);
      } else {
        await ShiftService.createShift(shiftData);
      }
      
      navigate('/shifts');
    } catch (err) {
      console.error('Error saving shift:', err);
      setError(err.response?.data?.message || 'خطا در ذخیره اطلاعات شیفت');
      setLoading(false);
    }
  };

  if (loadingShift || loadingOptions) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
        <p className="mt-2">در حال دریافت اطلاعات...</p>
      </div>
    );
  }

  return (
    <div className="shift-form">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{isEditMode ? 'ویرایش شیفت' : 'افزودن شیفت جدید'}</h1>
      </div>

      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
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
              
              <div className="col-md-3 mb-3">
                <label htmlFor="startTime" className="form-label">زمان شروع</label>
                <input
                  type="time"
                  className="form-control"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-md-3 mb-3">
                <label htmlFor="endTime" className="form-label">زمان پایان</label>
                <input
                  type="time"
                  className="form-control"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-md-6 mb-3">
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
                  {guards.map(guard => (
                    <option key={guard._id} value={guard._id}>
                      {guard.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-6 mb-3">
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
              
              <div className="col-md-6 mb-3">
                <label htmlFor="status" className="form-label">وضعیت</label>
                <select
                  className="form-select"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="scheduled">برنامه‌ریزی شده</option>
                  <option value="completed">انجام شده</option>
                  <option value="cancelled">لغو شده</option>
                </select>
              </div>
              
              <div className="col-md-12 mb-3">
                <label htmlFor="notes" className="form-label">یادداشت‌ها</label>
                <textarea
                  className="form-control"
                  id="notes"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/shifts')}
                disabled={loading}
              >
                انصراف
              </button>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    در حال ذخیره...
                  </>
                ) : (
                  isEditMode ? 'بروزرسانی شیفت' : 'ثبت شیفت'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShiftForm; 