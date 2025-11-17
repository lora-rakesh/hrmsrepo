import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  XMarkIcon,
  CalendarDaysIcon,
  ListBulletIcon,
  LifebuoyIcon,
  PhoneIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<any>;
  roles?: string[];
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Employees', href: '/employees', icon: UsersIcon, roles: ['SUPER_ADMIN', 'HR_MANAGER', 'TEAM_LEAD'] },
  {
    name: 'Leaves',
    href: '/leaves',
    icon: CalendarIcon,
    children: [
      { name: 'All Leaves', href: '/leaves/all', icon: ListBulletIcon },
    ],
  },
  {
    name: 'Service Desk',
    icon: LifebuoyIcon,
    roles: ['EMPLOYEE'],
    children: [
      { name: 'HR Contact', href: '/service/hr-contact', icon: PhoneIcon },
      { name: 'Helpdesk', href: '/service/helpdesk', icon: WrenchScrewdriverIcon },
      { name: 'Employee Self Service', href: '/service/employee-self-service', icon: UsersIcon },
    ],
  },
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
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const filteredNavigation = navigation.filter(
    (item) => !item.roles || item.roles.includes(user?.role || '')
  );

  // Keep dropdown open if the current route matches one of its children
  useEffect(() => {
    filteredNavigation.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) =>
          location.pathname.startsWith(child.href || '')
        );
        if (isChildActive) setOpenDropdown(item.name);
      }
    });
  }, [location.pathname]);

  const handleToggle = (item: NavigationItem) => {
    if (item.children) {
      setOpenDropdown(openDropdown === item.name ? null : item.name);
      navigate(item.href || '#');
    } else if (item.href) {
      navigate(item.href);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0`}
        style={{ width: '16rem', flexShrink: 0 }}
      >
        <div className="flex flex-col h-full pt-16 lg:pt-0">
          {/* Close button for mobile */}
          <div className="lg:hidden absolute top-4 right-4">
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            <nav className="flex-1 px-4 py-6 space-y-1">
              {filteredNavigation.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() => handleToggle(item)}
                        className="w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        <item.icon className="mr-4 h-5 w-5" />
                        <span className="flex-1 text-left">{item.name}</span>
                        <span>{openDropdown === item.name ? '▾' : '▸'}</span>
                      </button>

                      {openDropdown === item.name && (
                        <div className="ml-8 mt-1 space-y-1 transition-all duration-200">
                          {item.children.map((sub) => (
                            <NavLink
                              key={sub.name}
                              to={sub.href!}
                              onClick={() => {
                                if (window.innerWidth < 1024) onClose();
                              }}
                              className={({ isActive }) =>
                                `group flex items-center px-3 py-2 text-sm rounded-lg transition
                                ${isActive
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                              }
                            >
                              <sub.icon className="mr-3 h-4 w-4" />
                              {sub.name}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <NavLink
                      to={item.href!}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={({ isActive }) =>
                        `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition
                        ${isActive
                          ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <item.icon className="mr-4 h-5 w-5" />
                      {item.name}
                    </NavLink>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* User Info */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center w-full">
              <div className="ml-3">
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
    </>
  );
}
