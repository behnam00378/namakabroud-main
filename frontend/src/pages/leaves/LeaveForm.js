import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LeaveService from '../../services/leaveService';
import GuardService from '../../services/guardService';
import Alert from '../../components/layout/Alert';
import { useAuth } from '../../context/AuthContext';

const LeaveForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEditMode = Boolean(id);
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'supervisor');
  
  const [replacementOptions, setReplacementOptions] = useState([]);
  const [guards, setGuards] = useState([]);

  const [formData, setFormData] = useState({
    guardId: currentUser.role === 'guard' ? currentUser.id : '',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    type: 'regular',
    reason: '',
    replacementId: ''
  });

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState('');
  const [loadingLeave, setLoadingLeave] = useState(isEditMode);

  useEffect(() => {
    if (isAdmin) {
      fetchGuards();
    }
    
    if (isEditMode) {
      fetchLeave();
    } else if (formData.guardId && formData.fromDate && formData.toDate) {
      fetchReplacementOptions();
    }
  }, [id, isAdmin]);

  const fetchLeave = async () => {
    try {
      setLoadingLeave(true);
      const response = await LeaveService.getLeaveById(id);
      const leave = response.data;
      
      // Validate if guard can edit this leave
      if (currentUser.role === 'guard' && leave.guard._id !== currentUser.id) {
        setError('شما دسترسی به ویرایش این مرخصی را ندارید');
        navigate('/leaves');
        return;
      }
      
      if (leave.status !== 'pending') {
        setError('فقط مرخصی‌های در انتظار بررسی قابل ویرایش هستند');
        navigate(`/leaves/${id}`);
        return;
      }
      
      // Format dates for inputs (YYYY-MM-DD)
      const fromDateFormatted = new Date(leave.fromDate).toISOString().split('T')[0];
      const toDateFormatted = new Date(leave.toDate).toISOString().split('T')[0];
      
      setFormData({
        guardId: leave.guard._id,
        fromDate: fromDateFormatted,
        toDate: toDateFormatted,
        type: leave.type,
        reason: leave.reason || '',
        replacementId: leave.replacement?._id || ''
      });
      
      // Fetch replacement options after setting form data
      fetchReplacementOptions(leave.guard._id, fromDateFormatted, toDateFormatted);
    } catch (err) {
      console.error('Error fetching leave:', err);
      setError('خطا در دریافت اطلاعات مرخصی');
    } finally {
      setLoadingLeave(false);
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

  const fetchReplacementOptions = async (guardId = formData.guardId, fromDate = formData.fromDate, toDate = formData.toDate) => {
    if (!guardId || !fromDate || !toDate) return;
    
    try {
      setLoadingOptions(true);
      const response = await LeaveService.getReplacementOptions(guardId, fromDate, toDate);
      setReplacementOptions(response.data || []);
    } catch (err) {
      console.error('Error fetching replacement options:', err);
      setError('خطا در دریافت لیست نگهبانان جایگزین');
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If date or guardId changes, update replacement options
    if (['guardId', 'fromDate', 'toDate'].includes(name)) {
      if (name === 'guardId') {
        // Reset replacement when guard changes
        setFormData(prev => ({
          ...prev,
          replacementId: ''
        }));
      }
      
      // Only fetch if we have all three values
      if (
        (name === 'guardId' && value && formData.fromDate && formData.toDate) ||
        (name === 'fromDate' && value && formData.guardId && formData.toDate) ||
        (name === 'toDate' && value && formData.guardId && formData.fromDate)
      ) {
        const guardIdToUse = name === 'guardId' ? value : formData.guardId;
        const fromDateToUse = name === 'fromDate' ? value : formData.fromDate;
        const toDateToUse = name === 'toDate' ? value : formData.toDate;
        
        fetchReplacementOptions(guardIdToUse, fromDateToUse, toDateToUse);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Validate dates
      const fromDate = new Date(formData.fromDate);
      const toDate = new Date(formData.toDate);
      
      if (fromDate > toDate) {
        setError('تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد');
        setLoading(false);
        return;
      }
      
      if (isEditMode) {
        await LeaveService.updateLeave(id, formData);
      } else {
        await LeaveService.createLeave(formData);
      }
      
      // Redirect back to list
      navigate('/leaves');
    } catch (err) {
      console.error('Error saving leave:', err);
      setError(err.response?.data?.message || 'خطا در ذخیره اطلاعات مرخصی');
    } finally {
      setLoading(false);
    }
  };

  if (loadingLeave) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
        <p className="mt-2">در حال دریافت اطلاعات مرخصی...</p>
      </div>
    );
  }

  return (
    <div className="leave-form">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{isEditMode ? 'ویرایش درخواست مرخصی' : 'درخواست مرخصی جدید'}</h1>
      </div>

      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {isAdmin && (
                <div className="col-md-12 mb-3">
                  <label htmlFor="guardId" className="form-label">نگهبان</label>
                  <select
                    className="form-select"
                    id="guardId"
                    name="guardId"
                    value={formData.guardId}
                    onChange={handleChange}
                    required
                    disabled={isEditMode}
                  >
                    <option value="">انتخاب نگهبان...</option>
                    {guards.map(guard => (
                      <option key={guard._id} value={guard._id}>
                        {guard.name}
                      </option>
                    ))}
                  </select>
                  {isEditMode && (
                    <div className="form-text">نگهبان در هنگام ویرایش قابل تغییر نیست</div>
                  )}
                </div>
              )}
              
              <div className="col-md-6 mb-3">
                <label htmlFor="fromDate" className="form-label">از تاریخ</label>
                <input
                  type="date"
                  className="form-control"
                  id="fromDate"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-md-6 mb-3">
                <label htmlFor="toDate" className="form-label">تا تاریخ</label>
                <input
                  type="date"
                  className="form-control"
                  id="toDate"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-md-6 mb-3">
                <label htmlFor="type" className="form-label">نوع مرخصی</label>
                <select
                  className="form-select"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="regular">استحقاقی</option>
                  <option value="sick">استعلاجی</option>
                </select>
              </div>
              
              <div className="col-md-6 mb-3">
                <label htmlFor="replacementId" className="form-label">نگهبان جایگزین</label>
                <select
                  className="form-select"
                  id="replacementId"
                  name="replacementId"
                  value={formData.replacementId}
                  onChange={handleChange}
                >
                  <option value="">انتخاب نگهبان جایگزین...</option>
                  {loadingOptions ? (
                    <option value="" disabled>در حال بارگذاری گزینه‌ها...</option>
                  ) : replacementOptions.length === 0 ? (
                    <option value="" disabled>هیچ نگهبان جایگزینی در دسترس نیست</option>
                  ) : (
                    replacementOptions.map(guard => (
                      <option key={guard._id} value={guard._id}>
                        {guard.name}
                      </option>
                    ))
                  )}
                </select>
                <div className="form-text">نگهبانان جایگزین بر اساس شیفت‌های موجود و مرخصی‌های تایید شده فیلتر می‌شوند</div>
              </div>
              
              <div className="col-md-12 mb-3">
                <label htmlFor="reason" className="form-label">دلیل مرخصی</label>
                <textarea
                  className="form-control"
                  id="reason"
                  name="reason"
                  rows="3"
                  value={formData.reason}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/leaves')}
                disabled={loading}
              >
                انصراف
              </button>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || loadingOptions}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    در حال ذخیره...
                  </>
                ) : (
                  isEditMode ? 'بروزرسانی درخواست' : 'ثبت درخواست'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeaveForm; 