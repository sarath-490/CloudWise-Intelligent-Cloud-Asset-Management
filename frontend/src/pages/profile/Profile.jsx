import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { User, Mail, Calendar, Edit2 } from 'lucide-react';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await authService.getProfile();
      setUser(profile);
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      if (authUser) {
        setUser(authUser);
        setFormData({
          name: authUser.name || '',
          email: authUser.email || '',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setEditing(false);
      loadProfile();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile',
      });
    }
  };

  if (loading) {
    return <Loader size="large" />;
  }

  const displayUser = user || authUser;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <User size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Profile</h1>
        </div>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Manage your account information</p>
      </div>

      {/* Messages */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg border text-sm font-medium ${message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
            }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-5 sm:py-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg">
              {displayUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1 break-words">
                {displayUser?.name || 'User'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium break-words">
                {displayUser?.email || ''}
              </p>
            </div>
            {!editing && (
              <Button variant="secondary" onClick={() => setEditing(true)} className="rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all font-semibold shadow-sm w-full sm:w-auto">
                <Edit2 size={18} />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="space-y-6">
            <div className="flex items-start gap-3 sm:gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-all">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <Mail size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                {editing ? (
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                  />
                ) : (
                  <>
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Email</div>
                    <div className="text-base font-medium text-slate-900 dark:text-white">{displayUser?.email || 'N/A'}</div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-all">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                {editing ? (
                  <Input
                    label="Full Name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                ) : (
                  <>
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Full Name</div>
                    <div className="text-base font-medium text-slate-900 dark:text-white">{displayUser?.name || 'N/A'}</div>
                  </>
                )}
              </div>
            </div>

            {displayUser?.createdAt && (
              <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-all">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <Calendar size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Member Since</div>
                  <div className="text-base font-medium text-slate-900 dark:text-white">
                    {new Date(displayUser.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            {editing && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button variant="primary" onClick={handleSave}>
                  Save Changes
                </Button>
                <Button variant="secondary" onClick={() => setEditing(false)} className="dark:bg-slate-800 dark:hover:bg-slate-700">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
