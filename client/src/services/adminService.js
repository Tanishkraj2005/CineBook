import api from './api';

export const getDashboard = async () => {
  const { data } = await api.get('/admin/dashboard');
  return data;
};

export const getAllBookings = async (params = {}) => {
  const { data } = await api.get('/admin/bookings', { params });
  return data;
};

export const getAllCustomers = async (params = {}) => {
  const { data } = await api.get('/admin/customers', { params });
  return data;
};

export const toggleBlockCustomer = async (id) => {
  const { data } = await api.put(`/admin/customers/${id}/block`);
  return data;
};

export const getReports = async () => {
  const { data } = await api.get('/admin/reports');
  return data;
};

export const verifyTicket = async (ticketIdentifier) => {
  const { data } = await api.post('/bookings/verify-ticket', { ticketIdentifier });
  return data;
};

export const getScreens = async (params = {}) => {
  const { data } = await api.get('/screens', { params });
  return data;
};

export const createScreen = async (screenData) => {
  const { data } = await api.post('/screens', screenData);
  return data;
};

export const updateScreen = async (id, screenData) => {
  const { data } = await api.put(`/screens/${id}`, screenData);
  return data;
};

export const deleteScreen = async (id) => {
  const { data } = await api.delete(`/screens/${id}`);
  return data;
};

