import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  FolderOpen,
  BarChart3,
  User,
  Settings,
  Cloud,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Sparkles
  , Share2
} from 'lucide-react';
import fileService from '../../services/fileService';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ className }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [stats, setStats] = useState({ percentUsed: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await fileService.getAllFiles();
        if (result.success) {
          const totalBytes = result.data.reduce((acc, f) => acc + (f.size || 0), 0);
          const usedGB = totalBytes / (1024 * 1024 * 1024);
          const percent = (usedGB / 1) * 100; // 1GB limit
          setStats({ percentUsed: Math.min(percent, 100).toFixed(0) });
        }
      } catch (e) {
        console.error('Failed to fetch sidebar stats');
      }
    };
    fetchStats();
  }, [location.pathname]);

  const menuItems = user?.role === 'ADMIN'
    ? [{ name: 'Admin', path: '/admin', icon: <ShieldCheck size={20} /> }]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Upload', path: '/upload', icon: <UploadCloud size={20} /> },
        { name: 'My Files', path: '/files', icon: <FolderOpen size={20} /> },
        { name: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
        { name: 'Transfer', path: '/transfer', icon: <Share2 size={20} /> },
      ];

  const secondaryItems = user?.role === 'ADMIN'
    ? []
    : [
        { name: 'Profile', path: '/profile', icon: <User size={20} /> },
        { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
      ];

  return (
    <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/50 z-40 flex flex-col transition-all duration-300 transform lg:translate-x-0 ${className === 'open' ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Branding */}
      <div className="h-20 flex items-center gap-3 px-8 border-b border-slate-100 dark:border-slate-800/50">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
          <Cloud className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">CloudWise</span>
          <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none">Smart Organizer</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-8 px-5 space-y-8">
        <div>
          <div className="px-4 mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">Main</span>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 font-bold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'} transition-colors`}>
                      {item.icon}
                    </div>
                    <span className="text-sm tracking-tight">{item.name}</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm"></div>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {secondaryItems.length > 0 && (
          <div>
            <div className="px-4 mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">Account</span>
            </div>
            <nav className="space-y-2">
              {secondaryItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 font-bold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/50'
                      }`}
                  >
                    <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'} transition-colors`}>
                      {item.icon}
                    </div>
                    <span className="text-sm tracking-tight">{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      {user?.role !== 'ADMIN' && (
        <div className="p-6 mt-auto">
          <div className="p-5 rounded-[28px] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 group hover:border-indigo-200 dark:hover:border-indigo-900/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-500 w-4 h-4" />
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Health</span>
            </div>
            <span className="text-[10px] font-black text-emerald-500">Live</span>
          </div>
          <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold">
              <HardDrive size={12} />
              <span className="text-[11px]">Storage</span>
            </div>
            <span className="text-[11px] font-black text-slate-900 dark:text-white">{stats.percentUsed}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-1000"
              style={{ width: `${stats.percentUsed}%` }}
            ></div>
          </div>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-3 leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
            CloudWise Smart Organizer
          </p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
