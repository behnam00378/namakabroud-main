import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShiftService from '../../services/shiftService';
import GuardService from '../../services/guardService';
import AreaService from '../../services/areaService';
import Alert from '../../components/layout/Alert';

const ShiftGenerator = () => {
  const navigate = useNavigate();
  
  const [guards, setGuards] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    days: 7,
    shiftsPerDay: [
      { startTime: '08:00', endTime: '16:00' },
      { startTime: '16:00', endTime: '00:00' },
      { startTime: '00:00', endTime: '08:00' }
    ],
    guardIds: [],
    areaIds: []
  });

  useEffect(() => {
    fetchGuards();
    fetchAreas();
  }, []);

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
    
    if (name === 'days') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e, type) => {
    const { value, checked } = e.target;
    
    if (type === 'guard') {
      setFormData(prev => {
        const currentGuards = [...prev.guardIds];
        
        if (checked) {
          currentGuards.push(value);
        } else {
          const index = currentGuards.indexOf(value);
          if (index !== -1) {
            currentGuards.splice(index, 1);
          }
        }
        
        return {
          ...prev,
          guardIds: currentGuards
        };
      });
    } else if (type === 'area') {
      setFormData(prev => {
        const currentAreas = [...prev.areaIds];
        
        if (checked) {
          currentAreas.push(value);
        } else {
          const index = currentAreas.indexOf(value);
          if (index !== -1) {
            currentAreas.splice(index, 1);
          }
        }
        
        return {
          ...prev,
          areaIds: currentAreas
        };
      });
    }
  };

  const handleShiftTimeChange = (index, field, value) => {
    setFormData(prev => {
      const updatedShifts = [...prev.shiftsPerDay];
      updatedShifts[index] = {
        ...updatedShifts[index],
        [field]: value
      };
      
      return {
        ...prev,
        shiftsPerDay: updatedShifts
      };
    });
  };

  const addShiftTime = () => {
    setFormData(prev => ({
      ...prev,
      shiftsPerDay: [
        ...prev.shiftsPerDay,
        { startTime: '08:00', endTime: '16:00' }
      ]
    }));
  };

  const removeShiftTime = (index) => {
    setFormData(prev => {
      const updatedShifts = [...prev.shiftsPerDay];
      updatedShifts.splice(index, 1);
      
      return {
        ...prev,
        shiftsPerDay: updatedShifts
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.guardIds.length === 0) {
      setError('لطفا حداقل یک نگهبان انتخاب کنید');
      return;
    }
    
    if (formData.areaIds.length === 0) {
      setError('لطفا حداقل یک منطقه انتخاب کنید');
      return;
    }
    
    if (formData.shiftsPerDay.length === 0) {
      setError('لطفا حداقل یک شیفت ساعتی تعریف کنید');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await ShiftService.generateWeeklyShifts(formData);
      
      setSuccess(`${response.count} شیفت با موفقیت ایجاد شد`);
      
      // Clear form after 3 seconds and redirect to shifts list
      setTimeout(() => {
        navigate('/shifts');
      }, 3000);
    } catch (err) {
      console.error('Error generating shifts:', err);
      setError(err.response?.data?.message || 'خطا در تولید شیفت‌های هفتگی');
    } finally {
      setLoading(false);
    }
  };

  if (loadingOptions) {
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
    <div className="shift-generator">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>تولید شیفت‌های هفتگی</h1>
      </div>

      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}
      {success && <Alert message={success} type="success" onClose={() => setSuccess('')} />}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <label htmlFor="startDate" className="form-label">تاریخ شروع</label>
                <input
                  type="date"
                  className="form-control"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-md-6 mb-3">
                <label htmlFor="days" className="form-label">تعداد روز</label>
                <input
                  type="number"
                  className="form-control"
                  id="days"
                  name="days"
                  min="1"
                  max="30"
                  value={formData.days}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <h5 className="mb-3">شیفت‌های زمانی روزانه</h5>
            <div className="card mb-4">
              <div className="card-body">
                {formData.shiftsPerDay.map((shift, index) => (
                  <div className="row mb-3" key={index}>
                    <div className="col-md-5">
                      <label className="form-label">زمان شروع</label>
                      <input
                        type="time"
                        className="form-control"
                        value={shift.startTime}
                        onChange={(e) => handleShiftTimeChange(index, 'startTime', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label">زمان پایان</label>
                      <input
                        type="time"
                        className="form-control"
                        value={shift.endTime}
                        onChange={(e) => handleShiftTimeChange(index, 'endTime', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                      {formData.shiftsPerDay.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger w-100"
                          onClick={() => removeShiftTime(index)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={addShiftTime}
                >
                  <i className="bi bi-plus-lg me-1"></i> افزودن شیفت زمانی
                </button>
              </div>
            </div>
            
            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <h5 className="mb-3">انتخاب نگهبانان</h5>
                <div className="card">
                  <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {guards.length === 0 ? (
                      <p className="text-muted">هیچ نگهبانی یافت نشد</p>
                    ) : (
                      guards.map(guard => (
                        <div className="form-check mb-2" key={guard._id}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`guard-${guard._id}`}
                            value={guard._id}
                            checked={formData.guardIds.includes(guard._id)}
                            onChange={(e) => handleCheckboxChange(e, 'guard')}
                          />
                          <label className="form-check-label" htmlFor={`guard-${guard._id}`}>
                            {guard.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-3">
                <h5 className="mb-3">انتخاب مناطق</h5>
                <div className="card">
                  <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {areas.length === 0 ? (
                      <p className="text-muted">هیچ منطقه‌ای یافت نشد</p>
                    ) : (
                      areas.map(area => (
                        <div className="form-check mb-2" key={area._id}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`area-${area._id}`}
                            value={area._id}
                            checked={formData.areaIds.includes(area._id)}
                            onChange={(e) => handleCheckboxChange(e, 'area')}
                          />
                          <label className="form-check-label" htmlFor={`area-${area._id}`}>
                            {area.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
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
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    در حال تولید شیفت‌ها...
                  </>
                ) : (
                  <>
                    <i className="bi bi-calendar-plus me-1"></i> تولید شیفت‌ها
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShiftGenerator; 