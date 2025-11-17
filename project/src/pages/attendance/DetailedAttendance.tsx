import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { attendanceApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ClockIcon, 
  PlayIcon,
  PauseIcon,
  StopIcon,
  CakeIcon,
  HomeIcon,
  MapPinIcon,
  WifiIcon
} from '@heroicons/react/24/outline';
import { getCurrentLocation, isWithinRange, COMPANY_LOCATIONS, Location } from '../../utils/locationUtils';
import toast from 'react-hot-toast';
import { CoffeeIcon } from 'lucide-react';


interface AttendanceSession {
  id: string;
  type: 'CHECK_IN' | 'BREAK_START' | 'BREAK_END' | 'LUNCH_START' | 'LUNCH_END' | 'CHECK_OUT';
  timestamp: string;
  location?: Location;
  work_mode: 'REGULAR' | 'HYBRID' | 'REMOTE';
}

interface TodayAttendance {
  date: string;
  sessions: AttendanceSession[];
  total_work_hours: string;
  total_break_hours: string;
  status: 'NOT_STARTED' | 'CHECKED_IN' | 'ON_BREAK' | 'ON_LUNCH' | 'COMPLETED';
  work_mode: 'REGULAR' | 'HYBRID' | 'REMOTE';
}

export default function DetailedAttendance() {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [workMode, setWorkMode] = useState<'REGULAR' | 'HYBRID' | 'REMOTE'>('REGULAR');
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationStatus, setLocationStatus] = useState<'checking' | 'in-range' | 'out-of-range' | 'remote'>('checking');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breakType, setBreakType] = useState<'BREAK' | 'LUNCH'>('BREAK');

  useEffect(() => {
    loadTodayAttendance();
    checkUserLocation();
  }, [workMode]);

  const checkUserLocation = async () => {
    if (workMode === 'REMOTE') {
      setLocationStatus('remote');
      return;
    }

    try {
      setLocationStatus('checking');
      const location = await getCurrentLocation();
      setUserLocation(location);

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

  const loadTodayAttendance = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // const response = await attendanceApi.getTodayDetailedAttendance();
      
      // Mock data for demonstration
      const mockAttendance: TodayAttendance = {
        date: new Date().toISOString().split('T')[0],
        sessions: [],
        total_work_hours: '0.00',
        total_break_hours: '0.00',
        status: 'NOT_STARTED',
        work_mode: workMode,
      };

      setTodayAttendance(mockAttendance);
    } catch (error) {
      console.error('Error loading today attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendanceAction = async (action: AttendanceSession['type']) => {
    if (workMode !== 'REMOTE' && locationStatus === 'out-of-range') {
      toast.error('You must be within 500m of the office for this action');
      return;
    }

    setIsProcessing(true);
    try {
      const sessionData: Partial<AttendanceSession> = {
        type: action,
        timestamp: new Date().toISOString(),
        work_mode: workMode,
      };

      if (userLocation && workMode !== 'REMOTE') {
        sessionData.location = userLocation;
      }

      // TODO: Replace with actual API call
      // await attendanceApi.recordSession(sessionData);

      // Update local state
      const newSession: AttendanceSession = {
        id: Date.now().toString(),
        ...sessionData as AttendanceSession,
      };

      setTodayAttendance(prev => {
        if (!prev) return null;
        
        const updatedSessions = [...prev.sessions, newSession];
        let newStatus = prev.status;

        switch (action) {
          case 'CHECK_IN':
            newStatus = 'CHECKED_IN';
            break;
          case 'BREAK_START':
          case 'LUNCH_START':
            newStatus = action === 'BREAK_START' ? 'ON_BREAK' : 'ON_LUNCH';
            break;
          case 'BREAK_END':
          case 'LUNCH_END':
            newStatus = 'CHECKED_IN';
            break;
          case 'CHECK_OUT':
            newStatus = 'COMPLETED';
            break;
        }

        return {
          ...prev,
          sessions: updatedSessions,
          status: newStatus,
        };
      });

      const actionMessages = {
        CHECK_IN: 'Checked in successfully!',
        BREAK_START: 'Break started',
        BREAK_END: 'Break ended',
        LUNCH_START: 'Lunch break started',
        LUNCH_END: 'Lunch break ended',
        CHECK_OUT: 'Checked out successfully!',
      };

      toast.success(actionMessages[action]);
      setShowBreakModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Action failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const getLastSession = (type: AttendanceSession['type']) => {
    return todayAttendance?.sessions.find(s => s.type === type);
  };

  const isOnBreak = () => {
    const lastBreakStart = getLastSession('BREAK_START');
    const lastBreakEnd = getLastSession('BREAK_END');
    return lastBreakStart && (!lastBreakEnd || lastBreakStart.timestamp > lastBreakEnd.timestamp);
  };

  const isOnLunch = () => {
    const lastLunchStart = getLastSession('LUNCH_START');
    const lastLunchEnd = getLastSession('LUNCH_END');
    return lastLunchStart && (!lastLunchEnd || lastLunchStart.timestamp > lastLunchEnd.timestamp);
  };

  const canCheckIn = () => {
    return todayAttendance?.status === 'NOT_STARTED';
  };

  const canCheckOut = () => {
    return todayAttendance?.status === 'CHECKED_IN' && !isOnBreak() && !isOnLunch();
  };

  const canStartBreak = () => {
    return todayAttendance?.status === 'CHECKED_IN' && !isOnBreak() && !isOnLunch();
  };

  const canEndBreak = () => {
    return isOnBreak();
  };

  const canStartLunch = () => {
    return todayAttendance?.status === 'CHECKED_IN' && !isOnBreak() && !isOnLunch();
  };

  const canEndLunch = () => {
    return isOnLunch();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSessionIcon = (type: AttendanceSession['type']) => {
    const icons = {
      CHECK_IN: PlayIcon,
      BREAK_START: PauseIcon,
      BREAK_END: PlayIcon,
      LUNCH_START: CoffeeIcon,
      LUNCH_END: PlayIcon,
      CHECK_OUT: StopIcon,
    };
    return icons[type];
  };

  const getSessionLabel = (type: AttendanceSession['type']) => {
    const labels = {
      CHECK_IN: 'Checked In',
      BREAK_START: 'Break Started',
      BREAK_END: 'Break Ended',
      LUNCH_START: 'Lunch Started',
      LUNCH_END: 'Lunch Ended',
      CHECK_OUT: 'Checked Out',
    };
    return labels[type];
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="bg-white p-6 rounded-lg shadow h-64"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Tracker</h1>
          <p className="text-gray-600">Track your daily work hours with detailed break management</p>
        </div>

        {/* Work Mode and Location Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Work Mode & Location</h2>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Work Mode:</label>
              <select
                value={workMode}
                onChange={(e) => {
                  setWorkMode(e.target.value as typeof workMode);
                  checkUserLocation();
                }}
                className="text-sm border border-gray-300 rounded-md px-3 py-1"
              >
                <option value="REGULAR">🏢 Regular (Office)</option>
                <option value="HYBRID">🔄 Hybrid</option>
                <option value="REMOTE">🏠 Remote</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
              {locationStatus === 'checking' && (
                <span className="text-yellow-600">📍 Checking location...</span>
              )}
              {locationStatus === 'in-range' && (
                <span className="text-green-600">✅ Within office range (500m)</span>
              )}
              {locationStatus === 'out-of-range' && (
                <span className="text-red-600">❌ Outside office range</span>
              )}
              {locationStatus === 'remote' && (
                <span className="text-blue-600 flex items-center">
                  <WifiIcon className="h-4 w-4 mr-1" />
                  🌐 Remote work mode
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Attendance Controls */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Today's Attendance</h2>
          
          {/* Current Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Current Status:</p>
                <p className="text-lg font-bold text-gray-900">
                  {todayAttendance?.status === 'NOT_STARTED' && '⏳ Not Started'}
                  {todayAttendance?.status === 'CHECKED_IN' && '✅ Working'}
                  {todayAttendance?.status === 'ON_BREAK' && '☕ On Break'}
                  {todayAttendance?.status === 'ON_LUNCH' && '🍽️ On Lunch'}
                  {todayAttendance?.status === 'COMPLETED' && '🏁 Day Complete'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Work Hours Today</p>
                <p className="text-xl font-bold text-green-600">
                  {todayAttendance?.total_work_hours || '0.00'}h
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Check In */}
            <Button
              onClick={() => handleAttendanceAction('CHECK_IN')}
              disabled={!canCheckIn() || isProcessing || (workMode !== 'REMOTE' && locationStatus === 'out-of-range')}
              isLoading={isProcessing}
              className="bg-green-600 hover:bg-green-700 h-16 flex-col"
            >
              <PlayIcon className="h-6 w-6 mb-1" />
              Check In
            </Button>

            {/* Break Start */}
            <Button
              onClick={() => {
                setBreakType('BREAK');
                setShowBreakModal(true);
              }}
              disabled={!canStartBreak() || isProcessing}
              variant="secondary"
              className="h-16 flex-col"
            >
              <PauseIcon className="h-6 w-6 mb-1" />
              Start Break
            </Button>

            {/* Break End */}
            <Button
              onClick={() => handleAttendanceAction('BREAK_END')}
              disabled={!canEndBreak() || isProcessing}
              variant="secondary"
              className="h-16 flex-col"
            >
              <PlayIcon className="h-6 w-6 mb-1" />
              End Break
            </Button>

            {/* Lunch Start */}
            <Button
              onClick={() => {
                setBreakType('LUNCH');
                setShowBreakModal(true);
              }}
              disabled={!canStartLunch() || isProcessing}
              className="bg-orange-600 hover:bg-orange-700 h-16 flex-col"
            >
              <CoffeeIcon className="h-6 w-6 mb-1" />
              Start Lunch
            </Button>

            {/* Lunch End */}
            <Button
              onClick={() => handleAttendanceAction('LUNCH_END')}
              disabled={!canEndLunch() || isProcessing}
              className="bg-orange-600 hover:bg-orange-700 h-16 flex-col"
            >
              <PlayIcon className="h-6 w-6 mb-1" />
              End Lunch
            </Button>

            {/* Check Out */}
            <Button
              onClick={() => handleAttendanceAction('CHECK_OUT')}
              disabled={!canCheckOut() || isProcessing || (workMode !== 'REMOTE' && locationStatus === 'out-of-range')}
              isLoading={isProcessing}
              variant="danger"
              className="h-16 flex-col"
            >
              <StopIcon className="h-6 w-6 mb-1" />
              Check Out
            </Button>
          </div>
        </div>

        {/* Today's Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Timeline</h3>
          
          {todayAttendance?.sessions.length ? (
            <div className="space-y-4">
              {todayAttendance.sessions.map((session, index) => {
                const Icon = getSessionIcon(session.type);
                return (
                  <div key={session.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {getSessionLabel(session.type)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatTime(session.timestamp)} • {session.work_mode} Mode
                      </p>
                    </div>
                    <div className="text-sm text-gray-400">
                      #{index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No attendance records for today</p>
              <p className="text-sm text-gray-400">Start by checking in to begin tracking</p>
            </div>
          )}
        </div>

        {/* Break Confirmation Modal */}
        <Modal
          isOpen={showBreakModal}
          onClose={() => setShowBreakModal(false)}
          title={`Start ${breakType === 'BREAK' ? 'Break' : 'Lunch Break'}`}
        >
          <div className="space-y-4">
            <div className="text-center">
              {breakType === 'BREAK' ? (
                <PauseIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              ) : (
                <CoffeeIcon className="h-16 w-16 text-orange-600 mx-auto mb-4" />
              )}
              <p className="text-lg font-medium text-gray-900">
                Start {breakType === 'BREAK' ? 'Break' : 'Lunch Break'}?
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Your work timer will be paused until you return.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowBreakModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAttendanceAction(breakType === 'BREAK' ? 'BREAK_START' : 'LUNCH_START')}
                isLoading={isProcessing}
                className={breakType === 'BREAK' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}
              >
                Start {breakType === 'BREAK' ? 'Break' : 'Lunch'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Work Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Work Hours Today
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {todayAttendance?.total_work_hours || '0.00'}h
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
                  <PauseIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Break Time
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {todayAttendance?.total_break_hours || '0.00'}h
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
                  <HomeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Work Mode
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {workMode}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}