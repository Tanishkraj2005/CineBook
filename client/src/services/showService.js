import api from './api';

export const getShows = async (params = {}) => {
  const { data } = await api.get('/shows', { params });
  return data;
};

export const getShow = async (id) => {
  const { data } = await api.get(`/shows/${id}`);
  return data;
};

export const getShowsByMovie = async (movieId) => {
  const { data } = await api.get(`/shows/movie/${movieId}`);
  return data;
};

export const createShow = async (showData) => {
  const { data } = await api.post('/shows', showData);
  return data;
};

export const updateShow = async (id, showData) => {
  const { data } = await api.put(`/shows/${id}`, showData);
  return data;
};

export const deleteShow = async (id) => {
  const { data } = await api.delete(`/shows/${id}`);
  return data;
};

