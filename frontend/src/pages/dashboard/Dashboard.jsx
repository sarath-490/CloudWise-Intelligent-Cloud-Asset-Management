import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FolderOpen,
  Upload,
  Clock,
  Shield,
  Search,
  Plus,
  ArrowRight,
  BrainCircuit,
  FileText,
  PieChart,
  Cloud,
  History,
  HardDrive,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import FileCard from '../../components/files/FileCard';
import Button from '../../components/common/Button';
import fileService from '../../services/fileService';

const StatsCard = ({ title, value, icon, trend, className = '' }) => (
  <div className={`p-6 rounded-3xl flex flex-col justify-between shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-slate-900 ${className}`}>
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
        {trend}
      </span>
    </div>
    <div>
      <h3 className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-[0.1em] mb-1">{title}</h3>
      <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFiles: 0,
    storageUsedBytes: 0,
    storageUsedGB: '0',
    percentUsed: 0,
    breakdown: []
  });

  const STORAGE_LIMIT_GB = 1;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const result = await fileService.getAllFiles();
        if (result.success) {
          const allFiles = result.data;
          setFiles(allFiles);

          const totalBytes = allFiles.reduce((acc, f) => acc + (f.size || 0), 0);
          const usedGB = totalBytes / (1024 * 1024 * 1024);
          const percent = (totalBytes / (STORAGE_LIMIT_GB * 1024 * 1024 * 1024)) * 100;

          // Breakdown calculation
          const categories = {};
          allFiles.forEach(f => {
            const cat = f.category || 'Other';
            categories[cat] = (categories[cat] || 0) + (f.size || 0);
          });

          const breakdownData = Object.entries(categories).map(([label, size]) => {
            const sizeGB = size / (1024 * 1024 * 1024);
            const colorMap = {
              'Documents': 'bg-blue-500',
              'Images': 'bg-emerald-500',
              'Media': 'bg-purple-500',
              'Code': 'bg-amber-500',
              'Other': 'bg-slate-500'
            };
            return {
              label,
              sizeText: size > 1024 * 1024 ? `${(size / (1024 * 1024)).toFixed(1)} MB` : `${(size / 1024).toFixed(1)} KB`,
              percent: totalBytes > 0 ? Math.round((size / totalBytes) * 100) : 0,
              color: colorMap[label] || colorMap['Other']
            };
          }).sort((a, b) => b.percent - a.percent).slice(0, 3);

          setStats({
            totalFiles: allFiles.length,
            storageUsedBytes: totalBytes,
            storageUsedGB: usedGB.toFixed(4),
            percentUsed: Math.min(percent, 100).toFixed(2),
            breakdown: breakdownData
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const recentFiles = files.slice(0, 4);
  const activityLog = files.slice(0, 3).map(f => ({
    user: 'You',
    action: 'Uploaded',
    target: f.originalName,
    time: f.createdAt ? new Date(f.createdAt).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Just now',
    icon: <Upload size={14} />
  }));

  return (
    <div className="space-y-8 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-indigo-600 dark:bg-indigo-700 p-8 lg:p-10 rounded-[40px] shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none translate-x-10 -translate-y-10">
          <Cloud size={280} className="text-white" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles size={12} />
            System Online
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-2">
            Hello, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-indigo-100 font-medium text-lg">
            Your smart workspace is organized and ready.
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
          <Link to="/upload">
            <Button variant="secondary" className="bg-white !text-indigo-600 hover:bg-slate-50 border-none shadow-xl rounded-2xl h-14 px-8 font-black transition-all hover:-translate-y-1 text-base">
              <Plus size={20} className="mr-2 stroke-[3]" /> Upload File
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Files"
          value={stats.totalFiles}
          icon={<FolderOpen size={22} />}
          trend="All Files"
        />
        <StatsCard
          title="Storage Used"
          value={`${stats.percentUsed}%`}
          icon={<HardDrive size={22} />}
          trend={`Of ${STORAGE_LIMIT_GB}GB Limit`}
        />
        <StatsCard
          title="Storage Size"
          value={`${stats.storageUsedGB} GB`}
          icon={<Upload size={22} />}
          trend="Total Used"
        />
        <StatsCard
          title="AI Status"
          value={stats.totalFiles > 0 ? "Active" : "Idle"}
          icon={<BrainCircuit size={22} />}
          trend="Smart Sorting"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Files */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Clock size={24} className="text-indigo-600" />
              Recent Uploads
            </h2>
            <Link to="/files" className="text-sm font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 uppercase tracking-wider">
              View All Files <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-48 rounded-[32px] bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-800"></div>
              ))
            ) : recentFiles.length > 0 ? (
              recentFiles.map(file => (
                <FileCard key={file.id} file={file} viewMode="grid" />
              ))
            ) : (
              <div className="col-span-2 py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[40px] text-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6">
                  <FolderOpen size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Files Yet</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs font-bold text-sm">Upload your first file to get started.</p>
                <Link to="/upload" className="mt-8">
                  <Button variant="secondary" className="rounded-2xl px-8 border-2 border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-widest">
                    Upload File &rarr;
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Activity / Storage Breakdown */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <PieChart size={22} className="text-emerald-500" />
              Storage Breakdown
            </h2>

            <div className="space-y-8">
              {stats.breakdown.length > 0 ? stats.breakdown.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center text-sm mb-3">
                    <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[11px]">{item.label}</span>
                    <span className="text-slate-500 font-bold">{item.sizeText} ({item.percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div className={`${item.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${item.percent}%` }}></div>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center text-slate-400 font-bold text-sm italic">
                  No categorization data available.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <History size={22} className="text-indigo-500" />
              Recent Activity
            </h2>

            <div className="space-y-8">
              {activityLog.length > 0 ? activityLog.map((log, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0 transition-all duration-300">
                    {log.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
                      <span className="text-slate-900 dark:text-white">{log.user}</span> {log.action.toLowerCase()} <span className="text-indigo-600 dark:text-indigo-400">{log.target}</span>
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">{log.time}</span>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center text-slate-400 font-bold text-sm italic">
                  No recent activity logs found.
                </div>
              )}
            </div>

            <Link to="/analytics" className="block text-center mt-10 text-xs font-black uppercase tracking-[0.2em] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
              View Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
