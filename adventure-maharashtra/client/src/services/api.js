import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true, // Crucial for sending & receiving HttpOnly cookies
  timeout: 10000
});

// Response interceptor for centralized error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    console.error(`[API Error]: ${customMessage}`);
    return Promise.reject(new Error(customMessage));
  }
);

// --- AUTHENTICATION APIS ---
export const registerUser = async (formData) => {
  const { data } = await api.post('/auth/register', formData);
  return data;
};

export const loginUser = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const logoutUser = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const updateProfile = async (profileData) => {
  const { data } = await api.put('/auth/profile', profileData);
  return data;
};

export const changeUserPassword = async (passwordData) => {
  const { data } = await api.put('/auth/change-password', passwordData);
  return data;
};

export const getDashboardStats = async () => {
  const { data } = await api.get('/auth/dashboard-stats');
  return data;
};

// --- FAVORITES APIS ---
export const getFavorites = async () => {
  const { data } = await api.get('/favorites');
  return data;
};

export const addFavorite = async (parkId) => {
  const { data } = await api.post('/favorites', { parkId });
  return data;
};

export const removeFavorite = async (parkId) => {
  const { data } = await api.delete(`/favorites/${parkId}`);
  return data;
};

export const checkIsFavorite = async (parkId) => {
  const { data } = await api.get(`/favorites/check/${parkId}`);
  return data;
};

// --- PARKS APIS (PUBLIC) ---
export const getParks = async (params = {}) => {
  const { data } = await api.get('/parks', { params });
  return data;
};

export const getFeaturedParks = async () => {
  const { data } = await api.get('/parks/featured');
  return data;
};

export const getParkBySlug = async (slug) => {
  const { data } = await api.get(`/parks/${slug}`);
  return data;
};

export const checkParkAvailability = async (slug, date) => {
  const { data } = await api.get(`/parks/${slug}/availability`, { params: { date } });
  return data;
};

// --- PARKS APIS (PARTNER / ADMIN) ---
export const getMyParks = async () => {
  const { data } = await api.get('/parks/admin/my-parks');
  return data;
};

export const getAdminParkById = async (id) => {
  const { data } = await api.get(`/parks/admin/${id}`);
  return data;
};

export const createPark = async (parkData) => {
  const { data } = await api.post('/parks', parkData);
  return data;
};

export const updatePark = async (id, parkData) => {
  const { data } = await api.put(`/parks/${id}`, parkData);
  return data;
};

export const updateParkStatus = async (id, statusData) => {
  const { data } = await api.patch(`/parks/${id}/status`, statusData);
  return data;
};

export const deletePark = async (id) => {
  const { data } = await api.delete(`/parks/${id}`);
  return data;
};

// --- PACKAGES APIS (PASSES) ---
export const getPackagesByPark = async (parkId) => {
  const { data } = await api.get(`/packages/park/${parkId}`);
  return data;
};

export const createPackage = async (packageData) => {
  const { data } = await api.post('/packages', packageData);
  return data;
};

export const updatePackage = async (id, packageData) => {
  const { data } = await api.put(`/packages/${id}`, packageData);
  return data;
};

export const deletePackage = async (id) => {
  const { data } = await api.delete(`/packages/${id}`);
  return data;
};

// --- ACTIVITIES APIS ---
export const getActivities = async () => {
  const { data } = await api.get('/activities');
  return data;
};

export const getActivityBySlug = async (slug) => {
  const { data } = await api.get(`/activities/${slug}`);
  return data;
};

// --- DESTINATIONS APIS ---
export const getDestinations = async () => {
  const { data } = await api.get('/destinations');
  return data;
};

export const getDestinationBySlug = async (slug) => {
  const { data } = await api.get(`/destinations/${slug}`);
  return data;
};

// --- COUPONS APIS ---
export const getCoupons = async () => {
  const { data } = await api.get('/coupons');
  return data;
};

export const validateCoupon = async (payload) => {
  const { data } = await api.post('/coupons/validate', payload);
  return data;
};

// --- BOOKINGS APIS (PHASE 5) ---
export const calculateBookingPricing = async (payload) => {
  const { data } = await api.post('/bookings/calculate', payload);
  return data;
};

export const createBooking = async (payload) => {
  const { data } = await api.post('/bookings', payload);
  return data;
};

export const getMyBookings = async (params = {}) => {
  const { data } = await api.get('/bookings/my-bookings', { params });
  return data;
};

export const getBookingById = async (id) => {
  const { data } = await api.get(`/bookings/${id}`);
  return data;
};

export const cancelBooking = async (id, reason) => {
  const { data } = await api.put(`/bookings/${id}/cancel`, { reason });
  return data;
};

// --- PAYMENTS APIS (PHASE 6) ---
export const createPaymentOrder = async (payload) => {
  const { data } = await api.post('/payments/create-order', payload);
  return data;
};

export const verifyPayment = async (payload) => {
  const { data } = await api.post('/payments/verify', payload);
  return data;
};

export const processRefund = async (bookingId) => {
  const { data } = await api.post(`/payments/${bookingId}/refund`);
  return data;
};

// --- TICKETS & TURNSTILE SCANNER APIS (PHASE 7) ---
export const getTicketByReference = async (ticketReference) => {
  const { data } = await api.get(`/tickets/ref/${ticketReference}`);
  return data;
};

export const getTicketsForBooking = async (bookingId) => {
  const { data } = await api.get(`/tickets/booking/${bookingId}`);
  return data;
};

export const scanGateTicket = async (scanPayload) => {
  const { data } = await api.post('/tickets/scan', scanPayload);
  return data;
};

export const getParkScanHistory = async (parkId) => {
  const { data } = await api.get(`/tickets/history/${parkId}`);
  return data;
};

// --- REVIEWS & RATINGS APIS (PHASE 8) ---
export const getParkReviews = async (parkId, params = {}) => {
  const { data } = await api.get(`/reviews/park/${parkId}`, { params });
  return data;
};

export const createReview = async (reviewData) => {
  const { data } = await api.post('/reviews', reviewData);
  return data;
};

export const deleteReview = async (reviewId) => {
  const { data } = await api.delete(`/reviews/${reviewId}`);
  return data;
};

// --- ANALYTICS APIS (PHASE 8) ---
export const getPartnerAnalytics = async (params = {}) => {
  const { data } = await api.get('/analytics/partner', { params });
  return data;
};

export const getPlatformAnalytics = async () => {
  const { data } = await api.get('/analytics/platform');
  return data;
};

export default api;