import api from './api';

export const getSubscription = async () => {
  return api.get('/payments/subscription');
};

export const createPaymentOrder = async (payload) => {
  return api.post('/payments/create-order', payload);
};

export const verifyPayment = async (payload) => {
  return api.post('/payments/verify', payload);
};
