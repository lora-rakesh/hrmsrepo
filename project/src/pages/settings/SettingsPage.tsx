import React, { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CogIcon, 
  UsersIcon, 
  MapPinIcon, 
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  FolderIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Team, Task, Project, WorkMode } from '../../types/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    lead: '',
    members: [] as string[],
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigned_to: '',
    team: '',
    priority: 'MEDIUM' as Task['priority'],
    due_date: '',
    tags: [] as string[],
    estimated_hours: 0,
    progress: 0,
  });

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    team: '',
    start_date: '',
    end_date: '',
    budget: '',
    client: '',
    priority: 'MEDIUM' as Project['priority'],
    tags: [] as string[],
  });

  const [companySettings, setCompanySettings] = useState({
    name: 'Brands Elevate Solutions',
    address: '123 Business Street, Tech City, TC 12345',
    phone: '+1-555-0123',
    email: 'info@brandselevate.com',
    workingHours: '09:00-18:00',
    timezone: 'UTC',
    defaultWorkMode: 'REGULAR' as WorkMode,
    locationRadius: 500,
  });

  const canManageSettings = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_MANAGER';

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'teams', name: 'Teams', icon: UserGroupIcon },
    { id: 'tasks', name: 'Tasks', icon: CalendarIcon },
    { id: 'projects', name: 'Projects', icon: FolderIcon },
    { id: 'locations', name: 'Locations', icon: MapPinIcon },
    { id: 'attendance', name: 'Attendance', icon: ClockIcon },
  ];

  const handleCreateTeam = async () => {
    setIsLoading(true);
    try {
      // TODO: API call to create team
      toast.success('Team created successfully!');
      setShowTeamModal(false);
      setTeamForm({ name: '', description: '', lead: '', members: [] });
    } catch (error) {
      toast.error('Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    setIsLoading(true);
    try {
      // TODO: API call to create task
      toast.success('Task created successfully!');
      setShowTaskModal(false);
      setTaskForm({
        title: '',
        description: '',
        assigned_to: '',
        team: '',
        priority: 'MEDIUM',
        due_date: '',
        tags: [],
      });
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    setIsLoading(true);
    try {
      // TODO: API call to create project
      toast.success('Project created successfully!');
      setShowProjectModal(false);
      setProjectForm({
        name: '',
        description: '',
        team: '',
        start_date: '',
        end_date: '',
      });
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      TODO: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      REVIEW: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      PLANNING: 'bg-yellow-100 text-yellow-800',
      ACTIVE: 'bg-green-100 text-green-800',
      ON_HOLD: 'bg-orange-100 text-orange-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const teamColumns = [
    { key: 'name', header: 'Team Name' },
    { key: 'lead_name', header: 'Team Lead' },
    { key: 'member_count', header: 'Members', render: (value: any, row: Team) => row.members?.length || 0 },
    { key: 'is_active', header: 'Status', render: (value: boolean) => value ? 'Active' : 'Inactive' },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: Team) => (
        <div className="flex space-x-2">
          <button className="text-indigo-600 hover:text-indigo-900">
            <PencilIcon className="h-4 w-4" />
          </button>
          <button className="text-red-600 hover:text-red-900">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const taskColumns = [
    { key: 'title', header: 'Task' },
    { key: 'assigned_to_name', header: 'Assigned To' },
    { key: 'team_name', header: 'Team' },
    { key: 'progress', header: 'Progress', render: (value: number) => `${value}%` },
    { key: 'estimated_hours', header: 'Est. Hours', render: (value: number) => `${value}h` },
    {
      key: 'priority',
      header: 'Priority',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(value)}`}>
          {value}
        </span>
      ),
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
    { key: 'due_date', header: 'Due Date', render: (value: string) => value ? new Date(value).toLocaleDateString() : '-' },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: Task) => (
        <div className="flex space-x-2">
          <button className="text-indigo-600 hover:text-indigo-900">
            <PencilIcon className="h-4 w-4" />
          </button>
          <button className="text-red-600 hover:text-red-900">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const projectColumns = [
    { key: 'name', header: 'Project Name' },
    { key: 'team_name', header: 'Team' },
    { key: 'client', header: 'Client' },
    { key: 'budget', header: 'Budget', render: (value: string) => value ? `$${value}` : '-' },
    {
      key: 'priority',
      header: 'Priority',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(value)}`}>
          {value}
        </span>
      ),
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
    { key: 'progress', header: 'Progress', render: (value: number) => `${value}%` },
    { key: 'start_date', header: 'Start Date', render: (value: string) => new Date(value).toLocaleDateString() },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: Project) => (
        <div className="flex space-x-2">
          <button className="text-indigo-600 hover:text-indigo-900">
            <PencilIcon className="h-4 w-4" />
          </button>
          <button className="text-red-600 hover:text-red-900">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (!canManageSettings) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access settings.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage system settings and configurations</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Company Name"
                  value={companySettings.name}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  label="Email"
                  type="email"
                  value={companySettings.email}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  label="Phone"
                  value={companySettings.phone}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, phone: e.target.value }))}
                />
                <Input
                  label="Working Hours"
                  value={companySettings.workingHours}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, workingHours: e.target.value }))}
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    rows={3}
                    value={companySettings.address}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Team Management</h3>
                <Button onClick={() => setShowTeamModal(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </div>
              <Table
                columns={teamColumns}
                data={teams}
                emptyMessage="No teams created yet"
              />
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Task Management</h3>
                <Button onClick={() => setShowTaskModal(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
              <Table
                columns={taskColumns}
                data={tasks}
                emptyMessage="No tasks created yet"
              />
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Project Management</h3>
                <Button onClick={() => setShowProjectModal(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
              <Table
                columns={projectColumns}
                data={projects}
                emptyMessage="No projects created yet"
              />
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Office Locations</h3>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">Main Office</h4>
                  <p className="text-sm text-gray-600">123 Business Street, Tech City, TC 12345</p>
                  <p className="text-sm text-gray-500">Radius: 500m</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">Branch Office</h4>
                  <p className="text-sm text-gray-600">456 Innovation Ave, Tech City, TC 12346</p>
                  <p className="text-sm text-gray-500">Radius: 300m</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Attendance Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Default Work Mode"
                  value={companySettings.defaultWorkMode}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, defaultWorkMode: e.target.value as WorkMode }))}
                  options={[
                    { value: 'REGULAR', label: 'Regular (Office)' },
                    { value: 'HYBRID', label: 'Hybrid' },
                    { value: 'REMOTE', label: 'Remote' },
                  ]}
                />
                <Input
                  label="Location Radius (meters)"
                  type="number"
                  value={companySettings.locationRadius.toString()}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, locationRadius: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Create Team Modal */}
        <Modal
          isOpen={showTeamModal}
          onClose={() => setShowTeamModal(false)}
          title="Create New Team"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Team Name"
              value={teamForm.name}
              onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter team name"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={teamForm.description}
                onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Team description..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowTeamModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeam} isLoading={isLoading}>
                Create Team
              </Button>
            </div>
          </div>
        </Modal>

        {/* Create Task Modal */}
        <Modal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          title="Create New Task"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Task Title"
              value={taskForm.title}
              onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={taskForm.description}
                onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Task description..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Priority"
                value={taskForm.priority}
                onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                options={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'URGENT', label: 'Urgent' },
                ]}
              />
              <Input
                label="Due Date"
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
              />
              <Input
                label="Estimated Hours"
                type="number"
                value={taskForm.estimated_hours.toString()}
                onChange={(e) => setTaskForm(prev => ({ ...prev, estimated_hours: parseInt(e.target.value) || 0 }))}
                placeholder="8"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowTaskModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask} isLoading={isLoading}>
                Create Task
              </Button>
            </div>
          </div>
        </Modal>

        {/* Create Project Modal */}
        <Modal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          title="Create New Project"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Project Name"
              value={projectForm.name}
              onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter project name"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={projectForm.description}
                onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Project description..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Client"
                value={projectForm.client}
                onChange={(e) => setProjectForm(prev => ({ ...prev, client: e.target.value }))}
                placeholder="Client name"
              />
              <Input
                label="Budget"
                type="number"
                value={projectForm.budget}
                onChange={(e) => setProjectForm(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="50000"
              />
              <Select
                label="Priority"
                value={projectForm.priority}
                onChange={(e) => setProjectForm(prev => ({ ...prev, priority: e.target.value as Project['priority'] }))}
                options={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'URGENT', label: 'Urgent' },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={projectForm.start_date}
                onChange={(e) => setProjectForm(prev => ({ ...prev, start_date: e.target.value }))}
              />
              <Input
                label="End Date"
                type="date"
                value={projectForm.end_date}
                onChange={(e) => setProjectForm(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowProjectModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject} isLoading={isLoading}>
                Create Project
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}