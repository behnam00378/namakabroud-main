import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import GuardService from '../../services/guardService';
import Alert from '../../components/layout/Alert';
import { useAuth } from '../../context/AuthContext';

const GuardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser && currentUser.role === 'admin';

  const [guard, setGuard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchGuard();
  }, [id]);

  const fetchGuard = async () => {
    try {
      setLoading(true);
      const response = await GuardService.getGuardById(id);
      setGuard(response.data);
    } catch (err) {
      console.error('Error fetching guard:', err);
      setError('خطا در دریافت اطلاعات نگهبان');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('آیا از حذف این نگهبان اطمینان دارید؟')) {
      try {
        setDeleteLoading(true);
        await GuardService.deleteGuard(id);
        navigate('/guards');
      } catch (err) {
        console.error('Error deleting guard:', err);
        setError('خطا در حذف نگهبان');
        setDeleteLoading(false);
      }
    }
  };
  
  const getRoleName = (role) => {
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

  const getStatusName = (status) => {
    switch (status) {
      case 'active':
        return 'فعال';
      case 'inactive':
        return 'غیرفعال';
      case 'on-leave':
        return 'در مرخصی';
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success';
      case 'inactive':
        return 'bg-danger';
      case 'on-leave':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
        <p className="mt-2">در حال دریافت اطلاعات نگهبان...</p>
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="danger" onClose={() => setError('')} />;
  }

  if (!guard) {
    return <div className="alert alert-info">نگهبان یافت نشد.</div>;
  }

  return (
    <div className="guard-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>اطلاعات نگهبان</h1>
        <div>
          <Link to="/guards" className="btn btn-outline-secondary ms-2">
            <i className="bi bi-arrow-right me-1"></i> بازگشت به لیست
          </Link>
          {isAdmin && (
            <>
              <Link to={`/guards/edit/${guard._id}`} className="btn btn-warning ms-2">
                <i className="bi bi-pencil me-1"></i> ویرایش
              </Link>
              <button 
                className="btn btn-danger" 
                onClick={handleDelete} 
                disabled={deleteLoading || guard._id === currentUser.id}
              >
                {deleteLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    در حال حذف...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash me-1"></i> حذف
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">اطلاعات شخصی</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <strong>نام و نام خانوادگی:</strong> {guard.name}
            </div>
            <div className="col-md-6 mb-3">
              <strong>ایمیل:</strong> {guard.email}
            </div>
            <div className="col-md-6 mb-3">
              <strong>شماره تماس:</strong> {guard.phoneNumber || 'ثبت نشده'}
            </div>
            <div className="col-md-6 mb-3">
              <strong>نقش:</strong> {getRoleName(guard.role)}
            </div>
            <div className="col-md-6 mb-3">
              <strong>وضعیت:</strong> 
              <span className={`badge ${getStatusBadgeClass(guard.status)} ms-2`}>
                {getStatusName(guard.status)}
              </span>
            </div>
            <div className="col-md-6 mb-3">
              <strong>تاریخ ثبت:</strong> {new Date(guard.createdAt).toLocaleDateString('fa-IR')}
            </div>
          </div>
        </div>
      </div>

      {/* Additional sections could be added here, such as shift history, leave records, etc. */}
    </div>
  );
};

export default GuardDetail; 