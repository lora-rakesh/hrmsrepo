import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CurrencyDollarIcon, 
  DocumentTextIcon, 
  CalendarIcon,
  PlayIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface PayrollRun {
  id: string;
  name: string;
  month: number;
  year: number;
  status: 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  processed_by?: string;
  processed_at?: string;
  total_employees: number;
  total_amount: string;
}

interface PayrollStats {
  totalEmployees: number;
  currentMonthPayroll: string;
  pendingPayslips: number;
  completedRuns: number;
}

export default function PayrollDashboard() {
  const { user } = useAuth();
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [stats, setStats] = useState<PayrollStats>({
    totalEmployees: 0,
    currentMonthPayroll: '0',
    pendingPayslips: 0,
    completedRuns: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isProcessing, setIsProcessing] = useState(false);

  const canManagePayroll = user?.role === 'SUPER_ADMIN' || user?.role === 'PAYROLL_ADMIN';

  useEffect(() => {
    loadPayrollData();
  }, []);

  const loadPayrollData = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API calls
      // const response = await payrollApi.getPayrollRuns();
      
      // Mock data for demonstration
      const mockPayrollRuns: PayrollRun[] = [
        {
          id: '1',
          name: 'December 2024 Payroll',
          month: 12,
          year: 2024,
          status: 'COMPLETED',
          processed_by: 'Admin User',
          processed_at: '2024-12-31T10:00:00Z',
          total_employees: 25,
          total_amount: '125000.00'
        },
        {
          id: '2',
          name: 'January 2025 Payroll',
          month: 1,
          year: 2025,
          status: 'DRAFT',
          total_employees: 25,
          total_amount: '0.00'
        }
      ];

      setPayrollRuns(mockPayrollRuns);
      setStats({
        totalEmployees: 25,
        currentMonthPayroll: '125000.00',
        pendingPayslips: 5,
        completedRuns: 12,
      });
    } catch (error) {
      console.error('Error loading payroll data:', error);
      toast.error('Failed to load payroll data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePayrollRun = async () => {
    setIsProcessing(true);
    try {
      // TODO: Replace with actual API call
      // await payrollApi.createPayrollRun({ month: selectedMonth, year: selectedYear });
      
      toast.success('Payroll run created successfully!');
      setShowCreateModal(false);
      loadPayrollData();
    } catch (error: any) {
      toast.error('Failed to create payroll run');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessPayroll = async (payrollId: string) => {
    setIsProcessing(true);
    try {
      // TODO: Replace with actual API call
      // await payrollApi.processPayroll(payrollId);
      
      toast.success('Payroll processing started!');
      loadPayrollData();
    } catch (error: any) {
      toast.error('Failed to process payroll');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PROCESSING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1).toLocaleString('default', { month: 'long' });
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: getMonthName(i + 1),
  }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year.toString(), label: year.toString() };
  });

  const columns = [
    {
      key: 'name',
      header: 'Payroll Run',
      render: (value: string, row: PayrollRun) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{getMonthName(row.month)} {row.year}</div>
        </div>
      ),
    },
    {
      key: 'total_employees',
      header: 'Employees',
      render: (value: number) => value.toString(),
    },
    {
      key: 'total_amount',
      header: 'Total Amount',
      render: (value: string) => formatCurrency(value),
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
      key: 'processed_at',
      header: 'Processed Date',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: PayrollRun) => (
        <div className="flex space-x-2">
          {row.status === 'DRAFT' && canManagePayroll && (
            <Button
              size="sm"
              onClick={() => handleProcessPayroll(row.id)}
              disabled={isProcessing}
            >
              <PlayIcon className="h-4 w-4 mr-1" />
              Process
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {/* TODO: View payslips */}}
          >
            <DocumentTextIcon className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      ),
    },
  ];

  if (!canManagePayroll) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access payroll management.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
            <p className="text-gray-600">Manage employee payroll and generate payslips</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowCreateModal(true)}
              disabled={isProcessing}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              New Payroll Run
            </Button>
            <Button variant="secondary">
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export Reports
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Current Month Payroll
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(stats.currentMonthPayroll)}
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
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
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
                  <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Payslips
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.pendingPayslips}
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
                  <CalendarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed Runs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.completedRuns}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payroll Runs Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Payroll Runs</h3>
          </div>
          <Table
            columns={columns}
            data={payrollRuns}
            isLoading={isLoading}
            emptyMessage="No payroll runs found"
          />
        </div>

        {/* Create Payroll Run Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Payroll Run"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Month"
                value={selectedMonth.toString()}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                options={monthOptions}
              />
              <Select
                label="Year"
                value={selectedYear.toString()}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                options={yearOptions}
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Payroll Run Details</h4>
              <p className="text-sm text-blue-700">
                This will create a new payroll run for <strong>{getMonthName(selectedMonth)} {selectedYear}</strong>.
                You can process it after reviewing all employee data.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePayrollRun}
                isLoading={isProcessing}
              >
                Create Payroll Run
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}