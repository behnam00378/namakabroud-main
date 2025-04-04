import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import AreaService from '../../services/areaService';
import ShiftService from '../../services/shiftService';
import Alert from '../../components/layout/Alert';
import { useAuth } from '../../context/AuthContext';

const AreaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser && currentUser.role === 'admin';

  const [area, setArea] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shiftsLoading, setShiftsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchArea();
    fetchAreaShifts();
  }, [id]);

  const fetchArea = async () => {
    try {
      setLoading(true);
      const response = await AreaService.getAreaById(id);
      setArea(response.data);
    } catch (err) {
      console.error('Error fetching area:', err);
      setError('خطا در دریافت اطلاعات منطقه');
    } finally {
      setLoading(false);
    }
  };

  const fetchAreaShifts = async () => {
    try {
      setShiftsLoading(true);
      const response = await ShiftService.getShiftsByArea(id);
      setShifts(response.data || []);
    } catch (err) {
      console.error('Error fetching area shifts:', err);
      // Not setting the error here to avoid showing multiple error messages
    } finally {
      setShiftsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('آیا از حذف این منطقه اطمینان دارید؟')) {
      try {
        setDeleteLoading(true);
        await AreaService.deleteArea(id);
        navigate('/areas');
      } catch (err) {
        console.error('Error deleting area:', err);
        setError('خطا در حذف منطقه');
        setDeleteLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
        <p className="mt-2">در حال دریافت اطلاعات منطقه...</p>
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="danger" onClose={() => setError('')} />;
  }

  if (!area) {
    return <div className="alert alert-info">منطقه یافت نشد.</div>;
  }

  return (
    <div className="area-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>اطلاعات منطقه</h1>
        <div>
          <Link to="/areas" className="btn btn-outline-secondary ms-2">
            <i className="bi bi-arrow-right me-1"></i> بازگشت به لیست
          </Link>
          {isAdmin && (
            <>
              <Link to={`/areas/edit/${area._id}`} className="btn btn-warning ms-2">
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
          <h5 className="mb-0">جزئیات منطقه</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <strong>نام منطقه:</strong> {area.name}
            </div>
            <div className="col-md-6 mb-3">
              <strong>کد منطقه:</strong> {area.code}
            </div>
            <div className="col-md-6 mb-3">
              <strong>موقعیت:</strong> {area.location || 'ثبت نشده'}
            </div>
            <div className="col-md-6 mb-3">
              <strong>تاریخ ثبت:</strong> {new Date(area.createdAt).toLocaleDateString('fa-IR')}
            </div>
            {area.description && (
              <div className="col-12 mb-3">
                <strong>توضیحات:</strong>
                <p className="mt-2">{area.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-light">
          <h5 className="mb-0">شیفت‌های اخیر در این منطقه</h5>
        </div>
        <div className="card-body">
          {shiftsLoading ? (
            <div className="text-center my-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">در حال بارگذاری...</span>
              </div>
              <p className="mt-2">در حال دریافت شیفت‌ها...</p>
            </div>
          ) : shifts.length === 0 ? (
            <div className="alert alert-info">هیچ شیفتی برای این منطقه ثبت نشده است.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>تاریخ</th>
                    <th>ساعت</th>
                    <th>نگهبان</th>
                    <th>وضعیت</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.slice(0, 5).map((shift) => (
                    <tr key={shift._id}>
                      <td>{new Date(shift.date).toLocaleDateString('fa-IR')}</td>
                      <td>{shift.startTime} - {shift.endTime}</td>
                      <td>{shift.guard?.name || 'تعیین نشده'}</td>
                      <td>
                        <span className={`badge ${
                          shift.status === 'completed' ? 'bg-success' : 
                          shift.status === 'scheduled' ? 'bg-info' : 
                          shift.status === 'cancelled' ? 'bg-danger' : 
                          'bg-secondary'
                        }`}>
                          {shift.status === 'completed' ? 'انجام شده' : 
                           shift.status === 'scheduled' ? 'برنامه‌ریزی شده' : 
                           shift.status === 'cancelled' ? 'لغو شده' : 
                           shift.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/shifts/${shift._id}`} className="btn btn-sm btn-info text-white">
                          <i className="bi bi-eye"></i> مشاهده
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {shifts.length > 5 && (
                <div className="text-center mt-3">
                  <Link to={`/shifts?area=${area._id}`} className="btn btn-outline-primary">
                    مشاهده تمام شیفت‌ها
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AreaDetail; 