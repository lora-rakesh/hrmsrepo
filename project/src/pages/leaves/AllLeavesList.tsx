import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Table } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { leaveApi, employeeApi, departmentApi } from '../../services/api';
import { LeaveRequest, Employee, Department, PaginatedResponse } from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';
import { CalendarIcon, EyeIcon, UserIcon } from '@heroicons/react/24/outline';

export default function AllLeavesList() {
  useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    employee: '',
    department: '',
    status: '',
    leave_type: '',
    start_date: '',
    end_date: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
  });

  useEffect(() => {
    loadLeaveRequests();
    loadEmployees();
    loadDepartments();
  }, [filters, pagination.page]);

  const loadLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: pagination.page,
        ordering: '-applied_date',
      };
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const response: PaginatedResponse<LeaveRequest> = await leaveApi.getRequests(params);
      setLeaveRequests(response.results);
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(response.count / 20),
        totalCount: response.count,
      }));
    } catch (error) {
      console.error('Error loading leave requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeApi.getAll({ limit: 100 });
      setEmployees(response.results);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      setDepartments(response);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
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

  const columns = [
    {
      key: 'employee_name',
      header: 'Employee',
      render: (value: string, row: LeaveRequest) => (
        <div className="flex items-center space-x-3">
          <UserIcon className="h-5 w-5 text-gray-400" />
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.employee}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'leave_type_name',
      header: 'Leave Type',
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {value}
        </span>
      ),
    },
    {
      key: 'start_date',
      header: 'Start Date',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'end_date',
      header: 'End Date',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'days_requested',
      header: 'Days',
      render: (value: string) => (
        <span className="font-medium text-gray-900">{value} day(s)</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'applied_date',
      header: 'Applied On',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'approved_by_name',
      header: 'Approved By',
      render: (value: string) => value || '-',
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (value: string) => (
        <div className="text-sm text-gray-900 max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any) => (
        <button
          className="text-indigo-600 hover:text-indigo-900"
          title="View Details"
        >
          <EyeIcon className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <Layout>
       <div className="min-h-screen bg-gray-50 pt-4 pb-10">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Leave Requests</h1>
          <p className="text-gray-600">Complete overview of all employee leave requests</p>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Select
              label="Employee"
              name="employee"
              value={filters.employee}
              onChange={handleFilterChange}
              placeholder="All employees"
              options={[
                { value: '', label: 'All Employees' },
                ...employees.map(emp => ({
                  value: emp.id,
                  label: emp.full_name,
                })),
              ]}
            />
            
            <Select
              label="Department"
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              placeholder="All departments"
              options={[
                { value: '', label: 'All Departments' },
                ...departments.map(dept => ({
                  value: dept.id,
                  label: dept.name,
                })),
              ]}
            />
            
            <Select
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              placeholder="All statuses"
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'REJECTED', label: 'Rejected' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
            />
            
            <Select
              label="Leave Type"
              name="leave_type"
              value={filters.leave_type}
              onChange={handleFilterChange}
              placeholder="All leave types"
              options={[
                { value: '', label: 'All Leave Types' },
                { value: 'CL', label: 'Casual Leave' },
                { value: 'SL', label: 'Sick Leave' },
                { value: 'PL', label: 'Privilege Leave' },
              ]}
            />
            
            <Input
              label="Start Date From"
              name="start_date"
              type="date"
              value={filters.start_date}
              onChange={handleFilterChange}
            />
            
            <Input
              label="End Date To"
              name="end_date"
              type="date"
              value={filters.end_date}
              onChange={handleFilterChange}
            />
            
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setFilters({
                    employee: '',
                    department: '',
                    status: '',
                    leave_type: '',
                    start_date: '',
                    end_date: '',
                  });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                variant="secondary"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Requests
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {leaveRequests.filter(l => l.status === 'PENDING').length}
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
                  <CalendarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Approved Requests
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {leaveRequests.filter(l => l.status === 'APPROVED').length}
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
                  <CalendarIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Rejected Requests
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {leaveRequests.filter(l => l.status === 'REJECTED').length}
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
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Requests
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {pagination.totalCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Leave Requests</h3>
          </div>
          <Table
            columns={columns}
            data={leaveRequests}
            isLoading={isLoading}
            emptyMessage="No leave requests found"
          />
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
      </div>
      </div>
    </Layout>
  );
}