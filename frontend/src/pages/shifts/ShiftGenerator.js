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
  const [fixedAreaGuards, setFixedAreaGuards] = useState([]);
  const [activeTab, setActiveTab] = useState('main');
  const [manualFixedAssignments, setManualFixedAssignments] = useState([]);
  const [manualShifts, setManualShifts] = useState([]);
  const [newManualShift, setNewManualShift] = useState({
    guardId: '',
    areaId: '',
    shiftType: 'صبح', // Default to morning shift
    day: 0, // Saturday by default (0-6 for Saturday to Friday)
  });
  const daysOfWeek = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    days: 7,
    weekNumber: getCurrentWeekNumber(),
    shiftsPerDay: [
      { startTime: '08:00', endTime: '16:00' },
      { startTime: '16:00', endTime: '00:00' },
      { startTime: '00:00', endTime: '08:00' }
    ],
    guardIds: [],
    areaIds: [],
    newFixedGuardId: '',
    newFixedAreaId: '',
    fixedAssignments: []
  });

  useEffect(() => {
    fetchGuards();
    fetchAreas();
    fetchFixedAreaGuards();
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

  const fetchFixedAreaGuards = async () => {
    try {
      const guardsResponse = await GuardService.getAllGuards();
      const guards = guardsResponse.data || [];
      
      const areasResponse = await AreaService.getAllAreas();
      const areas = areasResponse.data || [];
      
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const shiftsResponse = await ShiftService.getAllShifts({
        startTime: { $gte: thirtyDaysAgo.toISOString() }
      });
      const shifts = shiftsResponse.data || [];
      
      const guardAreaCount = {};
      
      shifts.forEach(shift => {
        const guardId = shift.guardId?._id || shift.guardId;
        const areaId = shift.areaId?._id || shift.areaId;
        
        if (!guardId || !areaId) return;
        
        if (!guardAreaCount[guardId]) {
          guardAreaCount[guardId] = {};
        }
        
        if (!guardAreaCount[guardId][areaId]) {
          guardAreaCount[guardId][areaId] = 0;
        }
        
        guardAreaCount[guardId][areaId]++;
      });
      
      const fixedAssignments = [];
      
      Object.keys(guardAreaCount).forEach(guardId => {
        const areaCount = guardAreaCount[guardId];
        const totalShifts = Object.values(areaCount).reduce((a, b) => a + b, 0);
        
        let maxCount = 0;
        let mostFrequentAreaId = null;
        
        Object.keys(areaCount).forEach(areaId => {
          if (areaCount[areaId] > maxCount) {
            maxCount = areaCount[areaId];
            mostFrequentAreaId = areaId;
          }
        });
        
        if (mostFrequentAreaId && (maxCount / totalShifts) >= 0.7) {
          const guard = guards.find(g => g._id === guardId || g._id === guardId);
          const area = areas.find(a => a._id === mostFrequentAreaId || a._id === mostFrequentAreaId);
          
          if (guard && area) {
            fixedAssignments.push({
              guard,
              area,
              percentage: Math.round((maxCount / totalShifts) * 100),
              shiftsCount: maxCount,
              totalShifts
            });
          }
        }
      });
      
      setFixedAreaGuards(fixedAssignments);
      
      setManualFixedAssignments(fixedAssignments.map(item => ({
        guardId: item.guard._id,
        areaId: item.area._id,
        enabled: true
      })));
    } catch (err) {
      console.error('Error fetching fixed area guards:', err);
      setError('خطا در دریافت اطلاعات نگهبانان با منطقه ثابت');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'days') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } else if (name === 'weekNumber') {
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

  const toggleFixedAssignment = (guardId, areaId, enabled) => {
    setManualFixedAssignments(prev => {
      const existingIndex = prev.findIndex(item => item.guardId === guardId && item.areaId === areaId);
      
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], enabled };
        return updated;
      } else {
        return [...prev, { guardId, areaId, enabled }];
      }
    });
  };

  const addFixedAssignment = () => {
    if (!formData.newFixedGuardId || !formData.newFixedAreaId) {
      setError('لطفا نگهبان و منطقه را انتخاب کنید');
      return;
    }
    
    const existingAssignment = manualFixedAssignments.find(
      item => item.guardId === formData.newFixedGuardId && item.areaId === formData.newFixedAreaId
    );
    
    if (existingAssignment) {
      setError('این نگهبان قبلاً برای این منطقه تنظیم شده است');
      return;
    }
    
    setManualFixedAssignments(prev => [
      ...prev,
      {
        guardId: formData.newFixedGuardId,
        areaId: formData.newFixedAreaId,
        enabled: true,
        manual: true
      }
    ]);
    
    setFormData(prev => ({
      ...prev,
      newFixedGuardId: '',
      newFixedAreaId: ''
    }));
  };

  const handleManualShiftChange = (e) => {
    const { name, value } = e.target;
    setNewManualShift(prev => ({
      ...prev,
      [name]: name === 'day' ? parseInt(value, 10) : value
    }));
  };

  const addManualShift = () => {
    if (!newManualShift.guardId || !newManualShift.areaId || !newManualShift.shiftType) {
      setError('لطفا نگهبان، منطقه و نوع شیفت را انتخاب کنید');
      return;
    }
    
    // Check if this guard already has a shift for this day
    const existingShift = manualShifts.find(
      shift => shift.guardId === newManualShift.guardId && shift.day === newManualShift.day
    );
    
    if (existingShift) {
      setError(`نگهبان انتخاب شده قبلاً برای روز ${daysOfWeek[newManualShift.day]} شیفت دارد`);
      return;
    }
    
    // Get guard and area names for display
    const guard = guards.find(g => g._id === newManualShift.guardId);
    const area = areas.find(a => a._id === newManualShift.areaId);
    
    if (!guard || !area) {
      setError('نگهبان یا منطقه یافت نشد');
      return;
    }
    
    setManualShifts(prev => [
      ...prev,
      {
        ...newManualShift,
        status: 'برنامه‌ریزی شده', // Set a valid status value
        guardName: guard.name,
        areaName: area.name
      }
    ]);
    
    // Reset form
    setNewManualShift({
      guardId: '',
      areaId: '',
      shiftType: 'صبح',
      day: 0
    });
  };

  const removeManualShift = (index) => {
    setManualShifts(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const getAvailableGuards = () => {
    const fixedGuardIds = manualFixedAssignments
      .filter(a => a.enabled)
      .map(a => a.guardId);
    
    return guards.filter(guard => !fixedGuardIds.includes(guard._id));
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
      
      const enabledFixedAssignments = manualFixedAssignments
        .filter(item => item.enabled)
        .map(item => ({
          guardId: item.guardId,
          areaId: item.areaId
        }));
      
      const apiData = {
        ...formData,
        fixedAssignments: enabledFixedAssignments,
        manualShifts: manualShifts
      };
      
      const response = await ShiftService.generateWeeklyShifts(apiData);
      
      setSuccess(`${response.count} شیفت با موفقیت ایجاد شد`);
      
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

  function getCurrentWeekNumber() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  }

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

      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">قوانین شیفت</h5>
        </div>
        <div className="card-body">
          <ul className="mb-0">
            <li>هر نگهبان روزانه ۸ ساعت شیفت دارد</li>
            <li>شیفت‌های استاندارد:
              <ul>
                <li><strong>صبح:</strong> ۷ صبح تا ۳ بعد از ظهر</li>
                <li><strong>بعد از ظهر:</strong> ۳ بعد از ظهر تا ۱۱ شب</li>
                <li><strong>شب:</strong> ۱۱ شب تا ۷ صبح</li>
              </ul>
            </li>
            <li>قانون جمعه‌ها:
              <ul>
                <li>نگهبان شیفت صبح → در جمعه شیفت شب</li>
                <li>نگهبان شیفت بعد از ظهر → در جمعه شیفت صبح</li>
                <li>نگهبان شیفت شب → در جمعه شیفت بعد از ظهر</li>
              </ul>
            </li>
            <li>نگهبانان با منطقه ثابت از تب «نگهبانان با منطقه ثابت» قابل تنظیم هستند</li>
          </ul>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'main' ? 'active' : ''}`} 
            id="main-tab" 
            data-bs-toggle="tab" 
            data-bs-target="#main" 
            type="button" 
            role="tab" 
            aria-controls="main" 
            aria-selected={activeTab === 'main'}
            onClick={() => setActiveTab('main')}
          >
            اطلاعات اصلی
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'fixedGuards' ? 'active' : ''}`} 
            id="fixedGuards-tab" 
            data-bs-toggle="tab" 
            data-bs-target="#fixedGuards" 
            type="button" 
            role="tab" 
            aria-controls="fixedGuards" 
            aria-selected={activeTab === 'fixedGuards'}
            onClick={() => setActiveTab('fixedGuards')}
          >
            نگهبانان با منطقه ثابت
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'manualShifts' ? 'active' : ''}`} 
            id="manualShifts-tab" 
            data-bs-toggle="tab" 
            data-bs-target="#manualShifts" 
            type="button" 
            role="tab" 
            aria-controls="manualShifts" 
            aria-selected={activeTab === 'manualShifts'}
            onClick={() => setActiveTab('manualShifts')}
          >
            شیفت‌های دستی
          </button>
        </li>
      </ul>
      
      <div className="tab-content">
        <div 
          className={`tab-pane fade ${activeTab === 'main' ? 'show active' : ''}`} 
          id="main" 
          role="tabpanel" 
          aria-labelledby="main-tab"
        >
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

                  <div className="col-md-6 mb-3">
                    <label htmlFor="weekNumber" className="form-label">شماره هفته</label>
                    <input
                      type="number"
                      className="form-control"
                      id="weekNumber"
                      name="weekNumber"
                      min="1"
                      max="53"
                      value={formData.weekNumber}
                      onChange={handleChange}
                      required
                    />
                    <small className="text-muted">هفته فعلی: {getCurrentWeekNumber()}</small>
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
        
        <div 
          className={`tab-pane fade ${activeTab === 'fixedGuards' ? 'show active' : ''}`} 
          id="fixedGuards" 
          role="tabpanel" 
          aria-labelledby="fixedGuards-tab"
        >
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">افزودن نگهبان با منطقه ثابت</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-5">
                  <label className="form-label">نگهبان</label>
                  <select
                    className="form-select"
                    value={formData.newFixedGuardId}
                    onChange={(e) => setFormData(prev => ({...prev, newFixedGuardId: e.target.value}))}
                  >
                    <option value="">انتخاب نگهبان...</option>
                    {guards.map(guard => (
                      <option key={guard._id} value={guard._id}>
                        {guard.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-5">
                  <label className="form-label">منطقه ثابت</label>
                  <select
                    className="form-select"
                    value={formData.newFixedAreaId}
                    onChange={(e) => setFormData(prev => ({...prev, newFixedAreaId: e.target.value}))}
                  >
                    <option value="">انتخاب منطقه...</option>
                    {areas.map(area => (
                      <option key={area._id} value={area._id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button 
                    type="button" 
                    className="btn btn-primary w-100"
                    onClick={addFixedAssignment}
                  >
                    افزودن
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">لیست نگهبانان با منطقه ثابت</h5>
            </div>
            <div className="card-body">
              {manualFixedAssignments.length === 0 ? (
                <div className="alert alert-info">
                  هیچ نگهبانی با منطقه ثابت تعریف نشده است.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>نگهبان</th>
                        <th>منطقه ثابت</th>
                        <th>وضعیت</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manualFixedAssignments.map((assignment, index) => {
                        const guard = guards.find(g => g._id === assignment.guardId);
                        const area = areas.find(a => a._id === assignment.areaId);
                        
                        if (!guard || !area) return null;
                        
                        return (
                          <tr key={`${assignment.guardId}-${assignment.areaId}`}>
                            <td>{guard.name}</td>
                            <td>{area.name}</td>
                            <td>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`fixed-${index}`}
                                  checked={assignment.enabled}
                                  onChange={(e) => toggleFixedAssignment(assignment.guardId, assignment.areaId, e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor={`fixed-${index}`}>
                                  {assignment.enabled ? 'فعال' : 'غیرفعال'}
                                </label>
                              </div>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => setManualFixedAssignments(prev => 
                                  prev.filter(item => !(item.guardId === assignment.guardId && item.areaId === assignment.areaId))
                                )}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-3">
                <p className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  نگهبانان با منطقه ثابت در تولید شیفت هفتگی لحاظ نمی‌شوند و شیفت‌های آنها باید جداگانه تعریف شود.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div 
          className={`tab-pane fade ${activeTab === 'manualShifts' ? 'show active' : ''}`} 
          id="manualShifts" 
          role="tabpanel" 
          aria-labelledby="manualShifts-tab"
        >
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">تعریف شیفت دستی</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">نگهبان</label>
                  <select
                    className="form-select"
                    name="guardId"
                    value={newManualShift.guardId}
                    onChange={handleManualShiftChange}
                  >
                    <option value="">انتخاب نگهبان...</option>
                    {getAvailableGuards().map(guard => (
                      <option key={guard._id} value={guard._id}>
                        {guard.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">منطقه</label>
                  <select
                    className="form-select"
                    name="areaId"
                    value={newManualShift.areaId}
                    onChange={handleManualShiftChange}
                  >
                    <option value="">انتخاب منطقه...</option>
                    {areas.map(area => (
                      <option key={area._id} value={area._id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">روز</label>
                  <select
                    className="form-select"
                    name="day"
                    value={newManualShift.day}
                    onChange={handleManualShiftChange}
                  >
                    {daysOfWeek.map((day, index) => (
                      <option key={index} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">نوع شیفت</label>
                  <select
                    className="form-select"
                    name="shiftType"
                    value={newManualShift.shiftType}
                    onChange={handleManualShiftChange}
                  >
                    <option value="صبح">صبح (۷ صبح - ۳ بعد از ظهر)</option>
                    <option value="بعد از ظهر">بعد از ظهر (۳ بعد از ظهر - ۱۱ شب)</option>
                    <option value="شب">شب (۱۱ شب - ۷ صبح)</option>
                  </select>
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button 
                    type="button" 
                    className="btn btn-primary w-100"
                    onClick={addManualShift}
                  >
                    افزودن شیفت
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">لیست شیفت‌های دستی</h5>
            </div>
            <div className="card-body">
              {manualShifts.length === 0 ? (
                <div className="alert alert-info">
                  هیچ شیفت دستی تعریف نشده است.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>نگهبان</th>
                        <th>منطقه</th>
                        <th>روز</th>
                        <th>نوع شیفت</th>
                        <th>ساعت</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manualShifts.map((shift, index) => (
                        <tr key={index}>
                          <td>{shift.guardName}</td>
                          <td>{shift.areaName}</td>
                          <td>{daysOfWeek[shift.day]}</td>
                          <td>{shift.shiftType}</td>
                          <td>
                            {shift.shiftType === 'صبح' ? '۷ صبح - ۳ بعد از ظهر' : 
                             shift.shiftType === 'بعد از ظهر' ? '۳ بعد از ظهر - ۱۱ شب' : 
                             '۱۱ شب - ۷ صبح'}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => removeManualShift(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-3">
                <p className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  شیفت‌های دستی با اولویت بالاتری نسبت به شیفت‌های خودکار در نظر گرفته می‌شوند.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftGenerator; 