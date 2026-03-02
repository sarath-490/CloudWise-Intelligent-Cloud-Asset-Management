import FileCard from './FileCard';
import { Grid, List, FolderOpen } from 'lucide-react';
import Button from '../common/Button';
import Loader from '../common/Loader';

const FileList = ({
  files,
  loading,
  viewMode = 'grid',
  onViewModeChange,
  onView,
  onDownload,
  onDelete,
  filters = [],
  activeFilter,
  onFilterChange,
}) => {
  if (loading) {
    return <Loader size="large" />;
  }

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <FolderOpen size={48} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No files found</h3>
        <p className="text-sm text-slate-600 mb-8">Upload your first file to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {filters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeFilter === filter
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm'
                }`}
                onClick={() => onFilterChange(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid size={16} />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => onViewModeChange('list')}
          >
            <List size={16} />
          </Button>
        </div>
      </div>
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5' : 'flex flex-col gap-3'}>
        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            viewMode={viewMode}
            onView={onView}
            onDownload={onDownload}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default FileList;
