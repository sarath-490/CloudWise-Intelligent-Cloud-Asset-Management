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
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <User size={20} className="text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
        </div>
        <p className="text-base text-slate-600">Manage your account information</p>
      </div>

      {/* Messages */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg border text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
              {displayUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">{displayUser?.name || 'User'}</h2>
              <p className="text-sm text-slate-600">{displayUser?.email || ''}</p>
            </div>
            {!editing && (
              <Button variant="secondary" onClick={() => setEditing(true)}>
                <Edit2 size={18} />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Mail size={20} className="text-indigo-600" />
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
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Email</div>
                    <div className="text-base font-medium text-slate-900">{displayUser?.email || 'N/A'}</div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-indigo-600" />
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
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Full Name</div>
                    <div className="text-base font-medium text-slate-900">{displayUser?.name || 'N/A'}</div>
                  </>
                )}
              </div>
            </div>

            {displayUser?.createdAt && (
              <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Calendar size={20} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Member Since</div>
                  <div className="text-base font-medium text-slate-900">
                    {new Date(displayUser.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            {editing && (
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <Button variant="primary" onClick={handleSave}>
                  Save Changes
                </Button>
                <Button variant="secondary" onClick={() => setEditing(false)}>
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
