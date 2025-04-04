import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GuardService from '../../services/guardService';
import Alert from '../../components/layout/Alert';

const GuardForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'guard',
    status: 'active'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingGuard, setLoadingGuard] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      fetchGuard();
    }
  }, [id]);

  const fetchGuard = async () => {
    try {
      setLoadingGuard(true);
      const response = await GuardService.getGuardById(id);
      const guard = response.data;
      
      setFormData({
        name: guard.name,
        email: guard.email,
        phoneNumber: guard.phoneNumber || '',
        password: '', // Don't populate password on edit
        role: guard.role,
        status: guard.status
      });
    } catch (err) {
      console.error('Error fetching guard:', err);
      setError('خطا در دریافت اطلاعات نگهبان');
    } finally {
      setLoadingGuard(false);
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
    
    try {
      setLoading(true);
      setError('');
      
      // Create a copy of form data to send
      const guardData = { ...formData };
      
      // Remove empty password for editing (backend will ignore if not provided)
      if (isEditMode && !guardData.password) {
        delete guardData.password;
      }
      
      if (isEditMode) {
        await GuardService.updateGuard(id, guardData);
      } else {
        await GuardService.createGuard(guardData);
      }
      
      // Redirect back to list
      navigate('/guards');
    } catch (err) {
      console.error('Error saving guard:', err);
      setError(err.response?.data?.message || 'خطا در ذخیره اطلاعات نگهبان');
    } finally {
      setLoading(false);
    }
  };

  if (loadingGuard) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
        <p className="mt-2">در حال دریافت اطلاعات نگهبان...</p>
      </div>
    );
  }

  return (
    <div className="guard-form">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{isEditMode ? 'ویرایش نگهبان' : 'افزودن نگهبان جدید'}</h1>
      </div>

      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="name" className="form-label">نام و نام خانوادگی</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-md-6 mb-3">
                <label htmlFor="email" className="form-label">ایمیل</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-md-6 mb-3">
                <label htmlFor="phoneNumber" className="form-label">شماره تماس</label>
                <input
                  type="text"
                  className="form-control"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
              
              <div className="col-md-6 mb-3">
                <label htmlFor="role" className="form-label">نقش</label>
                <select
                  className="form-select"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="admin">مدیر</option>
                  <option value="supervisor">گشت</option>
                  <option value="guard">نگهبان</option>
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
                  <option value="active">فعال</option>
                  <option value="inactive">غیرفعال</option>
                </select>
              </div>
              
              <div className="col-md-6 mb-3">
                <label htmlFor="password" className="form-label">
                  {isEditMode ? 'رمز عبور (برای تغییر پر کنید)' : 'رمز عبور'}
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEditMode}
                />
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/guards')}
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
                  isEditMode ? 'بروزرسانی نگهبان' : 'ثبت نگهبان'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GuardForm; 