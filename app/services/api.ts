import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = 'https://maestro-api-dev.secil.biz';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token yenileme işlemi
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await api.post('/Auth/RefreshTokenLogin', {
            refreshToken,
          });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          if (error.config) {
            return api(error.config);
          }
        } catch (refreshError) {
          // Token yenileme başarısız olursa kullanıcıyı logout yap
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/Auth/Login', { username, password });
    return response.data;
  },
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/Auth/RefreshTokenLogin', { refreshToken });
    return response.data;
  },
};

export const collectionService = {
  getAll: async () => {
    const response = await api.get('/Collection/GetAll');
    return response.data;
  },
  getProducts: async (collectionId: number, page = 1, pageSize = 36, additionalFilters = []) => {
    const response = await api.post(`/Collection/${collectionId}/GetProductsForConstants`, {
      page,
      pageSize,
      additionalFilters,
    });
    return response.data;
  },
  getFilters: async (collectionId: number) => {
    const response = await api.get(`/Collection/${collectionId}/GetFiltersForConstants`);
    return response.data;
  },
};

export default api; 