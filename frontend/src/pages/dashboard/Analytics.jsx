import { useEffect, useState } from 'react';
import fileService from '../../services/fileService';
import Loader from '../../components/common/Loader';
import { BarChart3, TrendingUp, HardDrive, Tags, BadgePercent, FileStack } from 'lucide-react';
import { parseAiTags } from '../../utils/aiTags';
import { formatFileSize as formatBytes } from '../../utils/format';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    categoryStats: {},
    aiCategoryStats: {},
    aiTagStats: {},
    aiTagCoverage: 0,
    averageTagsPerFile: 0,
    totalTaggedFiles: 0,
    totalUniqueTags: 0,
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
      const aiCategoryStats = {};
      const aiTagStats = {};
      const sizeByCategory = {};
      const uploadTrends = {};
      let taggedFiles = 0;
      let totalTagMentions = 0;

      files.forEach((file) => {
        const category = file.category || 'Uncategorized';
        const aiCategory = file.aiCategory || 'Unclassified';
        categoryStats[category] = (categoryStats[category] || 0) + 1;
        aiCategoryStats[aiCategory] = (aiCategoryStats[aiCategory] || 0) + 1;
        sizeByCategory[category] = (sizeByCategory[category] || 0) + (file.size || 0);

        const normalizedTags = Array.from(new Set(
          parseAiTags(file.aiTags)
            .map((tag) => String(tag).trim().replace(/^#/, ''))
            .filter(Boolean)
        ));

        if (normalizedTags.length > 0) {
          taggedFiles += 1;
          totalTagMentions += normalizedTags.length;
        }

        normalizedTags.forEach((tag) => {
          const key = tag.toLowerCase();
          if (!key) return;
          if (!aiTagStats[key]) {
            aiTagStats[key] = { label: tag, count: 0 };
          }
          aiTagStats[key].count += 1;
        });

        const date = new Date(file.uploadDate).toLocaleDateString();
        uploadTrends[date] = (uploadTrends[date] || 0) + 1;
      });

      const totalUniqueTags = Object.keys(aiTagStats).length;
      const aiTagCoverage = files.length > 0 ? Math.round((taggedFiles / files.length) * 100) : 0;
      const averageTagsPerFile = taggedFiles > 0 ? totalTagMentions / taggedFiles : 0;

      setAnalytics({
        categoryStats,
        aiCategoryStats,
        aiTagStats,
        aiTagCoverage,
        averageTagsPerFile,
        totalTaggedFiles: taggedFiles,
        totalUniqueTags,
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

  if (loading) {
    return <Loader size="large" />;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <BarChart3 size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        </div>
        <p className="text-base text-slate-600 dark:text-slate-400">Insights into your file organization</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">AI Coverage</span>
            <BadgePercent size={18} className="text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{analytics.aiTagCoverage}%</div>
          <div className="text-xs text-slate-500 mt-1">files with at least one AI tag</div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Unique Tags</span>
            <Tags size={18} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{analytics.totalUniqueTags}</div>
          <div className="text-xs text-slate-500 mt-1">distinct normalized tags</div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Avg Tags/File</span>
            <FileStack size={18} className="text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{analytics.averageTagsPerFile.toFixed(1)}</div>
          <div className="text-xs text-slate-500 mt-1">among tagged files</div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Tagged Files</span>
            <BarChart3 size={18} className="text-sky-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{analytics.totalTaggedFiles}</div>
          <div className="text-xs text-slate-500 mt-1">files analyzed with tags</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Categories and Top Tags</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Classification and tag usage from AI analysis</p>
        </div>
        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            {Object.entries(analytics.aiCategoryStats).map(([cat, count]) => (
              <div key={cat} className="flex justify-between text-sm p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{cat}</span>
                <span className="font-bold text-slate-900 dark:text-white">{count}</span>
              </div>
            ))}
            {Object.keys(analytics.aiCategoryStats).length === 0 && (
              <div className="text-sm text-slate-500 dark:text-slate-400">No AI categories available.</div>
            )}
          </div>
          <div className="space-y-3">
            {Object.entries(analytics.aiTagStats)
              .sort((a, b) => b[1].count - a[1].count)
              .slice(0, 12)
              .map(([tagKey, payload]) => {
                const share = analytics.totalTaggedFiles > 0
                  ? Math.round((payload.count / analytics.totalTaggedFiles) * 100)
                  : 0;

                return (
                  <div key={tagKey} className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50">
                    <div className="flex justify-between items-center text-sm gap-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">#{payload.label}</span>
                      <span className="font-bold text-slate-900 dark:text-white shrink-0">{payload.count} files</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500" style={{ width: `${share}%` }}></div>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Appears in {share}% of tagged files</div>
                  </div>
                );
              })}
            {Object.keys(analytics.aiTagStats).length === 0 && (
              <div className="text-sm text-slate-500 dark:text-slate-400">No AI tags available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Files by Category */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Files by Category</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Distribution of files across categories</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(analytics.categoryStats).map(([category, count]) => (
              <div key={category} className="p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">{category}</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{count}</div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">files</div>
              </div>
            ))}
            {Object.keys(analytics.categoryStats).length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-600">
                <BarChart3 size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Storage by Category */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 mb-1">
            <HardDrive size={20} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Storage by Category</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Storage usage across different categories</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(analytics.sizeByCategory).map(([category, size]) => (
              <div key={category} className="p-5 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900 rounded-lg border border-emerald-200 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-md transition-all">
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2">{category}</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatBytes(size)}</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">storage used</div>
              </div>
            ))}
            {Object.keys(analytics.sizeByCategory).length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-600">
                <HardDrive size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Trends */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={20} className="text-amber-600 dark:text-amber-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Upload Trends</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">File upload activity over the last 7 days</p>
        </div>
        <div className="p-6">
          {analytics.uploadTrends.length > 0 ? (
            <div className="space-y-3">
              {analytics.uploadTrends.map((trend) => (
                <div
                  key={trend.date}
                  className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-all font-medium"
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{trend.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{trend.count}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-500">files</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-600">
              <TrendingUp size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
              <p>No upload data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
