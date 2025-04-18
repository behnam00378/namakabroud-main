import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ShiftService from '../../services/shiftService';
import GuardService from '../../services/guardService';
import AreaService from '../../services/areaService';
import Alert from '../../components/layout/Alert';
import { formatPersianDate } from '../../utils/helpers';

const FixedAreaGuards = () => {
  const [guardAssignments, setGuardAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    fetchFixedAreaGuards();
  }, []);

  const fetchFixedAreaGuards = async () => {
    try {
      setLoading(true);
      
      // Get all guards
      const guardsResponse = await GuardService.getAllGuards();
      const guards = guardsResponse.data || [];
      
      // Get all areas
      const areasResponse = await AreaService.getAllAreas();
      const areas = areasResponse.data || [];
      
      // Get all shifts for the last 30 days
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const shiftsResponse = await ShiftService.getAllShifts({
        startTime: { $gte: thirtyDaysAgo.toISOString() }
      });
      const shifts = shiftsResponse.data || [];
      
      // Calculate most frequent area for each guard
      const guardAreaCount = {};
      
      shifts.forEach(shift => {
        const guardId = shift.guardId?._id || shift.guardId;
        const areaId = shift.areaId?._id || shift.areaId;
        
        if (!guardId || !areaId) return;
        
        if (!guardAreaCount[guardId]) {
          guardAreaCount[guardId] = {};
        }
        
        if (!guardAreaCount[guardId][areaId]) {
          guardAreaCount[guardId][areaId] = 0;
        }
        
        guardAreaCount[guardId][areaId]++;
      });
      
      // Find fixed area for each guard (more than 70% of shifts in one area)
      const fixedAssignments = [];
      
      Object.keys(guardAreaCount).forEach(guardId => {
        const areaCount = guardAreaCount[guardId];
        const totalShifts = Object.values(areaCount).reduce((a, b) => a + b, 0);
        
        // Find the most frequent area
        let maxCount = 0;
        let mostFrequentAreaId = null;
        
        Object.keys(areaCount).forEach(areaId => {
          if (areaCount[areaId] > maxCount) {
            maxCount = areaCount[areaId];
            mostFrequentAreaId = areaId;
          }
        });
        
        // Check if guard has more than 70% shifts in one area
        if (mostFrequentAreaId && (maxCount / totalShifts) >= 0.7) {
          const guard = guards.find(g => g._id === guardId || g._id === guardId);
          const area = areas.find(a => a._id === mostFrequentAreaId || a._id === mostFrequentAreaId);
          
          if (guard && area) {
            fixedAssignments.push({
              guard,
              area,
              percentage: Math.round((maxCount / totalShifts) * 100),
              shiftsCount: maxCount,
              totalShifts
            });
          }
        }
      });
      
      setGuardAssignments(fixedAssignments);
    } catch (err) {
      console.error('Error fetching fixed area guards:', err);
      setError('خطا در دریافت اطلاعات نگهبانان با منطقه ثابت');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 500);
  };

  return (
    <div className={`fixed-area-guards ${printMode ? 'print-mode' : ''}`}>
      {!printMode && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>نگهبانان با منطقه ثابت</h1>
          <div>
            <button onClick={handlePrint} className="btn btn-primary">
              <i className="bi bi-printer me-1"></i> چاپ گزارش
            </button>
          </div>
        </div>
      )}

      {printMode && (
        <div className="text-center mb-4 print-header">
          <h1>گزارش نگهبانان با منطقه ثابت</h1>
          <p>تاریخ گزارش: {formatPersianDate(new Date())}</p>
        </div>
      )}

      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
          <p className="mt-2">در حال دریافت اطلاعات...</p>
        </div>
      ) : guardAssignments.length === 0 ? (
        <div className="alert alert-info">هیچ نگهبانی با منطقه ثابت یافت نشد.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>نام نگهبان</th>
                <th>منطقه ثابت</th>
                <th>درصد حضور</th>
                <th>تعداد شیفت‌ها</th>
                {!printMode && <th>عملیات</th>}
              </tr>
            </thead>
            <tbody>
              {guardAssignments.map((assignment, index) => (
                <tr key={assignment.guard._id}>
                  <td>{index + 1}</td>
                  <td>{assignment.guard.name}</td>
                  <td>{assignment.area.name}</td>
                  <td>
                    <div className="progress">
                      <div
                        className={`progress-bar ${assignment.percentage >= 90 ? 'bg-success' : 'bg-info'}`}
                        role="progressbar"
                        style={{ width: `${assignment.percentage}%` }}
                        aria-valuenow={assignment.percentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        {assignment.percentage}%
                      </div>
                    </div>
                  </td>
                  <td>{assignment.shiftsCount} از {assignment.totalShifts} شیفت</td>
                  {!printMode && (
                    <td>
                      <Link to={`/guards/${assignment.guard._id}`} className="btn btn-sm btn-info text-white me-1">
                        <i className="bi bi-person"></i> مشاهده نگهبان
                      </Link>
                      <Link to={`/areas/${assignment.area._id}`} className="btn btn-sm btn-secondary">
                        <i className="bi bi-geo-alt"></i> مشاهده منطقه
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!printMode && (
        <div className="mt-4">
          <p className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            نگهبان‌هایی که بیش از 70٪ شیفت‌های آنها در یک منطقه ثابت است در این گزارش نمایش داده می‌شوند. 
            این گزارش بر اساس داده‌های 30 روز اخیر تهیه شده است.
          </p>
        </div>
      )}

      <style>{`
        @media print {
          .print-mode .btn,
          .print-mode .alert-dismissible .btn-close {
            display: none !important;
          }
          
          body {
            font-family: 'Tahoma', 'Vazirmatn', sans-serif;
          }
          
          .print-header {
            margin-bottom: 20px;
          }
          
          .table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .table th, .table td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          
          .progress {
            background-color: #f5f5f5;
            border-radius: 4px;
            height: 20px;
          }
          
          .progress-bar {
            height: 100%;
            text-align: center;
            color: white;
          }
          
          .bg-success {
            background-color: #28a745 !important;
          }
          
          .bg-info {
            background-color: #17a2b8 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FixedAreaGuards; 