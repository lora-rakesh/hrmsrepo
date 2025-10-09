import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleGuard } from './components/auth/RoleGuard';
import { Toaster } from 'react-hot-toast';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import HRDashboard from './pages/hr/HRDashboard';
import TeamLeadDashboard from './pages/teamlead/TeamLeadDashboard';

// Employee Pages
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeProfile from './pages/employees/EmployeeProfile';
import EmployeeCreate from './pages/employees/EmployeeCreate';
import EmployeeEdit from './pages/employees/EmployeeEdit';

// Leave Pages
import LeaveRequests from './pages/leaves/LeaveRequests';
import LeaveApply from './pages/leaves/LeaveApply';
import LeaveApproval from './pages/leaves/LeaveApproval';

// Payroll Pages
// import PayrollDashboard from './pages/payroll/PayrollDashboard';
// import PayslipGenerate from './pages/payroll/PayslipGenerate';

// Attendance Pages
import AttendanceView from './pages/attendance/AttendanceView';
import AttendanceReports from './pages/attendance/AttendanceReports';
import DetailedAttendance from './pages/attendance/DetailedAttendance';

// Payroll Pages
import PayrollDashboard from './pages/payroll/PayrollDashboard';
import PayslipGenerate from './pages/payroll/PayslipGenerate';
import MyPayslips from './pages/payroll/MyPayslips';

// Calendar Pages
import HolidayCalendar from './pages/calendar/HolidayCalendar';
import AllLeavesList from './pages/leaves/AllLeavesList';

// Profile Pages
import ProfilePage from './pages/profile/ProfilePage';

// Reports Pages
import ReportsDashboard from './pages/reports/ReportsDashboard';

// Settings Pages
import SettingsPage from './pages/settings/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* HR Manager Routes */}
            <Route path="/hr" element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['SUPER_ADMIN', 'HR_MANAGER']}>
                  <HRDashboard />
                </RoleGuard>
              </ProtectedRoute>
            } />
            
            {/* Team Lead Routes */}
            <Route path="/team-lead" element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['SUPER_ADMIN', 'HR_MANAGER', 'TEAM_LEAD']}>
                  <TeamLeadDashboard />
                </RoleGuard>
              </ProtectedRoute>
            } />
            
            {/* Employee Management */}
            <Route path="/employees" element={
              <ProtectedRoute>
                <EmployeeList />
              </ProtectedRoute>
            } />
            
            <Route path="/employees/create" element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['SUPER_ADMIN', 'HR_MANAGER']}>
                  <EmployeeCreate />
                </RoleGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/employees/:id" element={
              <ProtectedRoute>
                <EmployeeProfile />
              </ProtectedRoute>
            } />
            
            <Route path="/employees/:id/edit" element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['SUPER_ADMIN', 'HR_MANAGER']}>
                  <EmployeeEdit />
                </RoleGuard>
              </ProtectedRoute>
            } />
            
            {/* Leave Management */}
            <Route path="/leaves" element={
              <ProtectedRoute>
                <LeaveRequests />
              </ProtectedRoute>
            } />
            
            <Route path="/leaves/apply" element={
              <ProtectedRoute>
                <LeaveApply />
              </ProtectedRoute>
            } />
            
            <Route path="/leaves/approval" element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['SUPER_ADMIN', 'HR_MANAGER', 'TEAM_LEAD']}>
                  <LeaveApproval />
                </RoleGuard>
              </ProtectedRoute>
            } />
            
            {/* Attendance Management */}
            <Route path="/attendance" element={
              <ProtectedRoute>
                <AttendanceView />
              </ProtectedRoute>
            } />
            
            <Route path="/attendance/detailed" element={
              <ProtectedRoute>
                <DetailedAttendance />
              </ProtectedRoute>
            } />
            
            <Route path="/attendance/reports" element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['SUPER_ADMIN', 'HR_MANAGER', 'TEAM_LEAD']}>
                  <AttendanceReports />
                </RoleGuard>
              </ProtectedRoute>
            } />
            
            {/* Calendar and Holidays */}
            <Route path="/calendar" element={
              <ProtectedRoute>
                <HolidayCalendar />
              </ProtectedRoute>
            } />
            
            <Route path="/leaves/all" element={
              <ProtectedRoute>
                <AllLeavesList />
              </ProtectedRoute>
            } />
            
            {/* Profile */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            {/* Reports */}
            <Route path="/reports" element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['SUPER_ADMIN', 'HR_MANAGER', 'TEAM_LEAD']}>
                  <ReportsDashboard />
                </RoleGuard>
              </ProtectedRoute>
            } />
            
            {/* Payroll Management */}
            <Route path="/payroll" element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['SUPER_ADMIN', 'PAYROLL_ADMIN']}>
                  <PayrollDashboard />
                </RoleGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/payroll/payslips" element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['SUPER_ADMIN', 'PAYROLL_ADMIN']}>
                  <PayslipGenerate />
                </RoleGuard>
              </ProtectedRoute>
            } />
            
            {/* Employee Payslips */}
            <Route path="/my-payslips" element={
              <ProtectedRoute>
                <MyPayslips />
              </ProtectedRoute>
            } />
            
            {/* Settings */}
            <Route path="/settings" element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['SUPER_ADMIN', 'HR_MANAGER']}>
                  <SettingsPage />
                </RoleGuard>
              </ProtectedRoute>
            } />
            
            {/* Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;