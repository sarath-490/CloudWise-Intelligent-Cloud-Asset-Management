import { useState, useEffect } from 'react';
import {
    Users,
    HardDrive,
    Activity,
    ShieldCheck,
    UserPlus,
    Clock,
    BarChart3,
    Database,
    Lock,
    ArrowUpRight,
    Search,
    MoreVertical,
    CheckCircle2
} from 'lucide-react';
import Button from '../../components/common/Button';

import api from '../../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStorage: '0 B',
        activeUsers: 0,
        systemUptime: '0%',
        storageLimit: '100 GB'
    });

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                setStats(response.data.stats);
                setUsers(response.data.users);
            } catch (error) {
                console.error("Failed to fetch admin statistics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 animate-fade-in max-w-7xl mx-auto">
            {/* Admin Header */}
            <div className="bg-slate-900 border border-slate-800 p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform translate-x-20 -translate-y-20">
                    <ShieldCheck size={320} className="text-white" />
                </div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6">
                        <Lock size={12} />
                        Master Control Center
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-4">
                        System Overseer Console
                    </h1>
                    <p className="text-slate-400 font-medium text-lg max-w-2xl">
                        Real-time platform metrics and user governance. <span className="text-indigo-400">Strictly privacy-compliant.</span>
                    </p>
                </div>
            </div>

            {/* Admin Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Registered Node Users', value: stats.totalUsers, icon: <Users />, trend: '+12% month', color: 'text-blue-500' },
                    { title: 'S3 Ingestion Load', value: stats.totalStorage, icon: <HardDrive />, trend: `${stats.storageLimit} max`, color: 'text-indigo-500' },
                    { title: 'Concurrent Sessions', value: stats.activeUsers, icon: <Activity />, trend: 'System stable', color: 'text-emerald-500' },
                    { title: 'Core Hub Uptime', value: stats.systemUptime, icon: <BarChart3 />, trend: '99.9% SLA', color: 'text-purple-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
                        <div className={`w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-wider mb-1">{stat.title}</h3>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mb-2">{stat.value}</p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.trend}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Management Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <UserPlus size={24} className="text-indigo-500" />
                                User Governance
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <th className="px-8 py-4">User Identity</th>
                                        <th className="px-8 py-4">Consumption</th>
                                        <th className="px-8 py-4">Creation Date</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-center">Protocol</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-black text-xs">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white">{u.name}</p>
                                                        <p className="text-xs text-slate-500">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-bold text-slate-700 dark:text-slate-300">{u.storage}</td>
                                            <td className="px-8 py-5 text-sm font-medium text-slate-500">{u.joined}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                                                    }`}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* System Activity */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[40px] shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <Database size={20} className="text-purple-500" />
                            S3 Infrastructure
                        </h3>

                        <div className="space-y-6">
                            {[
                                { label: 'Region: ap-south-1', value: 'Healthy', icon: <CheckCircle2 size={16} />, color: 'text-emerald-500' },
                                { label: 'Bucket Encryption', value: 'AES-256', icon: <Lock size={16} />, color: 'text-indigo-500' },
                                { label: 'API Latency', value: '24ms', icon: <Activity size={16} />, color: 'text-blue-500' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <span className={item.color}>{item.icon}</span>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.label}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-900 dark:text-white">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-end mb-4">
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Global Capacity</p>
                                <p className="text-xs font-bold text-slate-500">43.2% Full</p>
                            </div>
                            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full w-[43.2%] bg-indigo-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600 p-8 rounded-[40px] shadow-xl text-white">
                        <h3 className="text-lg font-black mb-2 tracking-tight">Security Protocol</h3>
                        <p className="text-indigo-100 text-sm font-medium mb-6 leading-relaxed">
                            Administrative access is audited. No access to private user binary data is permitted under protocol v2.4.
                        </p>
                        <Button variant="secondary" className="w-full bg-white text-indigo-600 border-none font-black text-xs uppercase tracking-widest rounded-2xl h-12">
                            Generate Audit Report
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
