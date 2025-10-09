import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { leaveApi } from '../../services/api';
import { LeaveRequest, PaginatedResponse } from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';
import { PlusIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function LeaveRequests() {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
  });

  const isManager = user?.role !== 'EMPLOYEE';

  useEffect(() => {
    loadLeaveRequests();
  }, [statusFilter, pagination.page]);

  const loadLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: pagination.page,
      };
      
      if (statusFilter) {
        params.status = statusFilter;
      }

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
    ...(isManager ? [{
      key: 'employee_name',
      header: 'Employee',
      render: (value: string) => (
        <div className="text-sm font-medium text-gray-900">{value}</div>
      ),
    }] : []),
    {
      key: 'leave_type_name',
      header: 'Leave Type',
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
      render: (value: string) => `${value} day(s)`,
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
      render: (_: any, row: LeaveRequest) => (
        <div className="flex space-x-2">
          <button
            className="text-indigo-600 hover:text-indigo-900"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isManager ? 'Leave Requests' : 'My Leave Requests'}
            </h1>
            <p className="text-sm text-gray-600">{pagination.totalCount} total requests</p>
          </div>
          <Link to="/leaves/apply">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Apply for Leave
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'REJECTED', label: 'Rejected' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
            />
            <div></div>
            <div></div>
            {isManager && (
              <Link to="/leaves/approval">
                <Button variant="secondary" className="w-full">
                  Pending Approvals
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white shadow rounded-lg">
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
    </Layout>
  );
}