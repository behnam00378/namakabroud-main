import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ShiftService from '../../services/shiftService';
import GuardService from '../../services/guardService';
import AreaService from '../../services/areaService';
import Alert from '../../components/layout/Alert';
import { useAuth } from '../../context/AuthContext';
import { formatPersianDate } from '../../utils/helpers';

const ShiftList = () => {
  const [searchParams] = useSearchParams();
  const guardId = searchParams.get('guard');
  const areaId = searchParams.get('area');

  const [shifts, setShifts] = useState([]);
  const [guards, setGuards] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filters, setFilters] = useState({
    guardId: guardId || '',
    areaId: areaId || '',
    date: '',
    status: ''
  });
  
  const { currentUser } = useAuth();
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'supervisor');

  useEffect(() => {
    fetchShifts();
    fetchGuards();
    fetchAreas();
  }, [guardId, areaId]);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      
      // Prepare filters
      const apiFilters = { ...filters };
      if (guardId) apiFilters.guardId = guardId;
      if (areaId) apiFilters.areaId = areaId;
      
      // Remove empty filters
      Object.keys(apiFilters).forEach(key => 
        !apiFilters[key] && delete apiFilters[key]
      );
      
      const response = await ShiftService.getAllShifts(apiFilters);
      setShifts(response.data || []);
    } catch (err) {
      console.error('Error fetching shifts:', err);
      setError('خطا در دریافت اطلاعات شیفت‌ها');
    } finally {
      setLoading(false);
    }
  };

  const fetchGuards = async () => {
    try {
      const response = await GuardService.getAllGuards();
      setGuards(response.data || []);
    } catch (err) {
      console.error('Error fetching guards:', err);
      // Not setting error here to avoid multiple error messages
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await AreaService.getAllAreas();
      setAreas(response.data || []);
    } catch (err) {
      console.error('Error fetching areas:', err);
      // Not setting error here to avoid multiple error messages
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('آیا از حذف این شیفت اطمینان دارید؟')) {
      try {
        await ShiftService.deleteShift(id);
        setShifts(shifts.filter(shift => shift._id !== id));
        setSuccessMessage('شیفت با موفقیت حذف شد');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        console.error('Error deleting shift:', err);
        setError('خطا در حذف شیفت');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchShifts();
  };

  const resetFilters = () => {
    setFilters({
      guardId: '',
      areaId: '',
      date: '',
      status: ''
    });
    setTimeout(() => {
      fetchShifts();
    }, 0);
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

  return (
    <div className="shift-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>شیفت‌ها</h1>
        <div>
          <Link to="/shifts/generate" className="btn btn-success ms-2">
            <i className="bi bi-calendar-plus me-1"></i> تولید شیفت هفتگی
          </Link>
          {isAdmin && (
            <Link to="/shifts/create" className="btn btn-primary">
              <i className="bi bi-plus-lg me-1"></i> افزودن شیفت جدید
            </Link>
          )}
        </div>
      </div>

      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}
      {successMessage && <Alert message={successMessage} type="success" onClose={() => setSuccessMessage('')} />}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">فیلترها</h5>
        </div>
        <div className="card-body">
          <form onSubmit={applyFilters}>
            <div className="row">
              <div className="col-md-3 mb-3">
                <label htmlFor="guardId" className="form-label">نگهبان</label>
                <select
                  className="form-select"
                  id="guardId"
                  name="guardId"
                  value={filters.guardId}
                  onChange={handleFilterChange}
                >
                  <option value="">همه نگهبانان</option>
                  {guards.map(guard => (
                    <option key={guard._id} value={guard._id}>
                      {guard.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-3 mb-3">
                <label htmlFor="areaId" className="form-label">منطقه</label>
                <select
                  className="form-select"
                  id="areaId"
                  name="areaId"
                  value={filters.areaId}
                  onChange={handleFilterChange}
                >
                  <option value="">همه مناطق</option>
                  {areas.map(area => (
                    <option key={area._id} value={area._id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-3 mb-3">
                <label htmlFor="date" className="form-label">تاریخ</label>
                <input
                  type="date"
                  className="form-control"
                  id="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div className="col-md-3 mb-3">
                <label htmlFor="status" className="form-label">وضعیت</label>
                <select
                  className="form-select"
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">همه وضعیت‌ها</option>
                  <option value="scheduled">برنامه‌ریزی شده</option>
                  <option value="completed">انجام شده</option>
                  <option value="cancelled">لغو شده</option>
                </select>
              </div>
            </div>
            <div className="d-flex justify-content-end">
              <button 
                type="button" 
                className="btn btn-outline-secondary me-2"
                onClick={resetFilters}
              >
                پاک کردن فیلترها
              </button>
              <button type="submit" className="btn btn-primary">
                اعمال فیلترها
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
          <p className="mt-2">در حال دریافت اطلاعات...</p>
        </div>
      ) : shifts.length === 0 ? (
        <div className="alert alert-info">هیچ شیفتی یافت نشد.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>تاریخ</th>
                <th>ساعت</th>
                <th>نگهبان</th>
                <th>منطقه</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift._id}>
                  <td>{formatPersianDate(shift.date)}</td>
                  <td>{shift.startTime} - {shift.endTime}</td>
                  <td>
                    {shift.guard ? (
                      <Link to={`/guards/${shift.guard._id}`}>{shift.guard.name}</Link>
                    ) : (
                      'تعیین نشده'
                    )}
                  </td>
                  <td>
                    {shift.area ? (
                      <Link to={`/areas/${shift.area._id}`}>{shift.area.name}</Link>
                    ) : (
                      'تعیین نشده'
                    )}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(shift.status)}`}>
                      {getStatusName(shift.status)}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <Link to={`/shifts/${shift._id}`} className="btn btn-sm btn-info text-white">
                        <i className="bi bi-eye"></i>
                      </Link>
                      {isAdmin && (
                        <>
                          <Link to={`/shifts/edit/${shift._id}`} className="btn btn-sm btn-warning text-white">
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button
                            onClick={() => handleDelete(shift._id)}
                            className="btn btn-sm btn-danger"
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

export default ShiftList; 