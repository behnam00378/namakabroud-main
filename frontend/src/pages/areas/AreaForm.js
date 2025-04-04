import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AreaService from '../../services/areaService';
import Alert from '../../components/layout/Alert';

const AreaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingArea, setLoadingArea] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      fetchArea();
    }
  }, [id]);

  const fetchArea = async () => {
    try {
      setLoadingArea(true);
      const response = await AreaService.getAreaById(id);
      const area = response.data;
      
      setFormData({
        name: area.name,
        code: area.code,
        location: area.location || '',
        description: area.description || ''
      });
    } catch (err) {
      console.error('Error fetching area:', err);
      setError('خطا در دریافت اطلاعات منطقه');
    } finally {
      setLoadingArea(false);
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
      
      if (isEditMode) {
        await AreaService.updateArea(id, formData);
      } else {
        await AreaService.createArea(formData);
      }
      
      // Redirect back to list
      navigate('/areas');
    } catch (err) {
      console.error('Error saving area:', err);
      setError(err.response?.data?.message || 'خطا در ذخیره اطلاعات منطقه');
    } finally {
      setLoading(false);
    }
  };

  if (loadingArea) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
        <p className="mt-2">در حال دریافت اطلاعات منطقه...</p>
      </div>
    );
  }

  return (
    <div className="area-form">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{isEditMode ? 'ویرایش منطقه' : 'افزودن منطقه جدید'}</h1>
      </div>

      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="name" className="form-label">نام منطقه</label>
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
                <label htmlFor="code" className="form-label">کد منطقه</label>
                <input
                  type="text"
                  className="form-control"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
                <div className="form-text">کد منطقه باید منحصر به فرد باشد</div>
              </div>
              
              <div className="col-md-12 mb-3">
                <label htmlFor="location" className="form-label">موقعیت منطقه</label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              
              <div className="col-md-12 mb-3">
                <label htmlFor="description" className="form-label">توضیحات</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/areas')}
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
                  isEditMode ? 'بروزرسانی منطقه' : 'ثبت منطقه'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AreaForm; 