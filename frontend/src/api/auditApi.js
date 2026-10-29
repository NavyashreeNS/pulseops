import api from './client';

export const auditApi = {
  getByIncidentId: async (incidentId) => {
    const res = await api.get(`/audit/incident/${incidentId}`);
    return res.data;
  },
  getByTracking: async (trackingNumber) => {
    const res = await api.get(`/audit/tracking/${trackingNumber}`);
    return res.data;
  },
  getRecent: async () => {
    const res = await api.get('/audit/recent');
    return res.data;
  },
};
