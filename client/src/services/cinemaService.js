import api from './api';

export const getCinemas = async (params = {}) => {
  const { data } = await api.get('/cinemas', { params });
  return data;
};

export const getCinema = async (id) => {
  const { data } = await api.get(`/cinemas/${id}`);
  return data;
};

export const createCinema = async (cinemaData) => {
  const { data } = await api.post('/cinemas', cinemaData);
  return data;
};

export const updateCinema = async (id, cinemaData) => {
  const { data } = await api.put(`/cinemas/${id}`, cinemaData);
  return data;
};

export const deleteCinema = async (id) => {
  const { data } = await api.delete(`/cinemas/${id}`);
  return data;
};

