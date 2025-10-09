import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout/Layout';
import { 
  UsersIcon, 
  CalendarIcon, 
  ClockIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';
import { attendanceApi, leaveApi, employeeApi } from '../services/api';
import { Attendance, LeaveRequest } from '../types/api';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { Link } from "react-router-dom";
import { UserIcon } from '@heroicons/react/24/solid';


interface DashboardStats {
  totalEmployees: number;
  pendingLeaves: number;
  todayAttendance: number;
  myLeaveBalance: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    pendingLeaves: 0,
    todayAttendance: 0,
    myLeaveBalance: 0,
  });
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [attendanceData, leaveData] = await Promise.all([
        attendanceApi.getTodayAttendance(),
        leaveApi.getRequests({ limit: 5 }),
      ]);

      setTodayAttendance(attendanceData);
      setRecentLeaves(leaveData.results);

      // Load additional stats for managers
      if (user?.role !== 'EMPLOYEE') {
        const employeeData = await employeeApi.getAll({ limit: 1 });
        setStats(prev => ({
          ...prev,
          totalEmployees: employeeData.count,
          pendingLeaves: leaveData.results.filter(l => l.status === 'PENDING').length,
        }));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await attendanceApi.checkIn();
      toast.success('Checked in successfully!');
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingIn(true);
    try {
      await attendanceApi.checkOut();
      toast.success('Checked out successfully!');
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Check-out failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const getDashboardTitle = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
    return `${greeting}, ${user?.first_name}!`;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow h-32"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {getDashboardTitle()}
          </h1>
          <div className="text-sm text-gray-500">
            Today is {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Quick Actions - Check In/Out */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h2>
          <div className="flex items-center justify-between">
            <div>
              {todayAttendance?.check_in_time ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Checked in at: {new Date(todayAttendance.check_in_time).toLocaleTimeString()}
                  </p>
                  {todayAttendance.check_out_time && (
                    <p className="text-sm text-gray-600">
                      Checked out at: {new Date(todayAttendance.check_out_time).toLocaleTimeString()}
                    </p>
                  )}
                  {todayAttendance.total_hours && (
                    <p className="text-sm font-medium text-green-600">
                      Total hours: {todayAttendance.total_hours}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600">You haven't checked in today</p>
              )}
            </div>
            <div className="space-x-3">
              {!todayAttendance?.check_in_time ? (
                <Button
                  onClick={handleCheckIn}
                  isLoading={checkingIn}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Check In
                </Button>
              ) : !todayAttendance.check_out_time ? (
                <Button
                  onClick={handleCheckOut}
                  isLoading={checkingIn}
                  variant="danger"
                >
                  Check Out
                </Button>
              ) : (
                <div className="flex items-center text-green-600">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Day Complete</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {(user?.role === 'SUPER_ADMIN' || user?.role === 'HR_MANAGER' || user?.role === 'TEAM_LEAD') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UsersIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Employees
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalEmployees}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Leaves
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.pendingLeaves}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Today's Attendance
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.todayAttendance}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        My Leave Balance
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.myLeaveBalance} days
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Leave Requests */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {user?.role === 'EMPLOYEE' ? 'My Recent Leave Requests' : 'Recent Leave Requests'}
            </h3>
          </div>
          <div className="px-6 py-4">
            {recentLeaves.length > 0 ? (
              <div className="space-y-4">
                {recentLeaves.map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          {leave.employee_name || user?.full_name}
                        </h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(leave.status)}`}>
                          {leave.status}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        <p>{leave.leave_type_name} - {formatDate(leave.start_date)} to {formatDate(leave.end_date)}</p>
                        <p className="truncate">{leave.reason}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {leave.days_requested} days
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No leave requests found
              </p>
            )}
          </div>
        </div>

        {/* Employee Quick Actions */}
        {user?.role === 'EMPLOYEE' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/leaves/apply">
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <CalendarIcon className="h-8 w-8 text-green-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Apply for Leave</h4>
                  <p className="text-sm text-gray-500">Submit a new leave request</p>
                </div>
              </Link>
              
              <Link to="/my-payslips">
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <DocumentTextIcon className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="font-medium text-gray-900">My Payslips</h4>
                  <p className="text-sm text-gray-500">View and download payslips</p>
                </div>
              </Link>
              
              <Link to="/profile">
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <UserIcon className="h-8 w-8 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">My Profile</h4>
                  <p className="text-sm text-gray-500">Update profile information</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}