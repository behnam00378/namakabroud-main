import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GuardService from '../../services/guardService';
import Alert from '../../components/layout/Alert';
import { useAuth } from '../../context/AuthContext';

const GuardList = () => {
  const [guards, setGuards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { currentUser } = useAuth();
  const isAdmin = currentUser && currentUser.role === 'admin';

  useEffect(() => {
    fetchGuards();
  }, []);

  const fetchGuards = async () => {
    try {
      setLoading(true);
      const response = await GuardService.getAllGuards();
      setGuards(response.data || []);
    } catch (err) {
      console.error('Error fetching guards:', err);
      setError('خطا در دریافت اطلاعات نگهبانان');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('آیا از حذف این نگهبان اطمینان دارید؟')) {
      try {
        await GuardService.deleteGuard(id);
        setGuards(guards.filter(guard => guard._id !== id));
        setSuccessMessage('نگهبان با موفقیت حذف شد');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        console.error('Error deleting guard:', err);
        setError('خطا در حذف نگهبان');
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

  return (
    <div className="guard-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>نگهبانان</h1>
        {isAdmin && (
          <Link to="/guards/create" className="btn btn-primary">
            <i className="bi bi-plus-lg me-1"></i> افزودن نگهبان جدید
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
      ) : guards.length === 0 ? (
        <div className="alert alert-info">هیچ نگهبانی یافت نشد.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>نام</th>
                <th>ایمیل</th>
                <th>شماره تماس</th>
                <th>نقش</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {guards.map((guard) => (
                <tr key={guard._id}>
                  <td>{guard.name}</td>
                  <td>{guard.email}</td>
                  <td>{guard.phoneNumber || '-'}</td>
                  <td>{getRoleName(guard.role)}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(guard.status)}`}>
                      {getStatusName(guard.status)}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <Link to={`/guards/${guard._id}`} className="btn btn-sm btn-info text-white">
                        <i className="bi bi-eye"></i>
                      </Link>
                      {isAdmin && (
                        <>
                          <Link to={`/guards/edit/${guard._id}`} className="btn btn-sm btn-warning text-white">
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button
                            onClick={() => handleDelete(guard._id)}
                            className="btn btn-sm btn-danger"
                            disabled={guard._id === currentUser.id}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GuardList; 