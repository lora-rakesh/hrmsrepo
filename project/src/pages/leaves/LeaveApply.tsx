import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { leaveApi, employeeApi } from '../../services/api';
import { LeaveType, Employee, LeaveRequestCreate } from '../../types/api';
import toast from 'react-hot-toast';

export default function LeaveApply() {
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LeaveRequestCreate>({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
    handover_to: '',
    handover_notes: '',
  });

  useEffect(() => {
    loadLeaveTypes();
    loadEmployees();
  }, []);

  const loadLeaveTypes = async () => {
    try {
      const response = await leaveApi.getTypes();
      setLeaveTypes(response);
    } catch (error) {
      console.error('Error loading leave types:', error);
      toast.error('Failed to load leave types');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    
    if (startDate > endDate) {
      toast.error('End date must be after start date');
      return;
    }
    
    if (startDate < new Date()) {
      toast.error('Start date cannot be in the past');
      return;
    }

    setIsLoading(true);
    
    try {
      await leaveApi.createRequest(formData);
      toast.success('Leave request submitted successfully!');
      navigate('/leaves');
    } catch (error: any) {
      console.error('Error submitting leave request:', error);
      const errorMessage = error?.response?.data?.detail || 'Failed to submit leave request';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateDays = () => {
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  return (
    <Layout>
       <div className="min-h-screen bg-gray-50 pt-4 pb-10">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
            <p className="text-sm text-gray-600">Submit a new leave request</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Leave Type"
                name="leave_type"
                required
                value={formData.leave_type}
                onChange={handleChange}
                placeholder="Select leave type"
                options={leaveTypes.map(type => ({
                  value: type.id,
                  label: `${type.name} (${type.code})`,
                }))}
              />
              
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Leave Balance Information
                </h3>
                <p className="text-sm text-gray-600">
                  Check your leave balance before applying. Contact HR for current balance details.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Start Date"
                name="start_date"
                type="date"
                required
                value={formData.start_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />
              
              <Input
                label="End Date"
                name="end_date"
                type="date"
                required
                value={formData.end_date}
                onChange={handleChange}
                min={formData.start_date || new Date().toISOString().split('T')[0]}
              />
            </div>

            {formData.start_date && formData.end_date && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Total Days:</strong> {calculateDays()} day(s)
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Leave <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  rows={4}
                  required
                  value={formData.reason}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Please provide a detailed reason for your leave request..."
                />
              </div>

              <Select
                label="Handover To (Optional)"
                name="handover_to"
                value={formData.handover_to}
                onChange={handleChange}
                placeholder="Select colleague for handover"
                options={[
                  { value: '', label: 'No handover required' },
                  ...employees.map(emp => ({
                    value: emp.id,
                    label: `${emp.full_name} (${emp.department_name})`,
                  })),
                ]}
              />

              {formData.handover_to && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Handover Notes
                  </label>
                  <textarea
                    name="handover_notes"
                    rows={3}
                    value={formData.handover_notes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Provide handover instructions and important tasks..."
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/leaves')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
              >
                Submit Leave Request
              </Button>
            </div>
          </form>
        </div>
      </div>
      </div>
      </div>
    </Layout>
  );
}