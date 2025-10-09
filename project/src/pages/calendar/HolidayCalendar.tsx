import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CalendarIcon, 
  PlusIcon,
  GiftIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Holiday {
  id: string;
  name: string;
  date: string;
  description: string;
  is_optional: boolean;
  type: 'NATIONAL' | 'RELIGIOUS' | 'COMPANY' | 'OPTIONAL';
}

export default function HolidayCalendar() {
  const { user } = useAuth();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    description: '',
    is_optional: false,
    type: 'COMPANY' as Holiday['type'],
  });

  const canManageHolidays = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_MANAGER';

  useEffect(() => {
    loadHolidays();
  }, [selectedMonth, selectedYear]);

  const loadHolidays = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // const response = await holidayApi.getHolidays({ month: selectedMonth + 1, year: selectedYear });
      
      // Mock data for demonstration
      const mockHolidays: Holiday[] = [
        {
          id: '1',
          name: 'New Year\'s Day',
          date: `${selectedYear}-01-01`,
          description: 'New Year celebration',
          is_optional: false,
          type: 'NATIONAL'
        },
        {
          id: '2',
          name: 'Independence Day',
          date: `${selectedYear}-07-04`,
          description: 'National Independence Day',
          is_optional: false,
          type: 'NATIONAL'
        },
        {
          id: '3',
          name: 'Christmas Day',
          date: `${selectedYear}-12-25`,
          description: 'Christmas celebration',
          is_optional: false,
          type: 'RELIGIOUS'
        },
        {
          id: '4',
          name: 'Company Foundation Day',
          date: `${selectedYear}-03-15`,
          description: 'Brands Elevate Solutions Foundation Day',
          is_optional: false,
          type: 'COMPANY'
        },
        {
          id: '5',
          name: 'Diwali',
          date: `${selectedYear}-11-12`,
          description: 'Festival of Lights',
          is_optional: true,
          type: 'RELIGIOUS'
        }
      ];

      setHolidays(mockHolidays);
    } catch (error) {
      console.error('Error loading holidays:', error);
      toast.error('Failed to load holidays');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHoliday = async () => {
    try {
      // TODO: Replace with actual API call
      // await holidayApi.create(holidayForm);
      
      toast.success('Holiday added successfully!');
      setShowAddModal(false);
      setHolidayForm({
        name: '',
        date: '',
        description: '',
        is_optional: false,
        type: 'COMPANY',
      });
      loadHolidays();
    } catch (error) {
      toast.error('Failed to add holiday');
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isHoliday = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return holidays.find(h => h.date === dateStr);
  };

  const getHolidayTypeBadge = (type: string) => {
    const colors = {
      NATIONAL: 'bg-red-100 text-red-800',
      RELIGIOUS: 'bg-purple-100 text-purple-800',
      COMPANY: 'bg-blue-100 text-blue-800',
      OPTIONAL: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Holiday Calendar</h1>
            <p className="text-gray-600">Company holidays and important dates</p>
          </div>
          {canManageHolidays && (
            <Button onClick={() => setShowAddModal(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Holiday
            </Button>
          )}
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear(selectedYear - 1);
                  } else {
                    setSelectedMonth(selectedMonth - 1);
                  }
                }}
              >
                ←
              </Button>
              <h2 className="text-xl font-semibold text-gray-900">
                {monthNames[selectedMonth]} {selectedYear}
              </h2>
              <Button
                variant="secondary"
                onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear(selectedYear + 1);
                  } else {
                    setSelectedMonth(selectedMonth + 1);
                  }
                }}
              >
                →
              </Button>
            </div>
            <div className="flex space-x-2">
              <Select
                value={selectedYear.toString()}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                options={Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return { value: year.toString(), label: year.toString() };
                })}
              />
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50">
                {day}
              </div>
            ))}
            
            {/* Empty cells for days before month starts */}
            {emptyDays.map(day => (
              <div key={`empty-${day}`} className="p-2 h-20 bg-gray-50"></div>
            ))}
            
            {/* Calendar days */}
            {days.map(day => {
              const holiday = isHoliday(day);
              const isToday = day === new Date().getDate() && 
                            selectedMonth === new Date().getMonth() && 
                            selectedYear === new Date().getFullYear();
              
              return (
                <div
                  key={day}
                  className={`p-2 h-20 border border-gray-200 ${
                    isToday ? 'bg-blue-50 border-blue-300' : 
                    holiday ? 'bg-red-50 border-red-200' : 'bg-white'
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    isToday ? 'text-blue-600' : 
                    holiday ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {day}
                  </div>
                  {holiday && (
                    <div className="mt-1">
                      <div className={`text-xs px-1 py-0.5 rounded ${getHolidayTypeBadge(holiday.type)}`}>
                        {holiday.name}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Holiday List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Holidays in {monthNames[selectedMonth]} {selectedYear}
            </h3>
          </div>
          <div className="px-6 py-4">
            {holidays.filter(h => {
              const holidayDate = new Date(h.date);
              return holidayDate.getMonth() === selectedMonth && holidayDate.getFullYear() === selectedYear;
            }).length > 0 ? (
              <div className="space-y-4">
                {holidays
                  .filter(h => {
                    const holidayDate = new Date(h.date);
                    return holidayDate.getMonth() === selectedMonth && holidayDate.getFullYear() === selectedYear;
                  })
                  .map((holiday) => (
                    <div key={holiday.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <GiftIcon className="h-5 w-5 text-red-500" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{holiday.name}</h4>
                          <p className="text-sm text-gray-600">{holiday.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(holiday.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <div className="flex space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getHolidayTypeBadge(holiday.type)}`}>
                            {holiday.type}
                          </span>
                          {holiday.is_optional && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              Optional
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                No holidays in {monthNames[selectedMonth]} {selectedYear}
              </p>
            )}
          </div>
        </div>

        {/* Add Holiday Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Holiday"
        >
          <div className="space-y-4">
            <Input
              label="Holiday Name"
              value={holidayForm.name}
              onChange={(e) => setHolidayForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter holiday name"
            />
            
            <Input
              label="Date"
              type="date"
              value={holidayForm.date}
              onChange={(e) => setHolidayForm(prev => ({ ...prev, date: e.target.value }))}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={holidayForm.description}
                onChange={(e) => setHolidayForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Holiday description..."
              />
            </div>
            
            <Select
              label="Holiday Type"
              value={holidayForm.type}
              onChange={(e) => setHolidayForm(prev => ({ ...prev, type: e.target.value as Holiday['type'] }))}
              options={[
                { value: 'NATIONAL', label: 'National Holiday' },
                { value: 'RELIGIOUS', label: 'Religious Holiday' },
                { value: 'COMPANY', label: 'Company Holiday' },
                { value: 'OPTIONAL', label: 'Optional Holiday' },
              ]}
            />
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_optional"
                checked={holidayForm.is_optional}
                onChange={(e) => setHolidayForm(prev => ({ ...prev, is_optional: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="is_optional" className="ml-2 block text-sm text-gray-900">
                Optional Holiday
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddHoliday}>
                Add Holiday
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}