import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { User, Mail, Calendar, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const sliderRef = useRef(null);
  const slideStateRef = useRef({ startX: 0, startOffset: 0 });
  const [slideX, setSlideX] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

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

  const getMaxSlide = () => {
    const track = sliderRef.current;
    if (!track) return 0;
    const padding = 6;
    const thumb = 52;
    return Math.max(0, track.clientWidth - thumb - padding * 2);
  };

  const resetSlide = () => {
    setSlideX(0);
    setIsSliding(false);
  };

  const completeLogout = async () => {
    const confirm = window.confirm('Log out from this device?');
    if (!confirm) {
      resetSlide();
      return;
    }
    await logout();
    navigate('/login');
  };

  const handlePointerDown = (event) => {
    const track = sliderRef.current;
    if (!track) return;
    track.setPointerCapture(event.pointerId);
    setIsSliding(true);
    slideStateRef.current = { startX: event.clientX, startOffset: slideX };
  };

  const handlePointerMove = (event) => {
    if (!isSliding) return;
    const { startX, startOffset } = slideStateRef.current;
    const maxSlide = getMaxSlide();
    const next = Math.min(Math.max(startOffset + (event.clientX - startX), 0), maxSlide);
    setSlideX(next);
  };

  const handlePointerUp = async () => {
    if (!isSliding) return;
    const maxSlide = getMaxSlide();
    if (maxSlide > 0 && slideX >= maxSlide * 0.78) {
      setSlideX(maxSlide);
      await completeLogout();
      return;
    }
    resetSlide();
  };

  if (loading) {
    return <Loader size="large" />;
  }

  const displayUser = user || authUser;

  return (
    <div className="relative p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 right-0 w-72 h-72 bg-indigo-200/40 dark:bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-0 w-80 h-80 bg-sky-200/40 dark:bg-sky-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <User size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Profile</h1>
        </div>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Manage your identity, contact info, and account access.</p>
      </div>

      {/* Messages */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl border text-sm font-semibold ${message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
        >
          {message.text}
        </div>
      )}

      <div className="relative grid gap-6">
        {/* Profile Overview */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur shadow-xl shadow-slate-200/60 dark:shadow-none overflow-hidden">
          <div className="px-6 sm:px-8 py-6 sm:py-7 bg-gradient-to-r from-indigo-50 via-white to-slate-50 dark:from-indigo-900/20 dark:via-slate-900 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7">
                <div className="relative">
                  <div
                    ref={sliderRef}
                    className="absolute inset-0 -inset-y-1 rounded-full bg-gradient-to-r from-indigo-500/10 via-indigo-500/30 to-indigo-500/60 blur-[10px]"
                  />
                  <div
                    className="absolute -inset-1 rounded-full bg-gradient-to-br from-indigo-400/40 to-sky-400/40 blur"
                  />
                  <div
                    className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-500 text-white flex items-center justify-center text-2xl sm:text-3xl font-black shadow-lg cursor-pointer select-none touch-none"
                    style={{ transform: `translateX(${slideX}px)` }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                  >
                    {displayUser?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Account</div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 mb-1 break-words">
                  {displayUser?.name || 'User'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold break-words">
                  {displayUser?.email || ''}
                </p>
              </div>
              {!editing && (
                <Button
                  variant="secondary"
                  onClick={() => setEditing(true)}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all font-semibold shadow-sm w-full sm:w-auto"
                >
                  <Edit2 size={18} />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
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
                      <div className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">Email</div>
                      <div className="text-base font-semibold text-slate-900 dark:text-white">{displayUser?.email || 'N/A'}</div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
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
                      <div className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">Full Name</div>
                      <div className="text-base font-semibold text-slate-900 dark:text-white">{displayUser?.name || 'N/A'}</div>
                    </>
                  )}
                </div>
              </div>

              {displayUser?.createdAt && (
                <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                    <Calendar size={20} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">Member Since</div>
                    <div className="text-base font-semibold text-slate-900 dark:text-white">
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
    </div>
  );
};

export default Profile;
