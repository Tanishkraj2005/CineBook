import api from './api';

export const createPayment = async (paymentData) => {
  const { data } = await api.post('/payments/create', paymentData);
  return data;
};

export const verifyPayment = async (verifyData) => {
  const { data } = await api.post('/payments/verify', verifyData);
  return data;
};

