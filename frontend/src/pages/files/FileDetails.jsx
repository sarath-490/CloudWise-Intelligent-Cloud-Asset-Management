import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Trash2,
  Tag,
  Calendar,
  HardDrive,
  FileText,
  Brain,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  Binary,
  Database,
  ExternalLink,
  Info,
  Cloud
} from 'lucide-react';
import fileService from '../../services/fileService';
import aiService from '../../services/aiService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const FileDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchFileDetails();
  }, [id]);

  const fetchFileDetails = async () => {
    try {
      setLoading(true);
      const result = await fileService.getFileById(id);
      if (result.success) {
        setFile(result.data);
      } else {
        navigate('/files');
      }
    } catch (error) {
      console.error('Error fetching file details:', error);
      navigate('/files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await fileService.downloadFile(id, file.originalName || file.name);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) return;
    try {
      const result = await fileService.deleteFile(id);
      if (result.success) {
        navigate('/files');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleReanalyze = async () => {
    try {
      setAnalyzing(true);
      await aiService.analyzeFile(id);
      // Always re-fetch since the backend now performs analysis synchronously
      await fetchFileDetails();
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <Loader size="large" />;
  if (!file) return null;

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/files')}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors font-medium text-sm"
        >
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            <ArrowLeft size={16} />
          </div>
          Back to Files
        </button>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleDownload}
            loading={downloading}
            className="rounded-xl h-10 px-5 font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <Download size={16} className="mr-2 text-slate-500" /> Download
          </Button>
          <Button
            variant="secondary"
            onClick={handleDelete}
            className="rounded-xl h-10 px-5 font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:border-rose-200 dark:hover:border-rose-800 shadow-sm"
          >
            <Trash2 size={16} className="mr-2" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* File Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 border border-blue-100 dark:border-blue-800/30">
                <FileText size={36} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold">
                    {file.aiCategory || file.category || 'Categorizing...'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Database size={14} /> ID: {String(file.id).substring(0, 8)}
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white truncate mb-4" title={file.name || 'Untitled'}>
                  {file.name || 'Untitled Asset'}
                </h1>
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <HardDrive size={16} className="text-slate-400" /> {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar size={16} className="text-slate-400" /> {new Date(file.uploadDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    <Shield size={16} /> Secure
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-5 pointer-events-none">
              <Brain size={160} />
            </div>

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30">
                  <Brain size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Analysis</h2>
              </div>
              <Button
                variant="secondary"
                size="small"
                onClick={handleReanalyze}
                loading={analyzing}
                className="rounded-lg border border-slate-200 dark:border-slate-700 h-9 font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Zap size={14} className="mr-2 text-blue-500" /> Re-analyze
              </Button>
            </div>

            <div className="space-y-8 relative z-10">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Summary</h4>
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  {file.aiSummary || <span className="italic text-slate-500">Analysis pending...</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {file.aiTags ? (() => {
                      // Parse tags: handle both JSON array string and comma-separated
                      let tags = [];
                      try {
                        const parsed = JSON.parse(file.aiTags);
                        tags = Array.isArray(parsed) ? parsed : [String(parsed)];
                      } catch {
                        tags = file.aiTags.split(',');
                      }
                      return tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                          <Tag size={12} className="text-slate-400" />
                          {String(tag).trim()}
                        </span>
                      ));
                    })() : (
                      <span className="text-sm text-slate-500 italic">No tags identified.</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Confidence</h4>
                  <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-slate-600 dark:text-slate-400">Score</span>
                      <span className="text-blue-600 dark:text-blue-400">{Math.round((file.aiConfidence || 0) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.round((file.aiConfidence || 0) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info Column */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Info size={18} className="text-blue-500" />
              File Information
            </h3>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500 border border-slate-100 dark:border-slate-700">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">Status</p>
                  <p className="text-xs text-slate-500">Active and accessible</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500 border border-slate-100 dark:border-slate-700">
                  <Cloud size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">Storage</p>
                  <p className="text-xs text-slate-500">AWS S3 Secured Bucket</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500 border border-slate-100 dark:border-slate-700">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">Privacy</p>
                  <p className="text-xs text-slate-500">Private to your account</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-900 dark:text-white mb-3">Metadata</p>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 overflow-x-auto">
                <code className="text-xs text-slate-600 dark:text-slate-400 font-mono whitespace-pre">
                  ID: {file.id}{'\n'}
                  Type: {file.mimeType || 'unknown'}{'\n'}
                  Size: {file.size || 0} bytes
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDetails;
