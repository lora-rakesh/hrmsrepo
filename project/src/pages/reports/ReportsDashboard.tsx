import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PlayIcon,
  getTrendIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';


interface ReportData {
  id: string;
  name: string;
  type: 'EMPLOYEE' | 'ATTENDANCE' | 'LEAVE' | 'PAYROLL' | 'CUSTOM';
  description: string;
  generated_at: string;
  generated_by: string;
  file_url?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

interface DashboardMetrics {
  totalEmployees: number;
  attendanceRate: number;
  leaveUtilization: number;
  payrollAmount: string;
  trends: {
    employees: number;
    attendance: number;
    leaves: number;
    payroll: number;
  };
}

export default function ReportsDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEmployees: 0,
    attendanceRate: 0,
    leaveUtilization: 0,
    payrollAmount: '0',
    trends: { employees: 0, attendance: 0, leaves: 0, payroll: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    type: 'EMPLOYEE' as ReportData['type'],
    name: '',
    start_date: '',
    end_date: '',
    department: '',
    employee: '',
  });

  const canAccessReports = user?.role !== 'EMPLOYEE';

  useEffect(() => {
    if (canAccessReports) {
      loadReportsData();
    }
  }, [canAccessReports]);

  const loadReportsData = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API calls
      // const [reportsResponse, metricsResponse] = await Promise.all([
      //   reportsApi.getReports(),
      //   reportsApi.getDashboardMetrics()
      // ]);

      // Mock data for demonstration
      const mockReports: ReportData[] = [
        {
          id: '1',
          name: 'Monthly Attendance Report - December 2024',
          type: 'ATTENDANCE',
          description: 'Detailed attendance report for all employees',
          generated_at: '2024-12-31T10:00:00Z',
          generated_by: 'HR Manager',
          file_url: '/reports/attendance-dec-2024.pdf',
          status: 'COMPLETED'
        },
        {
          id: '2',
          name: 'Employee Directory Report',
          type: 'EMPLOYEE',
          description: 'Complete employee information export',
          generated_at: '2024-12-30T15:30:00Z',
          generated_by: 'Admin',
          file_url: '/reports/employees-directory.xlsx',
          status: 'COMPLETED'
        },
        {
          id: '3',
          name: 'Leave Utilization Report - Q4 2024',
          type: 'LEAVE',
          description: 'Quarterly leave utilization analysis',
          generated_at: '2024-12-29T09:15:00Z',
          generated_by: 'HR Manager',
          status: 'PENDING'
        }
      ];

      const mockMetrics: DashboardMetrics = {
        totalEmployees: 125,
        attendanceRate: 94.5,
        leaveUtilization: 67.8,
        payrollAmount: '542000.00',
        trends: {
          employees: 8.2,
          attendance: -2.1,
          leaves: 12.5,
          payroll: 5.7,
        },
      };

      setReports(mockReports);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading reports data:', error);
      toast.error('Failed to load reports data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      // TODO: Replace with actual API call
      // await reportsApi.generateReport(reportForm);
      
      toast.success('Report generation started! You will be notified when it\'s ready.');
      setShowGenerateModal(false);
      setReportForm({
        type: 'EMPLOYEE',
        name: '',
        start_date: '',
        end_date: '',
        department: '',
        employee: '',
      });
      loadReportsData();
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getReportTypeBadge = (type: string) => {
    const colors = {
      EMPLOYEE: 'bg-blue-100 text-blue-800',
      ATTENDANCE: 'bg-green-100 text-green-800',
      LEAVE: 'bg-purple-100 text-purple-800',
      PAYROLL: 'bg-orange-100 text-orange-800',
      CUSTOM: 'bg-gray-100 text-gray-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };


  const getTrendIcon = (trend: number) => {
    return trend >= 0 ? TrendingUpIcon : ArrowTrendingDownIcon;
  };
  const getTrendColor = (trend: number) => {
    return trend >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (!canAccessReports) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access reports.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
            <p className="text-gray-600">Analytics and insights for your organization</p>
          </div>
          <Button onClick={() => setShowGenerateModal(true)}>
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Employees
                    </dt>
                    <dd className="flex items-center">
                      <span className="text-lg font-medium text-gray-900">
                        {metrics.totalEmployees}
                      </span>
                      <span className={`ml-2 flex items-center text-sm ${getTrendColor(metrics.trends.employees)}`}>
                        {React.createElement(getTrendIcon(metrics.trends.employees), { className: 'h-4 w-4 mr-1' })}
                        {Math.abs(metrics.trends.employees)}%
                      </span>
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
                  <ClockIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Attendance Rate
                    </dt>
                    <dd className="flex items-center">
                      <span className="text-lg font-medium text-gray-900">
                        {metrics.attendanceRate}%
                      </span>
                      <span className={`ml-2 flex items-center text-sm ${getTrendColor(metrics.trends.attendance)}`}>
                        {React.createElement(getTrendIcon(metrics.trends.attendance), { className: 'h-4 w-4 mr-1' })}
                        {Math.abs(metrics.trends.attendance)}%
                      </span>
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
                      Leave Utilization
                    </dt>
                    <dd className="flex items-center">
                      <span className="text-lg font-medium text-gray-900">
                        {metrics.leaveUtilization}%
                      </span>
                      <span className={`ml-2 flex items-center text-sm ${getTrendColor(metrics.trends.leaves)}`}>
                        {React.createElement(getTrendIcon(metrics.trends.leaves), { className: 'h-4 w-4 mr-1' })}
                        {Math.abs(metrics.trends.leaves)}%
                      </span>
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
                  <CurrencyDollarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Monthly Payroll
                    </dt>
                    <dd className="flex items-center">
                      <span className="text-lg font-medium text-gray-900">
                        {formatCurrency(metrics.payrollAmount)}
                      </span>
                      <span className={`ml-2 flex items-center text-sm ${getTrendColor(metrics.trends.payroll)}`}>
                        {React.createElement(getTrendIcon(metrics.trends.payroll), { className: 'h-4 w-4 mr-1' })}
                        {Math.abs(metrics.trends.payroll)}%
                      </span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Report Generation */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="secondary"
              className="h-20 flex-col"
              onClick={() => {
                setReportForm(prev => ({ ...prev, type: 'ATTENDANCE', name: 'Monthly Attendance Report' }));
                setShowGenerateModal(true);
              }}
            >
              <ClockIcon className="h-6 w-6 mb-2 text-green-600" />
              Attendance Report
            </Button>

            <Button
              variant="secondary"
              className="h-20 flex-col"
              onClick={() => {
                setReportForm(prev => ({ ...prev, type: 'LEAVE', name: 'Leave Utilization Report' }));
                setShowGenerateModal(true);
              }}
            >
              <CalendarIcon className="h-6 w-6 mb-2 text-purple-600" />
              Leave Report
            </Button>

            <Button
              variant="secondary"
              className="h-20 flex-col"
              onClick={() => {
                setReportForm(prev => ({ ...prev, type: 'EMPLOYEE', name: 'Employee Directory Report' }));
                setShowGenerateModal(true);
              }}
            >
              <UsersIcon className="h-6 w-6 mb-2 text-blue-600" />
              Employee Report
            </Button>

            <Button
              variant="secondary"
              className="h-20 flex-col"
              onClick={() => {
                setReportForm(prev => ({ ...prev, type: 'PAYROLL', name: 'Payroll Summary Report' }));
                setShowGenerateModal(true);
              }}
            >
              <CurrencyDollarIcon className="h-6 w-6 mb-2 text-orange-600" />
              Payroll Report
            </Button>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Reports</h3>
          </div>
          <div className="px-6 py-4">
            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <ChartBarIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{report.name}</h4>
                        <p className="text-sm text-gray-600">{report.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getReportTypeBadge(report.type)}`}>
                            {report.type}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(report.status)}`}>
                            {report.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            Generated by {report.generated_by} on {new Date(report.generated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="secondary">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {report.status === 'COMPLETED' && report.file_url && (
                        <Button size="sm">
                          <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No reports generated yet</p>
                <p className="text-sm text-gray-400">Generate your first report to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Generate Report Modal */}
        <Modal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          title="Generate New Report"
          size="lg"
        >
          <div className="space-y-6">
            <Select
              label="Report Type"
              value={reportForm.type}
              onChange={(e) => setReportForm(prev => ({ ...prev, type: e.target.value as ReportData['type'] }))}
              options={[
                { value: 'EMPLOYEE', label: 'Employee Report' },
                { value: 'ATTENDANCE', label: 'Attendance Report' },
                { value: 'LEAVE', label: 'Leave Report' },
                { value: 'PAYROLL', label: 'Payroll Report' },
                { value: 'CUSTOM', label: 'Custom Report' },
              ]}
            />

            <Input
              label="Report Name"
              value={reportForm.name}
              onChange={(e) => setReportForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter report name"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={reportForm.start_date}
                onChange={(e) => setReportForm(prev => ({ ...prev, start_date: e.target.value }))}
              />
              <Input
                label="End Date"
                type="date"
                value={reportForm.end_date}
                onChange={(e) => setReportForm(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Report Information</h4>
              <p className="text-sm text-blue-700">
                This report will be generated in the background. You'll receive a notification when it's ready for download.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateReport}>
                <PlayIcon className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}