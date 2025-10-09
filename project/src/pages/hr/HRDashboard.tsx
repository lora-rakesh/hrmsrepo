import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { 
  UsersIcon, 
  CalendarIcon, 
  ClockIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { employeeApi, leaveApi, attendanceApi } from '../../services/api';
import { Employee, LeaveRequest, PaginatedResponse } from '../../types/api';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

interface HRStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaves: number;
  todayAttendance: number;
  newJoiners: number;
}

export default function HRDashboard() {
  const [stats, setStats] = useState<HRStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    todayAttendance: 0,
    newJoiners: 0,
  });
  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHRDashboardData();
  }, []);

  const loadHRDashboardData = async () => {
    try {
      const [employeeData, leaveData] = await Promise.all([
        employeeApi.getAll({ limit: 10, ordering: '-created_at' }),
        leaveApi.getRequests({ status: 'PENDING', limit: 5 }),
      ]);

      setRecentEmployees(employeeData.results);
      setPendingLeaves(leaveData.results);

      setStats({
        totalEmployees: employeeData.count,
        activeEmployees: employeeData.results.filter(emp => emp.employment_status === 'ACTIVE').length,
        pendingLeaves: leaveData.count,
        todayAttendance: 85, // TODO: Calculate from attendance API
        newJoiners: employeeData.results.filter(emp => {
          const joinDate = new Date(emp.date_of_joining);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return joinDate >= thirtyDaysAgo;
        }).length,
      });
    } catch (error) {
      console.error('Error loading HR dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-yellow-100 text-yellow-800',
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
            <p className="text-gray-600">Overview of HR operations and metrics</p>
          </div>
          <div className="flex space-x-3">
            <Link to="/employees/create">
              <Button>Add Employee</Button>
            </Link>
            <Link to="/leaves/approval">
              <Button variant="secondary">Review Leaves</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-blue-600" />
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
                  <UsersIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Employees
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activeEmployees}
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
                  <CalendarIcon className="h-6 w-6 text-yellow-600" />
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
                  <ClockIcon className="h-6 w-6 text-indigo-600" />
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
                  <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      New Joiners (30d)
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.newJoiners}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Employees */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Recent Employees</h3>
                <Link to="/employees" className="text-indigo-600 hover:text-indigo-900 text-sm">
                  View all
                </Link>
              </div>
            </div>
            <div className="px-6 py-4">
              {recentEmployees.length > 0 ? (
                <div className="space-y-4">
                  {recentEmployees.slice(0, 5).map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-700">
                            {employee.full_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{employee.full_name}</p>
                          <p className="text-xs text-gray-500">{employee.job_title_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(employee.employment_status)}`}>
                          {employee.employment_status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Joined {formatDate(employee.date_of_joining)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent employees</p>
              )}
            </div>
          </div>

          {/* Pending Leave Requests */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  Pending Leave Requests
                </h3>
                <Link to="/leaves/approval" className="text-indigo-600 hover:text-indigo-900 text-sm">
                  Review all
                </Link>
              </div>
            </div>
            <div className="px-6 py-4">
              {pendingLeaves.length > 0 ? (
                <div className="space-y-4">
                  {pendingLeaves.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{leave.employee_name}</p>
                        <p className="text-xs text-gray-500">
                          {leave.leave_type_name} - {formatDate(leave.start_date)} to {formatDate(leave.end_date)}
                        </p>
                        <p className="text-xs text-gray-600 truncate max-w-xs">{leave.reason}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">{leave.days_requested} days</span>
                        <p className="text-xs text-gray-400">
                          Applied {formatDate(leave.applied_date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No pending leave requests</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/employees/create">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <UsersIcon className="h-8 w-8 text-indigo-600 mb-2" />
                <h4 className="font-medium text-gray-900">Add New Employee</h4>
                <p className="text-sm text-gray-500">Create a new employee profile</p>
              </div>
            </Link>
            
            <Link to="/leaves/approval">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <CalendarIcon className="h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-medium text-gray-900">Review Leave Requests</h4>
                <p className="text-sm text-gray-500">Approve or reject pending leaves</p>
              </div>
            </Link>
            
            <Link to="/attendance/reports">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <ChartBarIcon className="h-8 w-8 text-purple-600 mb-2" />
                <h4 className="font-medium text-gray-900">Attendance Reports</h4>
                <p className="text-sm text-gray-500">View attendance analytics</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}