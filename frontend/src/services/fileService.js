import api from './api';

const fileService = {
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    };

    const response = await api.post('/files/upload', formData, config);
    return response.data;
  },

  getAllFiles: async (params = {}) => {
    try {
      const response = await api.get('/files', { params });
      // Ensure we always return an array
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : []
      };
    } catch (error) {
      console.error('Error fetching files:', error);
      return {
        success: false,
        data: []
      };
    }
  },

  getFileById: async (id) => {
    try {
      const response = await api.get(`/files/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  deleteFile: async (id) => {
    try {
      const response = await api.delete(`/files/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  downloadFile: async (id, fileName) => {
    try {
      // Stream file through backend — never exposes S3 URLs to the client
      const response = await api.get(`/files/${id}/download`, {
        responseType: 'blob',
      });

      // Try to extract filename from Content-Disposition header as fallback
      let downloadName = fileName;
      if (!downloadName) {
        const disposition = response.headers['content-disposition'];
        if (disposition) {
          const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) {
            downloadName = match[1].replace(/['"]/g, '');
          }
        }
      }
      downloadName = downloadName || 'download';

      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (error) {
      console.error("Download failed:", error);
      return { success: false, error: error.message };
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/files/categories');
      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { success: false, data: [] };
    }
  },

  updateCategory: async (id, category) => {
    try {
      const response = await api.put(`/files/${id}/category`, { category });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating category:', error);
      return { success: false, error: error.message };
    }
  },

  reanalyzeFile: async (id) => {
    try {
      const response = await api.post(`/files/${id}/reanalyze`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error reanalyzing file:', error);
      return { success: false, error: error.message };
    }
  },

  deleteBulk: async (ids) => {
    try {
      const response = await api.delete('/files/bulk', { data: { ids } });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error in bulk delete:', error);
      return { success: false, error: error.message };
    }
  },

  searchFiles: async (query) => {
    try {
      const response = await api.get('/files/search', { params: { q: query } });
      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error('Error searching files:', error);
      return { success: false, data: [] };
    }
  }
};

export default fileService;
