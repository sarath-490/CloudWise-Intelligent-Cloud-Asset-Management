import api from './api';

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  updateUserStatus: async ({ id, active }) => {
    const response = await api.patch(`/admin/users/${id}/status`, { active });
    return response.data;
  },

  updateUserStorageLimit: async ({ id, storageLimitBytes }) => {
    const response = await api.patch(`/admin/users/${id}/storage-limit`, { storageLimitBytes });
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (payload) => {
    const response = await api.put('/admin/settings', payload);
    return response.data;
  },

  getTransfers: async () => {
    const response = await api.get('/admin/transfers', {
      params: { client_base_url: window.location.origin },
    });
    return response.data;
  },

  endTransfer: async ({ session_id }) => {
    const response = await api.post('/admin/transfers/end', { session_id });
    return response.data;
  },
};
