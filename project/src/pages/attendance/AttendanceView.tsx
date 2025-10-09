import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { attendanceApi } from '../../services/api';
import { Attendance, PaginatedResponse, WorkMode } from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';
import { ClockIcon, CalendarIcon, MapPinIcon, WifiIcon } from '@heroicons/react/24/outline';
import { getCurrentLocation, isWithinRange, COMPANY_LOCATIONS, Location } from '../../utils/locationUtils';
import toast from 'react-hot-toast';

export default function AttendanceView() {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [workMode, setWorkMode] = useState<WorkMode>('REGULAR');
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationStatus, setLocationStatus] = useState<'checking' | 'in-range' | 'out-of-range' | 'remote'>('checking');
  const [isLoading, setIsLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
  });

  const isManager = user?.role !== 'EMPLOYEE';

  useEffect(() => {
    loadAttendanceData();
    loadTodayAttendance();
    checkUserLocation();
  }, [dateFilter, pagination.page]);

  const checkUserLocation = async () => {
    if (workMode === 'REMOTE') {
      setLocationStatus('remote');
      return;
    }

    try {
      setLocationStatus('checking');
      const location = await getCurrentLocation();
      setUserLocation(location);

      // Check if user is within range of any company location
      const isInRange = COMPANY_LOCATIONS.some(companyLoc => 
        isWithinRange(location, companyLoc)
      );

      setLocationStatus(isInRange ? 'in-range' : 'out-of-range');
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Unable to get your location. Please enable location services.');
      setLocationStatus('out-of-range');
    }
  };

  const loadAttendanceData = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: pagination.page,
        ordering: '-date',
      };
      
      if (dateFilter) {
        params.date = dateFilter;
      }

      const response: PaginatedResponse<Attendance> = await attendanceApi.getRecords(params);
      setAttendanceRecords(response.results);
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(response.count / 20),
        totalCount: response.count,
      }));
    } catch (error) {
      console.error('Error loading attendance records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodayAttendance = async () => {
    try {
      const response = await attendanceApi.getTodayAttendance();
      setTodayAttendance(response);
    } catch (error) {
      console.error('Error loading today attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    if (workMode !== 'REMOTE' && locationStatus === 'out-of-range') {
      toast.error('You must be within 500m of the office to check in');
      return;
    }

    setCheckingIn(true);
    try {
      const checkInData: any = {
        work_mode: workMode,
      };

      if (userLocation && workMode !== 'REMOTE') {
        checkInData.location = userLocation;
      }

      await attendanceApi.checkIn(checkInData);
      toast.success('Checked in successfully!');
      loadTodayAttendance();
      loadAttendanceData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (workMode !== 'REMOTE' && locationStatus === 'out-of-range') {
      toast.error('You must be within 500m of the office to check out');
      return;
    }

    setCheckingIn(true);
    try {
      const checkOutData: any = {
        work_mode: workMode,
      };

      if (userLocation && workMode !== 'REMOTE') {
        checkOutData.location = userLocation;
      }

      await attendanceApi.checkOut(checkOutData);
      toast.success('Checked out successfully!');
      loadTodayAttendance();
      loadAttendanceData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Check-out failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PRESENT: 'bg-green-100 text-green-800',
      ABSENT: 'bg-red-100 text-red-800',
      HALF_DAY: 'bg-yellow-100 text-yellow-800',
      LATE: 'bg-orange-100 text-orange-800',
      ON_LEAVE: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
      key: 'date',
      header: 'Date',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'check_in_time',
      header: 'Check In',
      render: (value: string) => value ? formatTime(value) : '-',
    },
    {
      key: 'check_out_time',
      header: 'Check Out',
      render: (value: string) => value ? formatTime(value) : '-',
    },
    {
      key: 'total_hours',
      header: 'Total Hours',
      render: (value: string) => value ? `${parseFloat(value).toFixed(2)}h` : '-',
    },
    {
      key: 'overtime_hours',
      header: 'Overtime',
      render: (value: string) => value && parseFloat(value) > 0 ? `${parseFloat(value).toFixed(2)}h` : '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(value)}`}>
          {value.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'shift_name',
      header: 'Shift',
      render: (value: string) => value || '-',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isManager ? 'Attendance Management' : 'My Attendance'}
            </h1>
            <p className="text-sm text-gray-600">Track and manage attendance records</p>
          </div>
        </div>

        {/* Today's Attendance Card - Only for employees */}
        {!isManager && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              {/* Work Mode Selection */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Today's Attendance
                </h2>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Work Mode:</label>
                  <select
                    value={workMode}
                    onChange={(e) => {
                      setWorkMode(e.target.value as WorkMode);
                      checkUserLocation();
                    }}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="REMOTE">Remote</option>
                  </select>
                </div>
              </div>

              {/* Location Status */}
              <div className="flex items-center space-x-2 text-sm">
                <MapPinIcon className="h-4 w-4" />
                {locationStatus === 'checking' && (
                  <span className="text-yellow-600">Checking location...</span>
                )}
                {locationStatus === 'in-range' && (
                  <span className="text-green-600">✓ Within office range</span>
                )}
                {locationStatus === 'out-of-range' && (
                  <span className="text-red-600">✗ Outside office range (500m required)</span>
                )}
                {locationStatus === 'remote' && (
                  <span className="text-blue-600 flex items-center">
                    <WifiIcon className="h-4 w-4 mr-1" />
                    Remote work mode
                  </span>
                )}
              </div>

              {/* Attendance Info */}
              <div>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              {/* Check In/Out Status and Buttons */}
              <div className="flex items-center justify-between">
                <div>
                {todayAttendance?.check_in_time ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      Checked in: {formatTime(todayAttendance.check_in_time)}
                    </p>
                    {todayAttendance.check_out_time && (
                      <p className="text-sm text-gray-600">
                        Checked out: {formatTime(todayAttendance.check_out_time)}
                      </p>
                    )}
                    {todayAttendance.total_hours && (
                      <p className="text-sm font-medium text-green-600">
                        Total: {parseFloat(todayAttendance.total_hours).toFixed(2)}h
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Not checked in</p>
                )}
                </div>
                
                <div className="flex space-x-3">
                  {!todayAttendance?.check_in_time ? (
                    <Button
                      onClick={handleCheckIn}
                      isLoading={checkingIn}
                      disabled={workMode !== 'REMOTE' && locationStatus === 'out-of-range'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Check In
                    </Button>
                  ) : !todayAttendance.check_out_time ? (
                    <Button
                      onClick={handleCheckOut}
                      isLoading={checkingIn}
                      disabled={workMode !== 'REMOTE' && locationStatus === 'out-of-range'}
                      variant="danger"
                    >
                      Check Out
                    </Button>
                  ) : (
                    <div className="flex items-center text-green-600">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">Day Complete</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Filter by Date"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Attendance Records</h3>
          </div>
          <Table
            columns={columns}
            data={attendanceRecords}
            isLoading={isLoading}
            emptyMessage="No attendance records found"
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