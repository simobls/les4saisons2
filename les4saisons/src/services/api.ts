import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log out if the user is on a protected route and the token is missing/expired
    if (
      error.response?.status === 401 &&
      error.config &&
      !error.config.url.includes('/auth/login') &&
      !error.config.url.includes('/auth/register')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    // Optionally, show a message for other errors
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  async register(userData: { name: string; email: string; password: string; role?: string }) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  async login(credentials: { email: string; password: string }) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  async updateProfile(userData: any) {
    const response = await apiClient.put('/auth/profile', userData);
    return response.data;
  },

  async changePassword(passwordData: { currentPassword: string; newPassword: string }) {
    const response = await apiClient.put('/auth/change-password', passwordData);
    return response.data;
  }
};

// Menu API
export const menuApi = {
  async getMenuItems() {
    const response = await apiClient.get('/menu');
    return response.data;
  },

  async createMenuItem(itemData: any) {
    const response = await apiClient.post('/menu', itemData);
    return response.data;
  },

  async updateMenuItem(id: string, itemData: any) {
    const response = await apiClient.put(`/menu/${id}`, itemData);
    return response.data;
  },

  async deleteMenuItem(id: string) {
    const response = await apiClient.delete(`/menu/${id}`);
    return response.data;
  },

  async getMenuItemsByCategory(category: string) {
    const response = await apiClient.get(`/menu?category=${category}`);
    return response.data;
  }
};

// Order API
export const orderApi = {
  async createOrder(orderData: any) {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  async getOrders() {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  async getOrderById(id: string) {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(id: string, status: string) {
    const response = await apiClient.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  async cancelOrder(id: string) {
    const response = await apiClient.put(`/orders/${id}/cancel`);
    return response.data;
  },

  async getUserOrders() {
    const response = await apiClient.get('/orders/user');
    return response.data;
  },

  async getOrderStats(period = '7d') {
    const response = await apiClient.get(`/orders/stats?period=${period}`);
    return response.data;
  }
};

// User API
export const userApi = {
  async getUsers() {
    const response = await apiClient.get('/users');
    return response.data;
  },

  async getUserById(id: string) {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  async updateUser(id: string, userData: any) {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  async getUserStats() {
    const response = await apiClient.get('/users/stats');
    return response.data;
  }
};

// Payment API
export const paymentApi = {
  async createPaymentIntent(orderData: any) {
    const response = await apiClient.post('/payments/create-intent', orderData);
    return response.data;
  },

  async confirmPayment(paymentIntentId: string) {
    const response = await apiClient.post('/payments/confirm', { paymentIntentId });
    return response.data;
  },

  async refundPayment(paymentIntentId: string, amount?: number) {
    const response = await apiClient.post('/payments/refund', { paymentIntentId, amount });
    return response.data;
  }
};

// Statistics API
export const statsApi = {
  async getOrderStats(period = '7d') {
    const response = await apiClient.get(`/orders/stats?period=${period}`);
    return response.data.data;
  },

  async getUserStats() {
    const response = await apiClient.get('/users/stats');
    return response.data.data;
  },

  async getDashboardStats() {
    const [orderStats, userStats] = await Promise.all([
      this.getOrderStats(),
      this.getUserStats()
    ]);
    return { orderStats, userStats };
  }
};

export const categoryApi = {
  async getAll() {
    const response = await apiClient.get('/categories');
    return response.data;
  },
  async create(data: { name: string }) {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },
  async update(id: string, data: { name: string }) {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
  },
  async delete(id: string) {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};

export const sauceApi = {
  async getAll() {
    const response = await apiClient.get('/sauces');
    return response.data;
  },
  async create(data: { name: string }) {
    const response = await apiClient.post('/sauces', data);
    return response.data;
  },
  async update(id: string, data: { name: string }) {
    const response = await apiClient.put(`/sauces/${id}`, data);
    return response.data;
  },
  async delete(id: string) {
    const response = await apiClient.delete(`/sauces/${id}`);
    return response.data;
  },
};

export const drinkApi = {
  async getAll() {
    const response = await apiClient.get('/drinks');
    return response.data;
  },
  async create(data: { name: string }) {
    const response = await apiClient.post('/drinks', data);
    return response.data;
  },
  async update(id: string, data: { name: string }) {
    const response = await apiClient.put(`/drinks/${id}`, data);
    return response.data;
  },
  async delete(id: string) {
    const response = await apiClient.delete(`/drinks/${id}`);
    return response.data;
  },
};

export const pricePresetApi = {
  async getAll() {
    const response = await apiClient.get('/price-presets');
    return response.data;
  },
  async create(data: { name: string; value: number }) {
    const response = await apiClient.post('/price-presets', data);
    return response.data;
  },
  async update(id: string, data: { name: string; value: number }) {
    const response = await apiClient.put(`/price-presets/${id}`, data);
    return response.data;
  },
  async delete(id: string) {
    const response = await apiClient.delete(`/price-presets/${id}`);
    return response.data;
  },
};

export const supplementApi = {
  async getAll() {
    const response = await apiClient.get('/supplements');
    return response.data;
  },
  async create(data: { name: string; price: number }) {
    const response = await apiClient.post('/supplements', data);
    return response.data;
  },
  async update(id: string, data: { name: string; price: number }) {
    const response = await apiClient.put(`/supplements/${id}`, data);
    return response.data;
  },
  async delete(id: string) {
    const response = await apiClient.delete(`/supplements/${id}`);
    return response.data;
  },
};

export const viandeApi = {
  async getAll() {
    const response = await apiClient.get('/viandes');
    return response.data;
  },
  async create(data: { name: string }) {
    const response = await apiClient.post('/viandes', data);
    return response.data;
  },
  async update(id: string, data: { name: string }) {
    const response = await apiClient.put(`/viandes/${id}`, data);
    return response.data;
  },
  async delete(id: string) {
    const response = await apiClient.delete(`/viandes/${id}`);
    return response.data;
  },
};
