import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { employeeApi } from '../../services/api';
import { Employee } from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  CalendarIcon,
  BriefcaseIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

export default function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_MANAGER' || user?.id === employee?.user.id;

  useEffect(() => {
    if (id) {
      loadEmployee();
    }
  }, [id]);

  const loadEmployee = async () => {
    try {
      setIsLoading(true);
      const response = await employeeApi.getById(id!);
      setEmployee(response);
    } catch (error) {
      console.error('Error loading employee:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
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

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!employee) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Not Found</h2>
          <p className="text-gray-600 mb-4">The employee you're looking for doesn't exist.</p>
          <Link to="/employees">
            <Button>Back to Employees</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center">
              {employee.profile_picture ? (
                <img
                  src={employee.profile_picture}
                  alt={employee.full_name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="h-8 w-8 text-gray-600" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{employee.full_name}</h1>
              <p className="text-lg text-gray-600">{employee.job_title_name}</p>
              <p className="text-sm text-gray-500">{employee.employee_id}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            {canEdit && (
              <Link to={`/employees/${employee.id}/edit`}>
                <Button>
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            )}
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(employee.employment_status)}`}>
              {employee.employment_status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Work Email</p>
                      <p className="text-sm text-gray-900">{employee.user.email}</p>
                    </div>
                  </div>
                  {employee.personal_email && (
                    <div className="flex items-center space-x-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Personal Email</p>
                        <p className="text-sm text-gray-900">{employee.personal_email}</p>
                      </div>
                    </div>
                  )}
                  {employee.user.phone && (
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-sm text-gray-900">{employee.user.phone}</p>
                      </div>
                    </div>
                  )}
                  {employee.date_of_birth && (
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                        <p className="text-sm text-gray-900">{formatDate(employee.date_of_birth)}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {employee.current_address && (
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p className="text-sm text-gray-900">{employee.current_address}</p>
                        {employee.city && employee.state && (
                          <p className="text-sm text-gray-900">{employee.city}, {employee.state} {employee.postal_code}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {employee.nationality && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nationality</p>
                      <p className="text-sm text-gray-900">{employee.nationality}</p>
                    </div>
                  )}
                  {employee.marital_status && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Marital Status</p>
                      <p className="text-sm text-gray-900">{employee.marital_status}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {employee.emergency_contact_name && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-sm text-gray-900">{employee.emergency_contact_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{employee.emergency_contact_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Relationship</p>
                    <p className="text-sm text-gray-900">{employee.emergency_contact_relation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Employment Information */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Details</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p className="text-sm text-gray-900">{employee.department_name}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Job Title</p>
                  <p className="text-sm text-gray-900">{employee.job_title_name}</p>
                </div>
                {employee.manager_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Manager</p>
                    <p className="text-sm text-gray-900">{employee.manager_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Employment Type</p>
                  <p className="text-sm text-gray-900">{employee.employment_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date of Joining</p>
                  <p className="text-sm text-gray-900">{formatDate(employee.date_of_joining)}</p>
                </div>
                {employee.probation_end_date && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Probation End Date</p>
                    <p className="text-sm text-gray-900">{formatDate(employee.probation_end_date)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Years of Service</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.floor((new Date().getTime() - new Date(employee.date_of_joining).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Employee ID</span>
                  <span className="text-sm font-medium text-gray-900">{employee.employee_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(employee.employment_status)}`}>
                    {employee.employment_status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}