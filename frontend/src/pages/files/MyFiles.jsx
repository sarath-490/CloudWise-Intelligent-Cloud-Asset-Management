import { useState, useEffect } from 'react';
import {
  FolderOpen,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Plus,
  Binary,
  ArrowUpDown,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import fileService from '../../services/fileService';
import FileCard from '../../components/files/FileCard';
import Button from '../../components/common/Button';

const MyFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const result = await fileService.getAllFiles();
      if (result.success) {
        setFiles(result.data);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = (files || [])
    .filter(file => {
      if (!file) return false;
      const name = file.name || '';
      const category = file.category || '';
      const aiCategory = file.aiCategory || '';
      return (
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        aiCategory.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      if (sortBy === 'newest') return new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0);
      if (sortBy === 'oldest') return new Date(a.uploadDate || 0) - new Date(b.uploadDate || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'size') return (b.size || 0) - (a.size || 0);
      return 0;
    });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Inventory Status</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">File Repository</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">Manage and query your smart cloud storage</p>
        </div>
        <Link to="/upload">
          <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 rounded-2xl h-12 px-6 font-bold">
            <Plus size={20} className="mr-2" /> Ingest New binary
          </Button>
        </Link>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search binary repository..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-slate-900 dark:text-white font-semibold text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-transparent">
            <ArrowUpDown size={16} className="text-slate-400" />
            <select
              className="bg-transparent border-none focus:ring-0 outline-none text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Latest Epoch</option>
              <option value="oldest">Ancient Artifacts</option>
              <option value="name">Character A-Z</option>
              <option value="size">Magnitude</option>
            </select>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>

          <div className="flex bg-slate-50 dark:bg-slate-800 rounded-2xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Repository Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-3xl animate-pulse border border-slate-200 dark:border-slate-800"></div>
          ))}
        </div>
      ) : filteredFiles.length > 0 ? (
        <div className={viewMode === 'grid'
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {filteredFiles.map(file => (
            <FileCard key={file.id} file={file} viewMode={viewMode} />
          ))}
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[48px] text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6">
            <Binary size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Matching Assets</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm font-bold text-sm">Your search criteria returned null pointers. Adjust filters or ingest fresh binary data.</p>
          <Button
            variant="secondary"
            className="mt-8 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-8 font-black text-slate-600 dark:text-slate-400 text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            onClick={() => setSearchQuery('')}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyFiles;
