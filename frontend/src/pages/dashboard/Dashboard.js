import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GuardService from '../../services/guardService';
import AreaService from '../../services/areaService';
import ShiftService from '../../services/shiftService';
import LeaveService from '../../services/leaveService';
import Alert from '../../components/layout/Alert';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    guards: 0,
    areas: 0,
    shifts: 0,
    pendingLeaves: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const guardsRes = await GuardService.getAllGuards();
        const areasRes = await AreaService.getAllAreas();
        const shiftsRes = await ShiftService.getAllShifts();
        const leavesRes = await LeaveService.getAllLeaves({ status: 'در انتظار' });

        setStats({
          guards: guardsRes.count || 0,
          areas: areasRes.count || 0,
          shifts: shiftsRes.count || 0,
          pendingLeaves: leavesRes.count || 0
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('خطا در دریافت اطلاعات داشبورد. لطفا صفحه را رفرش کنید.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard">
      <h1 className="mb-4">داشبورد</h1>
      
      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}
      
      <div className="row">
        <div className="col-md-6 col-lg-3 mb-4">
          <div className="card bg-primary text-white h-100">
            <div className="card-body">
              <h5 className="card-title">نگهبانان</h5>
              <p className="card-text display-4">{loading ? '...' : stats.guards}</p>
            </div>
            <div className="card-footer d-flex justify-content-between align-items-center">
              <Link to="/guards" className="text-white">مشاهده همه</Link>
              <i className="bi bi-person-fill"></i>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-3 mb-4">
          <div className="card bg-success text-white h-100">
            <div className="card-body">
              <h5 className="card-title">مناطق</h5>
              <p className="card-text display-4">{loading ? '...' : stats.areas}</p>
            </div>
            <div className="card-footer d-flex justify-content-between align-items-center">
              <Link to="/areas" className="text-white">مشاهده همه</Link>
              <i className="bi bi-geo-alt-fill"></i>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-3 mb-4">
          <div className="card bg-info text-white h-100">
            <div className="card-body">
              <h5 className="card-title">شیفت‌ها</h5>
              <p className="card-text display-4">{loading ? '...' : stats.shifts}</p>
            </div>
            <div className="card-footer d-flex justify-content-between align-items-center">
              <Link to="/shifts" className="text-white">مشاهده همه</Link>
              <i className="bi bi-clock-fill"></i>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-3 mb-4">
          <div className="card bg-warning text-dark h-100">
            <div className="card-body">
              <h5 className="card-title">مرخصی‌های در انتظار</h5>
              <p className="card-text display-4">{loading ? '...' : stats.pendingLeaves}</p>
            </div>
            <div className="card-footer d-flex justify-content-between align-items-center">
              <Link to="/leaves" className="text-dark">مشاهده همه</Link>
              <i className="bi bi-calendar-check-fill"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              دسترسی سریع
            </div>
            <div className="card-body">
              <div className="list-group">
                <Link to="/shifts/generate" className="list-group-item list-group-item-action">
                  <i className="bi bi-calendar-plus me-2"></i>
                  تولید شیفت‌های هفتگی
                </Link>
                <Link to="/leaves/create" className="list-group-item list-group-item-action">
                  <i className="bi bi-calendar-plus me-2"></i>
                  ثبت درخواست مرخصی جدید
                </Link>
                {(currentUser.role === 'admin' || currentUser.role === 'supervisor') && (
                  <Link to="/leaves/pending" className="list-group-item list-group-item-action">
                    <i className="bi bi-check-circle me-2"></i>
                    رسیدگی به درخواست‌های مرخصی
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              خوش آمدید
            </div>
            <div className="card-body">
              <h5 className="card-title">{currentUser.name} عزیز، خوش آمدید!</h5>
              <p className="card-text">
                به سیستم مدیریت نگهبانان خوش آمدید. از این پنل می‌توانید وظایف مختلف مدیریتی را انجام دهید.
              </p>
              <p className="card-text">
                <strong>نقش شما:</strong> {currentUser.role === 'admin' ? 'مدیر' : currentUser.role === 'supervisor' ? 'گشت' : 'نگهبان'}
              </p>
              <p className="card-text">
                <strong>آخرین ورود:</strong> {new Date().toLocaleDateString('fa-IR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 