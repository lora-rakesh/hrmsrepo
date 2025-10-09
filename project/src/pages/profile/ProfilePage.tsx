import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types/api';
import { UserIcon, KeyIcon, CameraIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState<Partial<User>>({
    first_name: '',
    last_name: '',
    phone: '',
    organization: '',
  });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || '',
        organization: user.organization || '',
      });
      
      // Set avatar preview if user has an avatar
      if (user.avatar) {
        // Make sure to use absolute URL if the avatar is a relative path
        const avatarUrl = user.avatar.startsWith('http') 
          ? user.avatar 
          : `http://localhost:8000${user.avatar}`;
        setAvatarPreview(avatarUrl);
      }
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedUser = await authApi.updateProfile(profileData);
      updateProfile(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.new_password_confirm) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.changePassword(passwordData);
      toast.success('Password changed successfully!');
      setPasswordData({
        old_password: '',
        new_password: '',
        new_password_confirm: '',
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setAvatarLoading(true);

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', file);

      // Upload avatar
      const updatedUser = await authApi.uploadAvatar(formData);
      updateProfile(updatedUser);
      toast.success('Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      // Revert preview on error
      setAvatarPreview(user?.avatar || null);
      toast.error(error.response?.data?.detail || 'Failed to upload profile picture');
    } finally {
      setAvatarLoading(false);
      // Clear file input
      e.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarLoading(true);

    try {
      // Use update endpoint with avatar: undefined
      const updatedUser = await authApi.updateProfile({ avatar: undefined });
      updateProfile(updatedUser);
      setAvatarPreview(null);
      toast.success('Profile picture removed successfully!');
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast.error(error.response?.data?.detail || 'Failed to remove profile picture');
    } finally {
      setAvatarLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: UserIcon },
    { id: 'password', name: 'Change Password', icon: KeyIcon },
  ];

  return (
    <Layout>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-indigo-700 px-6 py-8">
            <div className="flex items-center space-x-6">
              {/* Avatar Section - More Compact */}
              <div className="relative group">
                <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/30">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-10 w-10 text-white/80" />
                  )}
                </div>
                {avatarLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
                
                {/* Upload Button Overlay */}
                <label className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg cursor-pointer group-hover:scale-110 transition-transform">
                  <CameraIcon className="h-4 w-4 text-gray-700" />
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={avatarLoading}
                  />
                </label>
              </div>
              
              {/* User Info */}
              <div className="text-white">
                <h1 className="text-2xl font-bold">
                  {user?.first_name} {user?.last_name}
                </h1>
                <p className="text-blue-100">{user?.email}</p>
                {/* <p className="text-blue-100 text-sm capitalize">
                  {user?.role?.replace(/_/g, ' ')} • {user?.organization}
                </p> */}
              </div>
            </div>
          </div>

          {/* Tab Navigation - More Compact */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={user?.username || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                  </div>

                  <Input
                    label="First Name"
                    name="first_name"
                    required
                    value={profileData.first_name || ''}
                    onChange={handleProfileChange}
                  />

                  <Input
                    label="Last Name"
                    name="last_name"
                    required
                    value={profileData.last_name || ''}
                    onChange={handleProfileChange}
                  />

                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={profileData.phone || ''}
                    onChange={handleProfileChange}
                    placeholder="+1 (555) 123-4567"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={user?.organization || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="min-w-[120px]"
                  >
                    Update Profile
                  </Button>
                </div>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="max-w-md space-y-4">
                  <Input
                    label="Current Password"
                    name="old_password"
                    type="password"
                    required
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                  />

                  <Input
                    label="New Password"
                    name="new_password"
                    type="password"
                    required
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    helperText="Password must be at least 8 characters long"
                  />

                  <Input
                    label="Confirm New Password"
                    name="new_password_confirm"
                    type="password"
                    required
                    value={passwordData.new_password_confirm}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="min-w-[120px]"
                  >
                    Change Password
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Account Information - More Compact */}
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Member Since</label>
                <p className="text-sm text-gray-900 mt-1">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Login</label>
                <p className="text-sm text-gray-900 mt-1">
                  {user?.last_login ? new Date(user.last_login).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }) : 'Never'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Account Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                  user?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">User ID</label>
                <p className="text-sm text-gray-900 font-mono mt-1">{user?.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}