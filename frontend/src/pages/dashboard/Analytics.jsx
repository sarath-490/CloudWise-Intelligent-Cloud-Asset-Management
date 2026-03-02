import { useEffect, useState } from 'react';
import fileService from '../../services/fileService';
import Loader from '../../components/common/Loader';
import { BarChart3, TrendingUp, HardDrive } from 'lucide-react';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    categoryStats: {},
    sizeByCategory: {},
    uploadTrends: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const result = await fileService.getAllFiles();

      if (!result.success) {
        console.error('Failed to load files for analytics');
        return;
      }

      const files = result.data;
      const categoryStats = {};
      const sizeByCategory = {};
      const uploadTrends = {};

      files.forEach((file) => {
        const category = file.category || 'Uncategorized';
        categoryStats[category] = (categoryStats[category] || 0) + 1;
        sizeByCategory[category] = (sizeByCategory[category] || 0) + (file.size || 0);

        const date = new Date(file.uploadDate).toLocaleDateString();
        uploadTrends[date] = (uploadTrends[date] || 0) + 1;
      });

      setAnalytics({
        categoryStats,
        sizeByCategory,
        uploadTrends: Object.entries(uploadTrends)
          .map(([date, count]) => ({ date, count }))
          .slice(-7),
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return <Loader size="large" />;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <BarChart3 size={20} className="text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        </div>
        <p className="text-base text-slate-600">Insights into your file organization</p>
      </div>

      {/* Files by Category */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={20} className="text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-900">Files by Category</h3>
          </div>
          <p className="text-sm text-slate-600">Distribution of files across categories</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(analytics.categoryStats).map(([category, count]) => (
              <div key={category} className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">{category}</div>
                <div className="text-3xl font-bold text-slate-900">{count}</div>
                <div className="text-xs text-slate-500 mt-1">files</div>
              </div>
            ))}
            {Object.keys(analytics.categoryStats).length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                <BarChart3 size={48} className="mx-auto mb-3 text-slate-300" />
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Storage by Category */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-1">
            <HardDrive size={20} className="text-emerald-600" />
            <h3 className="text-lg font-semibold text-slate-900">Storage by Category</h3>
          </div>
          <p className="text-sm text-slate-600">Storage usage across different categories</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(analytics.sizeByCategory).map(([category, size]) => (
              <div key={category} className="p-5 bg-gradient-to-br from-emerald-50 to-white rounded-lg border border-emerald-200 hover:border-emerald-300 hover:shadow-md transition-all">
                <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">{category}</div>
                <div className="text-3xl font-bold text-slate-900">{formatFileSize(size)}</div>
                <div className="text-xs text-emerald-600 mt-1">storage used</div>
              </div>
            ))}
            {Object.keys(analytics.sizeByCategory).length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                <HardDrive size={48} className="mx-auto mb-3 text-slate-300" />
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Trends */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={20} className="text-amber-600" />
            <h3 className="text-lg font-semibold text-slate-900">Upload Trends</h3>
          </div>
          <p className="text-sm text-slate-600">File upload activity over the last 7 days</p>
        </div>
        <div className="p-6">
          {analytics.uploadTrends.length > 0 ? (
            <div className="space-y-3">
              {analytics.uploadTrends.map((trend) => (
                <div
                  key={trend.date}
                  className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                >
                  <span className="text-sm font-medium text-slate-700">{trend.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900">{trend.count}</span>
                    <span className="text-sm text-slate-500">files</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <TrendingUp size={48} className="mx-auto mb-3 text-slate-300" />
              <p>No upload data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
