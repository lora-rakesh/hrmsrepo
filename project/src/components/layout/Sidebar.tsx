import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  Bars3Icon,
  XMarkIcon,
  CalendarDaysIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  roles?: string[];
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Employees', href: '/employees', icon: UsersIcon , roles : ['SUPER_ADMIN', 'HR_MANAGER', 'TEAM_LEAD']},
  { name: 'Leaves', href: '/leaves', icon: CalendarIcon },
    { name: 'All Leaves', href: '/leaves/all', icon: ListBulletIcon },
  { name: 'Holiday Calendar', href: '/calendar', icon: CalendarDaysIcon },
  { name: 'Attendance', href: '/attendance', icon: ClockIcon },
  { name: 'My Payslips', href: '/my-payslips', icon: DocumentTextIcon, roles: ['EMPLOYEE'] },
  { name: 'Payroll', href: '/payroll', icon: CurrencyDollarIcon, roles: ['SUPER_ADMIN', 'PAYROLL_ADMIN'] },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon, roles: ['SUPER_ADMIN', 'HR_MANAGER', 'TEAM_LEAD'] },
  { name: 'HR Dashboard', href: '/hr', icon: UserGroupIcon, roles: ['SUPER_ADMIN', 'HR_MANAGER'] },
  { name: 'Team Lead', href: '/team-lead', icon: BriefcaseIcon, roles: ['SUPER_ADMIN', 'HR_MANAGER', 'TEAM_LEAD'] },
  { name: 'Settings', href: '/settings', icon: CogIcon, roles: ['SUPER_ADMIN', 'HR_MANAGER'] },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-100 bg-white shadow-lg border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
        w-64
      `}>
        <div className="flex flex-col h-full pt-16 lg:pt-0">
          {/* Mobile Close Button */}
          <div className="lg:hidden absolute top-4 right-4">
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {filteredNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all
                    ${isActive
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon
                    className={`mr-4 h-5 w-5 flex-shrink-0`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
          
          {/* User info at bottom */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex-shrink-0 w-full">
              <div className="flex items-center">
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.role?.replace('_', ' ') || 'User'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}