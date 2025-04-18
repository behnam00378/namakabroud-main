import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.rtl.min.css';
import './App.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Layout components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth pages
import Login from './pages/auth/Login';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Guards pages
import GuardList from './pages/guards/GuardList';
import GuardDetail from './pages/guards/GuardDetail';
import GuardForm from './pages/guards/GuardForm';

// Areas pages
import AreaList from './pages/areas/AreaList';
import AreaDetail from './pages/areas/AreaDetail';
import AreaForm from './pages/areas/AreaForm';

// Shifts pages
import ShiftList from './pages/shifts/ShiftList';
import ShiftDetail from './pages/shifts/ShiftDetail';
import ShiftForm from './pages/shifts/ShiftForm';
import ShiftGenerator from './pages/shifts/ShiftGenerator';
import FixedAreaGuards from './pages/shifts/FixedAreaGuards';

// Leaves pages
import LeaveList from './pages/leaves/LeaveList';
import LeaveDetail from './pages/leaves/LeaveDetail';
import LeaveForm from './pages/leaves/LeaveForm';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Guards routes */}
              <Route path="/guards" element={<GuardList />} />
              <Route path="/guards/:id" element={<GuardDetail />} />
              <Route path="/guards/create" element={<GuardForm />} />
              <Route path="/guards/edit/:id" element={<GuardForm />} />
              
              {/* Areas routes */}
              <Route path="/areas" element={<AreaList />} />
              <Route path="/areas/:id" element={<AreaDetail />} />
              <Route path="/areas/create" element={<AreaForm />} />
              <Route path="/areas/edit/:id" element={<AreaForm />} />
              
              {/* Shifts routes */}
              <Route path="/shifts" element={<ProtectedRoute><ShiftList /></ProtectedRoute>} />
              <Route path="/shifts/create" element={<ProtectedRoute roles={['admin']}><ShiftForm /></ProtectedRoute>} />
              <Route path="/shifts/generate" element={<ProtectedRoute roles={['admin']}><ShiftGenerator /></ProtectedRoute>} />
              <Route path="/shifts/fixed-area-guards" element={<ProtectedRoute><FixedAreaGuards /></ProtectedRoute>} />
              <Route path="/shifts/edit/:id" element={<ProtectedRoute roles={['admin']}><ShiftForm /></ProtectedRoute>} />
              <Route path="/shifts/:id" element={<ProtectedRoute><ShiftDetail /></ProtectedRoute>} />
              
              {/* Leaves routes */}
              <Route path="/leaves" element={<LeaveList />} />
              <Route path="/leaves/:id" element={<LeaveDetail />} />
              <Route path="/leaves/new" element={<LeaveForm />} />
              <Route path="/leaves/:id/edit" element={<LeaveForm />} />
            </Route>
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
