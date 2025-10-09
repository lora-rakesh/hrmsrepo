import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Table } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { attendanceApi, employeeApi } from '../../services/api';
import { Attendance, Employee, PaginatedResponse } from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';
import { CalendarIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

export default function AttendanceReports() {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    employee: '',
    startDate: '',
    endDate: '',
    status: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
  });

  const isManager = user?.role !== 'EMPLOYEE';

  useEffect(() => {
    loadAttendanceReports();
    if (isManager) {
      loadEmployees();
    }
  }, [filters, pagination.page]);

  const loadAttendanceReports = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: pagination.page,
        ordering: '-date',
      };
      
      if (filters.employee) params.employee = filters.employee;
      if (filters.startDate) params.date_after = filters.startDate;
      if (filters.endDate) params.date_before = filters.endDate;
      if (filters.status) params.status = filters.status;

      const response: PaginatedResponse<Attendance> = await attendanceApi.getRecords(params);
      setAttendanceRecords(response.results);
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(response.count / 20),
        totalCount: response.count,
      }));
    } catch (error) {
      console.error('Error loading attendance reports:', error);
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const exportToCSV = () => {
    // TODO: Implement CSV export functionality
    console.log('Export to CSV functionality to be implemented');
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PRESENT: 'bg-green-100 text-green-800',
      ABSENT: 'bg-red-100 text-red-800',
      HALF_DAY: 'bg-yellow-100 text-yellow-800',
      LATE: 'bg-orange-100 text-orange-800',
      ON_LEAVE: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (dateTimeString: string) => {
    if (!dateTimeString) return '-';
    return new Date(dateTimeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const columns = [
    ...(isManager ? [{
      key: 'employee_name',
      header: 'Employee',
      render: (value: string) => (
        <div className="text-sm font-medium text-gray-900">{value}</div>
      ),
    }] : []),
    {
      key: 'date',
      header: 'Date',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'check_in_time',
      header: 'Check In',
      render: (value: string) => formatTime(value),
    },
    {
      key: 'check_out_time',
      header: 'Check Out',
      render: (value: string) => formatTime(value),
    },
    {
      key: 'total_hours',
      header: 'Total Hours',
      render: (value: string) => value ? `${parseFloat(value).toFixed(2)}h` : '-',
    },
    {
      key: 'overtime_hours',
      header: 'Overtime',
      render: (value: string) => value && parseFloat(value) > 0 ? `${parseFloat(value).toFixed(2)}h` : '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(value)}`}>
          {value.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'shift_name',
      header: 'Shift',
      render: (value: string) => value || '-',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
            <p className="text-sm text-gray-600">{pagination.totalCount} total records</p>
          </div>
          <Button onClick={exportToCSV} variant="secondary">
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {isManager && (
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
            )}
            
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
            
            <Input
              label="End Date"
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
            
            <Select
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              placeholder="All statuses"
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'PRESENT', label: 'Present' },
                { value: 'ABSENT', label: 'Absent' },
                { value: 'HALF_DAY', label: 'Half Day' },
                { value: 'LATE', label: 'Late' },
                { value: 'ON_LEAVE', label: 'On Leave' },
              ]}
            />
            
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setFilters({
                    employee: '',
                    startDate: '',
                    endDate: '',
                    status: '',
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Present Days
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {attendanceRecords.filter(r => r.status === 'PRESENT').length}
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
                      Absent Days
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {attendanceRecords.filter(r => r.status === 'ABSENT').length}
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
                      Half Days
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {attendanceRecords.filter(r => r.status === 'HALF_DAY').length}
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
                      On Leave
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {attendanceRecords.filter(r => r.status === 'ON_LEAVE').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Attendance Records</h3>
          </div>
          <Table
            columns={columns}
            data={attendanceRecords}
            isLoading={isLoading}
            emptyMessage="No attendance records found"
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
    </Layout>
  );
}