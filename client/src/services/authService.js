import api from './api';

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const register = async (name, email, password, phone) => {
  const { data } = await api.post('/auth/register', { name, email, password, phone });
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const changePassword = async (oldPassword, newPassword) => {
  const { data } = await api.put('/auth/change-password', { oldPassword, newPassword });
  return data;
};

