import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AreaService from '../../services/areaService';
import Alert from '../../components/layout/Alert';
import { useAuth } from '../../context/AuthContext';

const AreaList = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { currentUser } = useAuth();
  const isAdmin = currentUser && currentUser.role === 'admin';

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const response = await AreaService.getAllAreas();
      setAreas(response.data || []);
    } catch (err) {
      console.error('Error fetching areas:', err);
      setError('خطا در دریافت اطلاعات مناطق');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('آیا از حذف این منطقه اطمینان دارید؟')) {
      try {
        await AreaService.deleteArea(id);
        setAreas(areas.filter(area => area._id !== id));
        setSuccessMessage('منطقه با موفقیت حذف شد');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        console.error('Error deleting area:', err);
        setError('خطا در حذف منطقه');
      }
    }
  };

  return (
    <div className="area-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>مناطق</h1>
        {isAdmin && (
          <Link to="/areas/create" className="btn btn-primary">
            <i className="bi bi-plus-lg me-1"></i> افزودن منطقه جدید
          </Link>
        )}
      </div>

      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}
      {successMessage && <Alert message={successMessage} type="success" onClose={() => setSuccessMessage('')} />}

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
          <p className="mt-2">در حال دریافت اطلاعات...</p>
        </div>
      ) : areas.length === 0 ? (
        <div className="alert alert-info">هیچ منطقه‌ای یافت نشد.</div>
      ) : (
        <div className="row">
          {areas.map((area) => (
            <div className="col-md-6 col-lg-4 mb-4" key={area._id}>
              <div className="card h-100">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{area.name}</h5>
                  <span className="badge bg-primary">{area.code}</span>
                </div>
                <div className="card-body">
                  <p className="card-text">
                    <strong>موقعیت:</strong> {area.location || 'ثبت نشده'}
                  </p>
                  <p className="card-text">
                    <strong>توضیحات:</strong> {area.description || 'بدون توضیحات'}
                  </p>
                </div>
                <div className="card-footer d-flex justify-content-between">
                  <Link to={`/areas/${area._id}`} className="btn btn-info text-white">
                    <i className="bi bi-eye me-1"></i> مشاهده
                  </Link>
                  {isAdmin && (
                    <div>
                      <Link to={`/areas/edit/${area._id}`} className="btn btn-warning text-white me-2">
                        <i className="bi bi-pencil"></i> ویرایش
                      </Link>
                      <button
                        onClick={() => handleDelete(area._id)}
                        className="btn btn-danger"
                      >
                        <i className="bi bi-trash"></i> حذف
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AreaList; 