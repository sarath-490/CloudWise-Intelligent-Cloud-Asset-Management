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

      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
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
};

export default fileService;
