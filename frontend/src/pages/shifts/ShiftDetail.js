import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ShiftService from '../../services/shiftService';
import Alert from '../../components/layout/Alert';
import { useAuth } from '../../context/AuthContext';
import { formatPersianDate } from '../../utils/helpers';

const ShiftDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'supervisor');

  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);

  useEffect(() => {
    fetchShift();
  }, [id]);

  const fetchShift = async () => {
    try {
      setLoading(true);
      const response = await ShiftService.getShiftById(id);
      setShift(response.data);
    } catch (err) {
      console.error('Error fetching shift:', err);
      setError('خطا در دریافت اطلاعات شیفت');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('آیا از حذف این شیفت اطمینان دارید؟')) {
      try {
        setDeleteLoading(true);
        await ShiftService.deleteShift(id);
        navigate('/shifts');
      } catch (err) {
        console.error('Error deleting shift:', err);
        setError('خطا در حذف شیفت');
        setDeleteLoading(false);
      }
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdateStatusLoading(true);
      await ShiftService.updateShift(id, { 
        ...shift,
        status: newStatus 
      });
      
      // Update local shift data
      setShift({
        ...shift,
        status: newStatus
      });
      
      setUpdateStatusLoading(false);
    } catch (err) {
      console.error('Error updating shift status:', err);
      setError('خطا در بروزرسانی وضعیت شیفت');
      setUpdateStatusLoading(false);
    }
  };
  
  const getStatusName = (status) => {
    switch (status) {
      case 'completed':
        return 'انجام شده';
      case 'scheduled':
        return 'برنامه‌ریزی شده';
      case 'cancelled':
        return 'لغو شده';
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success';
      case 'scheduled':
        return 'bg-info';
      case 'cancelled':
        return 'bg-danger';
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
        <p className="mt-2">در حال دریافت اطلاعات شیفت...</p>
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="danger" onClose={() => setError('')} />;
  }

  if (!shift) {
    return <div className="alert alert-info">شیفت یافت نشد.</div>;
  }

  return (
    <div className="shift-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>اطلاعات شیفت</h1>
        <div>
          <Link to="/shifts" className="btn btn-outline-secondary ms-2">
            <i className="bi bi-arrow-right me-1"></i> بازگشت به لیست
          </Link>
          {isAdmin && (
            <>
              <Link to={`/shifts/edit/${shift._id}`} className="btn btn-warning ms-2">
                <i className="bi bi-pencil me-1"></i> ویرایش
              </Link>
              <button 
                className="btn btn-danger" 
                onClick={handleDelete} 
                disabled={deleteLoading}
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
          <h5 className="mb-0">جزئیات شیفت</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <strong>تاریخ:</strong> {formatPersianDate(shift.date)}
            </div>
            <div className="col-md-6 mb-3">
              <strong>ساعت:</strong> {shift.startTime} - {shift.endTime}
            </div>
            <div className="col-md-6 mb-3">
              <strong>نگهبان:</strong> {
                shift.guard ? (
                  <Link to={`/guards/${shift.guard._id}`}>{shift.guard.name}</Link>
                ) : 'تعیین نشده'
              }
            </div>
            <div className="col-md-6 mb-3">
              <strong>منطقه:</strong> {
                shift.area ? (
                  <Link to={`/areas/${shift.area._id}`}>{shift.area.name}</Link>
                ) : 'تعیین نشده'
              }
            </div>
            <div className="col-md-6 mb-3">
              <strong>وضعیت:</strong> 
              <span className={`badge ${getStatusBadgeClass(shift.status)} ms-2`}>
                {getStatusName(shift.status)}
              </span>
            </div>
            {shift.notes && (
              <div className="col-12 mb-3">
                <strong>یادداشت‌ها:</strong>
                <p className="mt-2">{shift.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="card">
          <div className="card-header bg-light">
            <h5 className="mb-0">عملیات</h5>
          </div>
          <div className="card-body">
            <div className="d-flex gap-2">
              {shift.status !== 'completed' && (
                <button 
                  className="btn btn-success"
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={updateStatusLoading}
                >
                  <i className="bi bi-check-circle me-1"></i> علامت‌گذاری به عنوان انجام شده
                </button>
              )}
              
              {shift.status !== 'cancelled' && (
                <button 
                  className="btn btn-danger"
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={updateStatusLoading}
                >
                  <i className="bi bi-x-circle me-1"></i> لغو شیفت
                </button>
              )}
              
              {shift.status !== 'scheduled' && (
                <button 
                  className="btn btn-info text-white"
                  onClick={() => handleStatusUpdate('scheduled')}
                  disabled={updateStatusLoading}
                >
                  <i className="bi bi-calendar-check me-1"></i> برنامه‌ریزی مجدد
                </button>
              )}
              
              {updateStatusLoading && (
                <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftDetail; 