import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { employeeApi } from '../../services/api';
import { Employee } from '../../types/api';
import { generatePayslipPDF, PayslipData } from '../../utils/pdfGenerator';
import { 
  DocumentTextIcon, 
  EyeIcon,
  DocumentArrowDownIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Payslip {
  id: string;
  employee: Employee;
  month: number;
  year: number;
  gross_salary: string;
  total_deductions: string;
  net_salary: string;
  working_days: number;
  present_days: number;
  status: 'DRAFT' | 'GENERATED' | 'SENT';
  generated_at?: string;
}

interface PayslipComponent {
  name: string;
  type: 'EARNING' | 'DEDUCTION';
  amount: string;
}

export default function PayslipGenerate() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  const canManagePayroll = user?.role === 'SUPER_ADMIN' || user?.role === 'PAYROLL_ADMIN';

  useEffect(() => {
    loadEmployees();
    loadPayslips();
  }, [selectedMonth, selectedYear]);

  const loadEmployees = async () => {
    try {
      const response = await employeeApi.getAll({ limit: 100 });
      setEmployees(response.results);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadPayslips = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // const response = await payrollApi.getPayslips({ month: selectedMonth, year: selectedYear });
      
      // Mock data for demonstration
      const mockPayslips: Payslip[] = employees.slice(0, 5).map((emp, index) => ({
        id: `payslip-${index + 1}`,
        employee: emp,
        month: selectedMonth,
        year: selectedYear,
        gross_salary: '5000.00',
        total_deductions: '1000.00',
        net_salary: '4000.00',
        working_days: 22,
        present_days: 20,
        status: index % 2 === 0 ? 'GENERATED' : 'DRAFT',
        generated_at: index % 2 === 0 ? new Date().toISOString() : undefined,
      }));

      setPayslips(mockPayslips);
    } catch (error) {
      console.error('Error loading payslips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePayslip = async (employeeId?: string) => {
    setIsGenerating(true);
    try {
      // TODO: Replace with actual API call
      // if (employeeId) {
      //   await payrollApi.generatePayslip(employeeId, selectedMonth, selectedYear);
      // } else {
      //   await payrollApi.generateAllPayslips(selectedMonth, selectedYear);
      // }
      
      toast.success(employeeId ? 'Payslip generated successfully!' : 'All payslips generated successfully!');
      loadPayslips();
    } catch (error: any) {
      toast.error('Failed to generate payslip(s)');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewPayslip = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setShowPayslipModal(true);
  };

  const handleDownloadPayslip = async (payslipId: string) => {
    try {
      const payslip = payslips.find(p => p.id === payslipId);
      if (!payslip) {
        toast.error('Payslip not found');
        return;
      }

      const payslipData: PayslipData = {
        employee: {
          full_name: payslip.employee.full_name,
          employee_id: payslip.employee.employee_id,
          job_title_name: payslip.employee.job_title_name,
          department_name: payslip.employee.department_name,
        },
        month: payslip.month,
        year: payslip.year,
        gross_salary: payslip.gross_salary,
        total_deductions: payslip.total_deductions,
        net_salary: payslip.net_salary,
        working_days: payslip.working_days,
        present_days: payslip.present_days,
        earnings: [],
        deductions: [],
      };

      await generatePayslipPDF(payslipData);
      toast.success('Payslip downloaded successfully!');
    } catch (error) {
      console.error('Error downloading payslip:', error);
      toast.error('Failed to download payslip');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      GENERATED: 'bg-green-100 text-green-800',
      SENT: 'bg-blue-100 text-blue-800',
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
      key: 'employee',
      header: 'Employee',
      render: (employee: Employee) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{employee.full_name}</div>
          <div className="text-sm text-gray-500">{employee.employee_id}</div>
        </div>
      ),
    },
    {
      key: 'gross_salary',
      header: 'Gross Salary',
      render: (value: string) => formatCurrency(value),
    },
    {
      key: 'total_deductions',
      header: 'Deductions',
      render: (value: string) => formatCurrency(value),
    },
    {
      key: 'net_salary',
      header: 'Net Salary',
      render: (value: string) => (
        <span className="font-medium text-green-600">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'present_days',
      header: 'Present Days',
      render: (value: number, row: Payslip) => `${value}/${row.working_days}`,
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
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: Payslip) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewPayslip(row)}
            className="text-indigo-600 hover:text-indigo-900"
            title="View Payslip"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          {row.status === 'DRAFT' && canManagePayroll && (
            <Button
              size="sm"
              onClick={() => handleGeneratePayslip(row.employee.id)}
              disabled={isGenerating}
            >
              Generate
            </Button>
          )}
          {row.status === 'GENERATED' && (
            <button
              onClick={() => handleDownloadPayslip(row.id)}
              className="text-green-600 hover:text-green-900"
              title="Download PDF"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!canManagePayroll) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access payslip generation.</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Generate Payslips</h1>
            <p className="text-sm text-gray-600">Generate and manage employee payslips</p>
          </div>
          <Button
            onClick={() => handleGeneratePayslip()}
            disabled={isGenerating}
            isLoading={isGenerating}
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Generate All Payslips
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payroll Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <Select
              label="Employee (Optional)"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              placeholder="All employees"
              options={[
                { value: '', label: 'All Employees' },
                ...employees.map(emp => ({
                  value: emp.id,
                  label: emp.full_name,
                })),
              ]}
            />
          </div>
        </div>

        {/* Payslips Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Payslips for {getMonthName(selectedMonth)} {selectedYear}
            </h3>
          </div>
          <Table
            columns={columns}
            data={payslips.filter(p => !selectedEmployee || p.employee.id === selectedEmployee)}
            isLoading={isLoading}
            emptyMessage="No payslips found for the selected period"
          />
        </div>

        {/* Payslip Preview Modal */}
        {selectedPayslip && (
          <Modal
            isOpen={showPayslipModal}
            onClose={() => {
              setShowPayslipModal(false);
              setSelectedPayslip(null);
            }}
            title="Payslip Preview"
            size="lg"
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-bold text-gray-900">Brands Elevate Solutions</h2>
                <p className="text-sm text-gray-600">Payslip for {getMonthName(selectedPayslip.month)} {selectedPayslip.year}</p>
              </div>

              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Employee Details</h3>
                  <p className="text-sm text-gray-900">{selectedPayslip.employee.full_name}</p>
                  <p className="text-sm text-gray-600">{selectedPayslip.employee.employee_id}</p>
                  <p className="text-sm text-gray-600">{selectedPayslip.employee.job_title_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Pay Period</h3>
                  <p className="text-sm text-gray-900">{getMonthName(selectedPayslip.month)} {selectedPayslip.year}</p>
                  <p className="text-sm text-gray-600">Working Days: {selectedPayslip.working_days}</p>
                  <p className="text-sm text-gray-600">Present Days: {selectedPayslip.present_days}</p>
                </div>
              </div>

              {/* Salary Breakdown */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Salary Breakdown</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Gross Salary</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedPayslip.gross_salary)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Total Deductions</span>
                    <span className="text-sm font-medium text-red-600">-{formatCurrency(selectedPayslip.total_deductions)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">Net Salary</span>
                    <span className="text-base font-bold text-green-600">{formatCurrency(selectedPayslip.net_salary)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowPayslipModal(false);
                    setSelectedPayslip(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleDownloadPayslip(selectedPayslip.id)}
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
}