import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { generatePayslipPDF, PayslipData } from '../../utils/pdfGenerator';
import { 
  DocumentTextIcon, 
  EyeIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface EmployeePayslip {
  id: string;
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

export default function MyPayslips() {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState<EmployeePayslip[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<EmployeePayslip | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [showPayslipModal, setShowPayslipModal] = useState(false);

  useEffect(() => {
    loadMyPayslips();
  }, [selectedYear]);

  const loadMyPayslips = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // const response = await payrollApi.getMyPayslips({ year: selectedYear });
      
      // Mock data for demonstration
      const mockPayslips: EmployeePayslip[] = Array.from({ length: 12 }, (_, index) => ({
        id: `payslip-${index + 1}`,
        month: index + 1,
        year: selectedYear,
        gross_salary: '5000.00',
        total_deductions: '1000.00',
        net_salary: '4000.00',
        working_days: 22,
        present_days: 20,
        status: index < 10 ? 'GENERATED' : 'DRAFT',
        generated_at: index < 10 ? new Date().toISOString() : undefined,
      }));

      setPayslips(mockPayslips.filter(p => p.status === 'GENERATED'));
    } catch (error) {
      console.error('Error loading payslips:', error);
      toast.error('Failed to load payslips');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPayslip = (payslip: EmployeePayslip) => {
    setSelectedPayslip(payslip);
    setShowPayslipModal(true);
  };

  const handleDownloadPayslip = async (payslip: EmployeePayslip) => {
    try {
      if (!user?.employee_profile) {
        toast.error('Employee profile not found');
        return;
      }

      const payslipData: PayslipData = {
        employee: {
          full_name: user.full_name,
          employee_id: user.employee_profile?.employee_id || 'N/A',
          job_title_name: user.employee_profile?.job_title_name,
          department_name: user.employee_profile?.department_name,
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

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1).toLocaleString('default', { month: 'long' });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      GENERATED: 'bg-green-100 text-green-800',
      SENT: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year.toString(), label: year.toString() };
  });

  const columns = [
    {
      key: 'month',
      header: 'Month',
      render: (value: number, row: EmployeePayslip) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{getMonthName(value)} {row.year}</div>
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
      render: (value: number, row: EmployeePayslip) => `${value}/${row.working_days}`,
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
      render: (_: any, row: EmployeePayslip) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewPayslip(row)}
            className="text-indigo-600 hover:text-indigo-900"
            title="View Payslip"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDownloadPayslip(row)}
            className="text-green-600 hover:text-green-900"
            title="Download PDF"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
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
            <h1 className="text-2xl font-bold text-gray-900">My Payslips</h1>
            <p className="text-sm text-gray-600">View and download your salary payslips</p>
          </div>
        </div>

        {/* Year Filter */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Year"
              value={selectedYear.toString()}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              options={yearOptions}
            />
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>

        {/* Current Month Summary */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Current Month</h2>
              <p className="text-indigo-100">{getMonthName(new Date().getMonth() + 1)} {new Date().getFullYear()}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatCurrency('4000.00')}</p>
              <p className="text-indigo-100">Net Salary</p>
            </div>
          </div>
        </div>

        {/* Payslips Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Payslip History
            </h3>
          </div>
          <Table
            columns={columns}
            data={payslips}
            isLoading={isLoading}
            emptyMessage="No payslips available for the selected year"
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
                  <p className="text-sm text-gray-900">{user?.full_name}</p>
                  <p className="text-sm text-gray-600">{user?.employee_profile?.employee_id}</p>
                  <p className="text-sm text-gray-600">{user?.employee_profile?.job_title_name}</p>
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
                  onClick={() => handleDownloadPayslip(selectedPayslip)}
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