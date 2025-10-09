import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { employeeApi, departmentApi } from '../../services/api';
import { Employee, Department, PaginatedResponse } from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';
import { PlusIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function EmployeeList() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
  });

  const canManageEmployees = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_MANAGER';

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, [searchQuery, selectedDepartment, pagination.page]);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: pagination.page,
        search: searchQuery,
      };
      
      if (selectedDepartment) {
        params.department = selectedDepartment;
      }

      const response: PaginatedResponse<Employee> = await employeeApi.getAll(params);
      setEmployees(response.results);
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(response.count / 20),
        totalCount: response.count,
      }));
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDepartmentFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-yellow-100 text-yellow-800',
      TERMINATED: 'bg-red-100 text-red-800',
      ON_LEAVE: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'employee_id',
      header: 'Employee ID',
      render: (value: string, row: Employee) => (
        <Link 
          to={`/employees/${row.id}`}
          className="text-indigo-600 hover:text-indigo-900 font-medium"
        >
          {value}
        </Link>
      ),
    },
    {
      key: 'full_name',
      header: 'Name',
      render: (value: string, row: Employee) => (
        <div className="flex items-center">
          {row.profile_picture ? (
            <img className="h-8 w-8 rounded-full mr-3" src={row.profile_picture} alt="" />
          ) : (
            <div className="h-8 w-8 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700">
                {value.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'department_name',
      header: 'Department',
    },
    {
      key: 'job_title_name',
      header: 'Job Title',
    },
    {
      key: 'manager_name',
      header: 'Manager',
    },
    {
      key: 'employment_status',
      header: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(value)}`}>
          {value.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'date_of_joining',
      header: 'Join Date',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: Employee) => (
        <div className="flex space-x-2">
          <Link
            to={`/employees/${row.id}`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <EyeIcon className="h-4 w-4" />
          </Link>
          {canManageEmployees && (
            <Link
              to={`/employees/${row.id}/edit`}
              className="text-gray-600 hover:text-gray-900"
            >
              <PencilIcon className="h-4 w-4" />
            </Link>
          )}
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
            <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
            <p className="text-sm text-gray-600">{pagination.totalCount} total employees</p>
          </div>
          {canManageEmployees && (
            <Link to="/employees/create">
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={handleSearch}
            />
            <Select
              placeholder="Filter by department"
              value={selectedDepartment}
              onChange={handleDepartmentFilter}
              options={[
                { value: '', label: 'All Departments' },
                ...departments.map(dept => ({
                  value: dept.id,
                  label: dept.name,
                })),
              ]}
            />
            <div></div>
          </div>
        </div>

        {/* Employee Table */}
        <div className="bg-white shadow rounded-lg">
          <Table
            columns={columns}
            data={employees}
            isLoading={isLoading}
            emptyMessage="No employees found"
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