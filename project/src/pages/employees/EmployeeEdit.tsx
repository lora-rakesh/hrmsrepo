import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { employeeApi, departmentApi, jobTitleApi } from '../../services/api';
import { Employee, Department, JobTitle } from '../../types/api';
import toast from 'react-hot-toast';

export default function EmployeeEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadEmployee();
      loadDepartments();
    }
  }, [id]);

  useEffect(() => {
    if (employee?.department?.id) {
      loadJobTitles(employee.department.id);
    }
  }, [employee?.department?.id]);

  const loadEmployee = async () => {
    try {
      const response = await employeeApi.getById(id!);
      setEmployee(response);
    } catch (error) {
      console.error('Error loading employee:', error);
      toast.error('Failed to load employee');
      navigate('/employees');
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

  const loadJobTitles = async (departmentId: string) => {
    try {
      const response = await jobTitleApi.getAll(departmentId);
      setJobTitles(response);
    } catch (error) {
      console.error('Error loading job titles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employee) return;

    setIsSaving(true);
    
    try {
      await employeeApi.update(employee.id, employee);
      toast.success('Employee updated successfully!');
      navigate(`/employees/${employee.id}`);
    } catch (error: any) {
      console.error('Error updating employee:', error);
      const errorMessage = error?.response?.data?.detail || 'Failed to update employee';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('user.')) {
      const userField = name.split('.')[1];
      setEmployee(prev => prev ? {
        ...prev,
        user: {
          ...prev.user,
          [userField]: value,
        }
      } : null);
    } else {
      setEmployee(prev => prev ? {
        ...prev,
        [name]: value,
      } : null);
    }
  };

  const employmentTypeOptions = [
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' },
  ];

  const employmentStatusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'ON_LEAVE', label: 'On Leave' },
    { value: 'TERMINATED', label: 'Terminated' },
  ];

  const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
    { value: 'O', label: 'Other' },
  ];

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
          <p className="text-gray-600 mb-4">The employee you're trying to edit doesn't exist.</p>
          <Button onClick={() => navigate('/employees')}>
            Back to Employees
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit Employee</h1>
            <p className="text-sm text-gray-600">Update {employee.full_name}'s information</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  name="user.first_name"
                  required
                  value={employee.user.first_name}
                  onChange={handleChange}
                />
                
                <Input
                  label="Last Name"
                  name="user.last_name"
                  required
                  value={employee.user.last_name}
                  onChange={handleChange}
                />
                
                <Input
                  label="Email Address"
                  name="user.email"
                  type="email"
                  required
                  value={employee.user.email}
                  onChange={handleChange}
                />
                
                <Input
                  label="Phone"
                  name="user.phone"
                  type="tel"
                  value={employee.user.phone || ''}
                  onChange={handleChange}
                />
                
                <Input
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={employee.date_of_birth || ''}
                  onChange={handleChange}
                />
                
                <Select
                  label="Gender"
                  name="gender"
                  value={employee.gender || ''}
                  onChange={handleChange}
                  options={genderOptions}
                />
                
                <Input
                  label="Personal Email"
                  name="personal_email"
                  type="email"
                  value={employee.personal_email || ''}
                  onChange={handleChange}
                />
                
                <Input
                  label="Nationality"
                  name="nationality"
                  value={employee.nationality || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Contact Name"
                  name="emergency_contact_name"
                  value={employee.emergency_contact_name || ''}
                  onChange={handleChange}
                />
                
                <Input
                  label="Contact Phone"
                  name="emergency_contact_phone"
                  type="tel"
                  value={employee.emergency_contact_phone || ''}
                  onChange={handleChange}
                />
                
                <Input
                  label="Relationship"
                  name="emergency_contact_relation"
                  value={employee.emergency_contact_relation || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Address
                  </label>
                  <textarea
                    name="current_address"
                    rows={3}
                    value={employee.current_address || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <Input
                  label="City"
                  name="city"
                  value={employee.city || ''}
                  onChange={handleChange}
                />
                
                <Input
                  label="State"
                  name="state"
                  value={employee.state || ''}
                  onChange={handleChange}
                />
                
                <Input
                  label="Postal Code"
                  name="postal_code"
                  value={employee.postal_code || ''}
                  onChange={handleChange}
                />
                
                <Input
                  label="Country"
                  name="country"
                  value={employee.country || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Employment Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Department"
                  name="department"
                  value={employee.department?.id || ''}
                  onChange={(e) => {
                    const deptId = e.target.value;
                    const dept = departments.find(d => d.id === deptId);
setEmployee((prev: Employee | null): Employee | null => {
  if (!prev) return null;
  return { ...prev, department: dept || undefined };
});
                    if (deptId) {
                      loadJobTitles(deptId);
                    }
                  }}
                  options={departments.map(dept => ({
                    value: dept.id,
                    label: dept.name,
                  }))}
                />
                
                <Select
                  label="Job Title"
                  name="job_title"
                  value={employee.job_title?.id || ''}
                  onChange={(e) => {
                    const titleId = e.target.value;
                    const title = jobTitles.find(t => t.id === titleId);
setEmployee((prev: Employee | null): Employee | null => {
  if (!prev) return null;
  return { ...prev, job_title: title || undefined };
});
                  }}
                  options={jobTitles.map(title => ({
                    value: title.id,
                    label: title.title,
                  }))}
                  disabled={!employee.department}
                />
                
                <Select
                  label="Employment Type"
                  name="employment_type"
                  value={employee.employment_type}
                  onChange={handleChange}
                  options={employmentTypeOptions}
                />
                
                <Select
                  label="Employment Status"
                  name="employment_status"
                  value={employee.employment_status}
                  onChange={handleChange}
                  options={employmentStatusOptions}
                />
                
                <Input
                  label="Date of Joining"
                  name="date_of_joining"
                  type="date"
                  value={employee.date_of_joining}
                  onChange={handleChange}
                />
                
                <Input
                  label="Basic Salary"
                  name="basic_salary"
                  type="number"
                  value={employee.basic_salary}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/employees/${employee.id}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSaving}
              >
                Update Employee
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}