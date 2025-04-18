import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import LeaveService from '../../services/leaveService';
import Alert from '../../components/layout/Alert';
import { useAuth } from '../../context/AuthContext';
import { formatPersianDate } from '../../utils/helpers';

const LeaveDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'supervisor');
  const isGuard = currentUser && currentUser.role === 'guard';

  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchLeave();
  }, [id]);

  const fetchLeave = async () => {
    try {
      setLoading(true);
      const response = await LeaveService.getLeaveById(id);
      
      // Check if the response structure is as expected
      const leaveData = response.data?.data || response.data;
      
      if (!leaveData || Object.keys(leaveData).length === 0) {
        setError('مرخصی مورد نظر یافت نشد');
        setLeave(null);
        return;
      }
      
      setLeave(leaveData);
      setError(''); // Clear any existing errors
    } catch (err) {
      console.error('Error fetching leave:', err);
      setError(err.response?.data?.message || 'خطا در دریافت اطلاعات مرخصی');
      setLeave(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('آیا از حذف این مرخصی اطمینان دارید؟')) {
      try {
        setDeleteLoading(true);
        await LeaveService.deleteLeave(id);
        setSuccessMessage('مرخصی با موفقیت حذف شد');
        
        // Redirect to leaves list after 2 seconds
        setTimeout(() => {
          navigate('/leaves');
        }, 2000);
      } catch (err) {
        console.error('Error deleting leave:', err);
        setError(err.response?.data?.message || 'خطا در حذف مرخصی');
        setDeleteLoading(false);
      }
    }
  };

  const handleApproveLeave = async () => {
    if (window.confirm('آیا از تایید این مرخصی اطمینان دارید؟')) {
      try {
        setActionLoading(true);
        await LeaveService.approveLeave(id);
        setSuccessMessage('مرخصی با موفقیت تایید شد');
        fetchLeave(); // Refresh leave data
      } catch (err) {
        console.error('Error approving leave:', err);
        setError(err.response?.data?.message || 'خطا در تایید مرخصی');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleRejectLeave = async () => {
    const reason = window.prompt('لطفا دلیل رد درخواست را وارد کنید:');
    if (reason !== null) {
      try {
        setActionLoading(true);
        await LeaveService.rejectLeave(id, { reason });
        setSuccessMessage('مرخصی با موفقیت رد شد');
        fetchLeave(); // Refresh leave data
      } catch (err) {
        console.error('Error rejecting leave:', err);
        setError(err.response?.data?.message || 'خطا در رد مرخصی');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const getStatusName = (status) => {
    switch (status) {
      case 'در انتظار':
        return 'در انتظار بررسی';
      case 'تأیید شده':
        return 'تایید شده';
      case 'رد شده':
        return 'رد شده';
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'در انتظار':
        return 'bg-warning';
      case 'تأیید شده':
        return 'bg-success';
      case 'رد شده':
        return 'bg-danger';
      default:
        return 'bg-info';
    }
  };

  const canEdit = () => {
    if (!leave) return false;
    if (isAdmin) return true;
    if (isGuard && leave.guardId && leave.guardId._id === currentUser.id && leave.status === 'در انتظار') return true;
    return false;
  };

  const formatDate = (dateString, persianDate) => {
    if (persianDate) return persianDate;
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
        <p className="mt-2">در حال دریافت اطلاعات مرخصی...</p>
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="alert alert-danger">
        مرخصی مورد نظر یافت نشد یا شما دسترسی لازم را ندارید.
      </div>
    );
  }

  // Check if guard can view this leave
  if (isGuard && leave) {
    const guardIdValue = leave.guardId?._id || leave.guardId;
    if (guardIdValue && guardIdValue !== currentUser.id) {
      return <div className="alert alert-danger">شما دسترسی به مشاهده این مرخصی را ندارید.</div>;
    }
  }

  return (
    <div className="leave-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>جزئیات مرخصی</h1>
        <div>
          <Link to="/leaves" className="btn btn-outline-secondary me-2">
            <i className="bi bi-arrow-right me-1"></i>
            بازگشت به لیست
          </Link>
          
          {leave.status === 'در انتظار' && (
            <>
              {isAdmin && (
                <>
                  <button 
                    className="btn btn-success me-2" 
                    onClick={handleApproveLeave}
                  >
                    <i className="bi bi-check-lg me-1"></i>
                    تایید مرخصی
                  </button>
                  <button 
                    className="btn btn-danger me-2" 
                    onClick={handleRejectLeave}
                  >
                    <i className="bi bi-x-lg me-1"></i>
                    رد مرخصی
                  </button>
                </>
              )}
              
              {(isAdmin || (currentUser.id === leave.guardId._id)) && (
                <>
                  <Link 
                    to={`/leaves/${leave._id}/edit`} 
                    className="btn btn-warning me-2"
                  >
                    <i className="bi bi-pencil me-1"></i>
                    ویرایش
                  </Link>
                  <button 
                    className="btn btn-danger" 
                    onClick={handleDelete}
                  >
                    <i className="bi bi-trash me-1"></i>
                    حذف مرخصی
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}
      {successMessage && <Alert message={successMessage} type="success" onClose={() => setSuccessMessage('')} />}

      <div className="card mb-4">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">وضعیت مرخصی</h5>
          <span className={`badge ${getStatusBadgeClass(leave.status)}`}>
            {getStatusName(leave.status)}
          </span>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <p className="fw-bold mb-1">نگهبان:</p>
              <p>
                {leave.guardId ? (
                  <Link to={`/guards/${leave.guardId._id || leave.guardId}`}>
                    {leave.guardId.name || (typeof leave.guardId === 'string' ? 'نگهبان' : '')}
                  </Link>
                ) : '-'}
              </p>
            </div>
            <div className="col-md-6 mb-3">
              <p className="fw-bold mb-1">نگهبان جایگزین:</p>
              <p>
                {leave.replacementGuardId ? (
                  <Link to={`/guards/${leave.replacementGuardId._id || leave.replacementGuardId}`}>
                    {leave.replacementGuardId.name || (typeof leave.replacementGuardId === 'string' ? 'جایگزین' : '')}
                  </Link>
                ) : (
                  <span className="text-muted">تعیین نشده</span>
                )}
              </p>
            </div>
            <div className="col-md-6 mb-3">
              <p className="fw-bold mb-1">از تاریخ:</p>
              <p>{formatDate(leave.startDate, leave.persianStartDate)}</p>
            </div>
            <div className="col-md-6 mb-3">
              <p className="fw-bold mb-1">تا تاریخ:</p>
              <p>{formatDate(leave.endDate, leave.persianEndDate)}</p>
            </div>
            <div className="col-md-6 mb-3">
              <p className="fw-bold mb-1">نوع مرخصی:</p>
              <p>{leave.type === 'sick' ? 'استعلاجی' : 'استحقاقی'}</p>
            </div>
            <div className="col-md-6 mb-3">
              <p className="fw-bold mb-1">تاریخ درخواست:</p>
              <p>{formatDate(leave.createdAt)}</p>
            </div>
            <div className="col-md-12 mb-3">
              <p className="fw-bold mb-1">دلیل مرخصی:</p>
              <p>{leave.reason || <span className="text-muted">دلیلی ذکر نشده است</span>}</p>
            </div>
            
            {leave.status === 'رد شده' && leave.rejectionReason && (
              <div className="col-md-12 mb-3">
                <p className="fw-bold mb-1">دلیل رد مرخصی:</p>
                <p className="text-danger">{leave.rejectionReason}</p>
              </div>
            )}
            
            {leave.status === 'تأیید شده' && leave.approvedBy && (
              <div className="col-md-12">
                <p className="fw-bold mb-1">تایید توسط:</p>
                <p>{leave.approvedBy.name} در تاریخ {formatDate(leave.approvedAt)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveDetail; 