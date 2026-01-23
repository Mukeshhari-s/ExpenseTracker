import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { profileAPI } from '../services/api';
import { getUser, setUser, logout } from '../utils/auth';
import { User, Camera, Mail, DollarSign, Lock, LogOut, Save } from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  const currentUser = getUser();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    currency: currentUser?.currency || 'USD',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
    setMessage({ type: '', text: '' });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validate password change
    if (profileData.new_password) {
      if (!profileData.current_password) {
        setMessage({ type: 'error', text: 'Current password is required to change password' });
        setLoading(false);
        return;
      }
      if (profileData.new_password !== profileData.confirm_password) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        setLoading(false);
        return;
      }
      if (profileData.new_password.length < 6) {
        setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
        setLoading(false);
        return;
      }
    }

    try {
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        currency: profileData.currency,
      };

      if (profileData.new_password) {
        updateData.current_password = profileData.current_password;
        updateData.new_password = profileData.new_password;
      }

      const response = await profileAPI.update(updateData);
      
      // Update local storage
      setUser(response.data.user);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear password fields
      setProfileData({
        ...profileData,
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Error updating profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    setUploadingPhoto(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('profile_photo', file);

      const response = await profileAPI.uploadPhoto(formData);
      
      // Update user with new photo
      const updatedUser = { ...currentUser, profile_photo: response.data.profile_photo };
      setUser(updatedUser);
      
      setMessage({ type: 'success', text: 'Profile photo updated successfully!' });
      
      // Reload page to show new photo
      window.location.reload();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Error uploading photo' 
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-8">Profile & Settings</h1>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-900/20 border border-green-200 text-green-700' 
              : 'bg-red-900/20 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Photo Section */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-100 mb-6">Profile Photo</h2>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              {currentUser?.profile_photo ? (
                <img
                  src={`http://localhost:5000${currentUser.profile_photo}`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-600"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-900/20 flex items-center justify-center border-4 border-blue-600">
                  <User className="w-16 h-16 text-blue-600" />
                </div>
              )}
              
              <label 
                htmlFor="photo-upload" 
                className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Camera className="w-5 h-5 text-white" />
              </label>
              
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploadingPhoto}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-100">{currentUser?.name}</h3>
              <p className="text-gray-300">{currentUser?.email}</p>
              <p className="text-sm text-gray-400 mt-2">
                {uploadingPhoto ? 'Uploading...' : 'Click the camera icon to change photo'}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information Form */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-100 mb-6">Personal Information</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Full Name</span>
                </div>
              </label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </div>
              </label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Preferred Currency</span>
                </div>
              </label>
              <select
                name="currency"
                value={profileData.currency}
                onChange={handleChange}
                className="input-field"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Change Password</h3>
              <p className="text-sm text-gray-300 mb-4">
                Leave blank if you don't want to change your password
              </p>

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Current Password</span>
                    </div>
                  </label>
                  <input
                    type="password"
                    name="current_password"
                    value={profileData.current_password}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter current password"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="new_password"
                    value={profileData.new_password}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter new password (min 6 characters)"
                    minLength={6}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={profileData.confirm_password}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="card border-2 border-red-200">
          <h2 className="text-xl font-bold text-red-700 mb-4">Danger Zone</h2>
          <p className="text-gray-300 mb-4">
            Once you logout, you'll need to login again with your credentials.
          </p>
          <button
            onClick={handleLogout}
            className="btn-danger flex items-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Profile;
