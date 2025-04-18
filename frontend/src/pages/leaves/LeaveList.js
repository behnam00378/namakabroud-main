import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LeaveService from '../../services/leaveService';
import Alert from '../../components/layout/Alert';
import { useAuth } from '../../context/AuthContext';

const LeaveList = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { currentUser } = useAuth();
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'supervisor');

  useEffect(() => {
    fetchLeaves();
  }, [currentUser]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      let response;
      
      if (isAdmin) {
        response = await LeaveService.getAllLeaves();
      } else {
        // For guards, fetch only their own leaves
        response = await LeaveService.getLeavesByGuard(currentUser.id);
      }
      
      // Extract data from the response
      const leavesData = response.data?.data || [];
      setLeaves(leavesData);
    } catch (err) {
      console.error('Error fetching leaves:', err);
      setError(err.response?.data?.message || 'خطا در دریافت لیست مرخصی‌ها');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
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

  const getLeaveTypeName = (type) => {
    switch (type) {
      case 'regular':
        return 'استحقاقی';
      case 'sick':
        return 'استعلاجی';
      default:
        return type;
    }
  };

  // Display formatted date (use persianStartDate/persianEndDate if available)
  const formatDate = (dateString, persianDate) => {
    if (persianDate) return persianDate;
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // Filter leaves based on search term and status filter
  const filteredLeaves = leaves.filter(leave => {
    // Handle guard name in different structures
    const guardName = typeof leave.guardId === 'object' ? leave.guardId?.name : '';
    const replacementName = typeof leave.replacementGuardId === 'object' ? leave.replacementGuardId?.name : '';
    
    const searchMatches = 
      (guardName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (replacementName?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const statusMatches = statusFilter === 'all' || leave.status === statusFilter;
    
    return searchMatches && statusMatches;
  });

  return (
    <div className="leave-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>مدیریت مرخصی‌ها</h1>
        <Link to="/leaves/new" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i>
          درخواست مرخصی جدید
        </Link>
      </div>

      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}

      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="جستجو بر اساس نام نگهبان..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="در انتظار">در انتظار بررسی</option>
                <option value="تأیید شده">تایید شده</option>
                <option value="رد شده">رد شده</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
          <p className="mt-2">در حال دریافت لیست مرخصی‌ها...</p>
        </div>
      ) : filteredLeaves.length === 0 ? (
        <div className="alert alert-info">
          هیچ مرخصی‌ای یافت نشد!
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>نگهبان</th>
                <th>از تاریخ</th>
                <th>تا تاریخ</th>
                <th>نوع مرخصی</th>
                <th>وضعیت</th>
                <th>جایگزین</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map(leave => (
                <tr key={leave._id}>
                  <td>{typeof leave.guardId === 'object' ? leave.guardId?.name : '-'}</td>
                  <td>{formatDate(leave.startDate, leave.persianStartDate)}</td>
                  <td>{formatDate(leave.endDate, leave.persianEndDate)}</td>
                  <td>{getLeaveTypeName(leave.type)}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(leave.status)}`}>
                      {getStatusName(leave.status)}
                    </span>
                  </td>
                  <td>{typeof leave.replacementGuardId === 'object' ? leave.replacementGuardId?.name : '-'}</td>
                  <td>
                    <div className="btn-group">
                      <Link 
                        to={`/leaves/${leave._id}`} 
                        className="btn btn-sm btn-info"
                        title="مشاهده جزئیات"
                      >
                        <i className="bi bi-eye"></i>
                      </Link>
                      
                      {/* Edit button only for pending leaves */}
                      {leave.status === 'در انتظار' && (
                        <Link 
                          to={`/leaves/${leave._id}/edit`} 
                          className="btn btn-sm btn-warning"
                          title="ویرایش"
                        >
                          <i className="bi bi-pencil"></i>
                        </Link>
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

export default LeaveList; 