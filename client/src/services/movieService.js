import api from './api';

export const getMovies = async (params = {}) => {
  const { data } = await api.get('/movies', { params });
  return data;
};

export const getMovie = async (id) => {
  const { data } = await api.get(`/movies/${id}`);
  return data;
};

export const createMovie = async (movieData) => {
  const { data } = await api.post('/movies', movieData);
  return data;
};

export const updateMovie = async (id, movieData) => {
  const { data } = await api.put(`/movies/${id}`, movieData);
  return data;
};

export const deleteMovie = async (id) => {
  const { data } = await api.delete(`/movies/${id}`);
  return data;
};

