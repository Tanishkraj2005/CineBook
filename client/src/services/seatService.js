import api from './api';

export const getShowSeats = async (showId) => {
  const { data } = await api.get(`/shows/${showId}/seats`);
  return data;
};

export const lockSeats = async (showId, seats) => {
  const { data } = await api.post('/seats/lock', { showId, seats });
  return data;
};

export const releaseSeats = async (showId, seats) => {
  const { data } = await api.delete('/seats/lock', { data: { showId, seats } });
  return data;
};

