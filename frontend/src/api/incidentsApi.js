import api from './client';

export const incidentsApi = {
  getAll: async (status, severity) => {
    const params = {};
    if (status && status !== 'ALL') params.status = status;
    if (severity && severity !== 'ALL') params.severity = severity;
    const res = await api.get('/incidents', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/incidents/${id}`);
    return res.data;
  },
  getByTracking: async (trackingNumber) => {
    const res = await api.get(`/incidents/tracking/${trackingNumber}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/incidents', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/incidents/${id}`, data);
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/analytics/stats');
    return res.data;
  },
};
