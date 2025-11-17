import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { employeeApi, departmentApi, jobTitleApi } from '../../services/api';
import { Department, JobTitle, EmployeeCreateForm } from '../../types/api';
import toast from 'react-hot-toast';

export default function EmployeeCreate() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<EmployeeCreateForm>({
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  role: 'EMPLOYEE',

  employee_id: '',
  date_of_birth: '',
  gender: '',
  personal_email: '',

  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relation: '',
  
  current_address: '',

  department: '',
  job_title: '',
  
  employment_type: 'FULL_TIME',
  work_mode: 'ONSITE',

  date_of_joining: new Date().toISOString().split('T')[0],
  basic_salary: '',
});


  // Load departments
  useEffect(() => {
    loadDepartments();
  }, []);

  // Load job titles when department changes
  useEffect(() => {
    if (formData.department) {
      loadJobTitles(formData.department);
    } else {
      setJobTitles([]);
    }
  }, [formData.department]);

  const loadDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      setDepartments(response);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const loadJobTitles = async (departmentId: string) => {
    try {
      const response = await jobTitleApi.getAll(departmentId);
      setJobTitles(response);
    } catch (error) {
      console.error('Error loading job titles:', error);
      toast.error('Failed to load job titles');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Backend-required field validation
    const requiredFields = [
      'email',
      'first_name',
      'last_name',
      'password',
      'employee_id',
      'department',
      'job_title',
      'employment_type',
      'work_mode',
      'date_of_joining',
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof EmployeeCreateForm]) {
        toast.error(`Please fill in ${field.replace('_', ' ')} field`);
        return;
      }
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    // Convert salary to a number or null
    const payload = {
      ...formData,
      basic_salary: formData.basic_salary
        ? parseFloat(formData.basic_salary)
        : null,
    };

    setIsLoading(true);
    try {
      await employeeApi.create(payload);
      toast.success('Employee created successfully!');
      navigate('/employees');
    } catch (error: any) {
      console.error('Error creating employee:', error);
      const errorMessage =
        error?.response?.data?.detail ||
        'Failed to create employee. Please check all required fields.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate username from email
    if (name === 'email') {
      setFormData((prev) => ({
        ...prev,
        username: value.split('@')[0],
      }));
    }
  };

  const roleOptions = [
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'TEAM_LEAD', label: 'Team Lead' },
    { value: 'HR_MANAGER', label: 'HR Manager' },
    { value: 'PAYROLL_ADMIN', label: 'Payroll Admin' },
    { value: 'RECRUITER', label: 'Recruiter' },
  ];

  const employmentTypeOptions = [
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' },
  ];

  const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
    { value: 'O', label: 'Other' },
  ];
  const workModeOptions = [
    { value: 'REGULAR', label: 'Regular (On-site)' },
    { value: 'WFH', label: 'Work From Home' },
    { value: 'HYBRID', label: 'Hybrid' },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
            <p className="text-sm text-gray-600">Create a new employee profile</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Account Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@company.com"
                />

                <Input
                  label="Username"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="john.doe"
                />

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  helperText="Employee will be able to change this password after first login"
                />

                <Select
                  label="Role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  options={roleOptions}
                />
              </div>
            </div>

            {/* Personal Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                />

                <Input
                  label="Last Name"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                />

                <Input
                  label="Employee ID"
                  name="employee_id"
                  required
                  value={formData.employee_id}
                  onChange={handleChange}
                  placeholder="EMP001"
                />

                <Input
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />

                <Select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={genderOptions}
                />

                <Input
                  label="Personal Email"
                  name="personal_email"
                  type="email"
                  value={formData.personal_email}
                  onChange={handleChange}
                  placeholder="john@personal.com"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Contact Name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                />

                <Input
                  label="Contact Phone"
                  name="emergency_contact_phone"
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                />

                <Input
                  label="Relationship"
                  name="emergency_contact_relation"
                  value={formData.emergency_contact_relation}
                  onChange={handleChange}
                  placeholder="Spouse, Parent, etc."
                />
              </div>
            </div>

            {/* Address Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Address Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Address
                  </label>
                  <textarea
                    name="current_address"
                    rows={3}
                    value={formData.current_address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Street address, city, state, postal code"
                  />
                </div>
              </div>
            </div>

            {/* Employment Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Employment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Department"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Select department"
                  options={departments.map((dept) => ({
                    value: dept.id,
                    label: dept.name,
                  }))}
                />

                <Select
                  label="Job Title"
                  name="job_title"
                  required
                  value={formData.job_title}
                  onChange={handleChange}
                  placeholder="Select job title"
                  options={jobTitles.map((title) => ({
                    value: title.id,
                    label: title.title,
                  }))}
                  disabled={!formData.department}
                />

                <Select
                  label="Employment Type"
                  name="employment_type"
                  required
                  value={formData.employment_type}
                  onChange={handleChange}
                  options={employmentTypeOptions}
                />
                <Select
                  label="Work Mode"
                  name="work_mode"
                  required
                  value={formData.work_mode}
                  onChange={handleChange}
                  options={workModeOptions}
                />
                <Input
                  label="Date of Joining"
                  name="date_of_joining"
                  type="date"
                  required
                  value={formData.date_of_joining}
                  onChange={handleChange}
                />

                <Input
                  label="Basic Salary"
                  name="basic_salary"
                  type="number"
                  value={formData.basic_salary}
                  onChange={handleChange}
                  placeholder="50000"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/employees')}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Create Employee
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
