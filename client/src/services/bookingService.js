import api from './api';

export const createBooking = async (bookingData) => {
  const { data } = await api.post('/bookings', bookingData);
  return data;
};

export const getMyBookings = async (params = {}) => {
  const { data } = await api.get('/bookings/my-bookings', { params });
  return data;
};

export const getBooking = async (bookingId) => {
  const { data } = await api.get(`/bookings/${bookingId}`);
  return data;
};

export const cancelBooking = async (bookingId, reason = '') => {
  const { data } = await api.put(`/bookings/${bookingId}/cancel`, { reason });
  return data;
};

