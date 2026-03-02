import api from './api';

const aiService = {
  chat: async (query) => {
    const response = await api.post('/ai/chat', { query });
    return response.data;
  },

  analyzeFile: async (fileId) => {
    const response = await api.post(`/ai/analyze/${fileId}`);
    return response.data;
  }
};

export default aiService;
