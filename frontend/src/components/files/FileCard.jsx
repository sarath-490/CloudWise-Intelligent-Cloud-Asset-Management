import {
  FileText,
  Image as ImageIcon,
  FileCode,
  FileArchive,
  MoreVertical,
  Download,
  Trash2,
  ExternalLink,
  Shield,
  Binary,
  BrainCircuit,
  Zap,
  ArrowRight,
  File
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FileCard = ({ file, viewMode = 'grid' }) => {
  const navigate = useNavigate();

  if (!file) return null;

  const getFileIcon = (type) => {
    const contentType = type?.toLowerCase() || '';
    if (contentType.includes('pdf')) return <FileText className="text-rose-500" />;
    if (contentType.includes('image')) return <ImageIcon className="text-emerald-500" />;
    if (contentType.includes('code') || contentType.includes('json') || contentType.includes('javascript')) return <FileCode className="text-amber-500" />;
    if (contentType.includes('zip') || contentType.includes('rar') || contentType.includes('compressed')) return <FileArchive className="text-purple-500" />;
    if (contentType.includes('word') || contentType.includes('officedocument')) return <FileText className="text-blue-500" />;
    return <File className="text-slate-400" />;
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const createdAt = file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Unknown Date';

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => navigate(`/files/${file.id}`)}
        className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500 transition-all cursor-pointer group animate-in fade-in slide-in-from-left-4 duration-300"
      >
        <div className="flex items-center gap-5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-inner">
            {getFileIcon(file.mimeType)}
          </div>
          <div className="min-w-0">
            <h4 className="text-[15px] font-black text-slate-900 dark:text-white truncate tracking-tight">{file.name}</h4>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                {file.category || 'Uncategorized'}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">{formatSize(file.size)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <div className="hidden md:block text-right mr-4">
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-0.5">Ingested</p>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{createdAt}</p>
          </div>
          <button className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/files/${file.id}`)}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 hover:shadow-2xl hover:border-indigo-300 dark:hover:border-indigo-500 transition-all cursor-pointer group flex flex-col h-full transform hover:-translate-y-2 duration-300 relative overflow-hidden"
    >
      {/* Decorative gradient background for icon */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 -mr-12 -mt-12 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center relative shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
          {getFileIcon(file.mimeType)}
          {(file.aiConfidence > 0.8) && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-xl border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
              <Zap size={12} className="text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
            </div>
          )}
        </div>
        <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
          <MoreVertical size={18} />
        </button>
      </div>

      <div className="flex-1 min-w-0 mb-6 relative z-10">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 line-clamp-2 tracking-tight leading-snug" title={file.name}>
          {file.name}
        </h3>
        <div className="flex items-center flex-wrap gap-2 mt-auto">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
            {file.aiCategory || file.category || 'Uncategorized'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
            {formatSize(file.size)}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-black uppercase tracking-widest relative z-10">
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
          <Shield size={14} className="text-emerald-500 flex-shrink-0" />
          <span>Verified</span>
        </div>
        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
          Details <ArrowRight size={14} className="stroke-[3]" />
        </div>
      </div>
    </div>
  );
};

export default FileCard;
