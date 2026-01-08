
import axios from 'axios';
import Cookies from 'js-cookie';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const apiKey = import.meta.env.VITE_API_KEY;
const REFRESH_COOKIE = import.meta.env.VITE_REFRESH_COOKIE_NAME || 'empleabilidad_rt';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const plainClient = axios.create({ baseURL });

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (token) {
      resolve(token);
    } else {
      reject(error);
    }
  });
  refreshQueue = [];
};

const getStoredToken = () => localStorage.getItem('authToken');
const getStoredRefreshToken = () => Cookies.get(REFRESH_COOKIE);

api.interceptors.request.use((config) => {
  if (apiKey) {
    config.headers['x-api-key'] = apiKey;
  }
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    if (status !== 401 || originalRequest?._retry) {
      return Promise.reject(error)
    }

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          originalRequest._retry = true;
          return api(originalRequest);
        })
        .catch(Promise.reject);
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await plainClient.post(
        '/auth/refresh',
        { refresh_token: refreshToken },
        { headers: { 'x-api-key': apiKey } }
      );
      const responseData = data?.data || data;
      const newToken = responseData?.access_token || responseData?.accessToken;
      const newRefresh = responseData?.refresh_token || responseData?.refreshToken;
      if (newToken) {
        localStorage.setItem('authToken', newToken);
        if (newRefresh) {
          Cookies.set(REFRESH_COOKIE, newRefresh, {
            secure: true,
            sameSite: 'strict',
            expires: 7,
            path: '/',
          });
        }
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
      processQueue(error, null);
      return Promise.reject(error);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthStorage();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
)

const clearAuthStorage = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  try {
    Cookies.remove(REFRESH_COOKIE, { path: '/' })
  } catch (e) {
    // ignore
  }
}

const setAuthTokens = ({ access_token, refresh_token, user }) => {
  if (access_token) {
    localStorage.setItem('authToken', access_token);
  }
  if (refresh_token) {
    const isSecure = typeof window !== 'undefined' && window.location?.protocol === 'https:'
    Cookies.set(REFRESH_COOKIE, refresh_token, {
      secure: isSecure,
      sameSite: 'lax',
      expires: 7,
      path: '/',
    });
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

const getStoredUser = () => {
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (error) {
    return null
  }
}

export { api, plainClient, apiKey, baseURL, clearAuthStorage, getStoredUser, setAuthTokens, getStoredRefreshToken }
