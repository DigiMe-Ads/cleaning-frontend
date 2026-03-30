import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Properties
export const propertiesAPI = {
  create: (data) => api.post('/properties', data),
  getMyProperties: () => api.get('/properties/my-properties'),
  getAllProperties: () => api.get('/properties'),
  delete: (id) => api.delete(`/properties/${id}`),
};

// Bookings
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getAllBookings: () => api.get('/bookings'),
  getByDate: (date) => api.get(`/bookings/by-date?date=${date}`),
  getMyAssignments: () => api.get('/bookings/my-assignments'),
  getMyAssignmentsByDate: (date) => api.get(`/bookings/my-assignments/by-date?date=${date}`),
  update: (id, data) => api.patch(`/bookings/${id}`, data),
  updateCleaningStatus: (id, cleaning_status) => api.patch(`/bookings/${id}/cleaning-status`, { cleaning_status }),
  delete: (id) => api.delete(`/bookings/${id}`),
};

// Users / Cleaners
export const usersAPI = {
  createCleaner: (data) => api.post('/users/create-cleaner', data),
  getCleaners: () => api.get('/users/cleaners'),
  updateCleaner: (id, data) => api.patch(`/users/cleaners/${id}`, data),
  updateCleanerPassword: (id, password) => api.patch(`/users/cleaners/${id}/password`, { password }),
  deleteCleaner: (id) => api.delete(`/users/cleaners/${id}`),
};