/* eslint-disable react-refresh/only-export-components */
import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL;

// ── Axios instance ─────────────────────────────────────────────────────────────
// withCredentials so the httpOnly refreshToken cookie is sent/received on
// every request — the refresh token itself is never read or stored by JS.
const API = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ── Shared silent-refresh call ──────────────────────────────────────────────
// Used both by the 401 interceptor below and by AuthContext on app load.
// The refresh token travels only as the httpOnly cookie — nothing is read
// from or written to localStorage for it.
export const refreshAccessToken = () =>
  axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });

// ── Request interceptor — attach Bearer token ───────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ems_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ── Auth injection ─────────────────────────────────────────────────────────
// AuthProvider calls injectLogout(fn) once on mount so the response
// interceptor below can clear auth state on any 401 without importing
// React context here (hooks can't run outside components).
let _logout = null;
export const injectLogout = (fn) => { _logout = fn; };

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ── Response interceptor — silent re-auth or auto-logout ──────────────────
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const code = err.response?.data?.code;
    const isInactive = err.response?.status === 403 && err.response?.data?.message === "Account is inactive. Please contact admin.";

    if (isInactive && _logout) {
      _logout();
      return Promise.reject(err);
    }

    if (err.response?.status === 401) {
      // If access token has expired, try refreshing it silently
      if (code === "TOKEN_EXPIRED" && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return API(originalRequest);
            })
            .catch((queueErr) => {
              return Promise.reject(queueErr);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Direct axios call (bypasses the request interceptor's stale bearer
          // token); the refresh token itself rides along as the httpOnly cookie.
          const refreshRes = await refreshAccessToken();
          if (refreshRes.data.success && refreshRes.data.accessToken) {
            const newToken = refreshRes.data.accessToken;
            localStorage.setItem("ems_access_token", newToken);
            processQueue(null, newToken);
            isRefreshing = false;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return API(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          isRefreshing = false;
          if (_logout) {
            _logout();
          }
          return Promise.reject(refreshErr);
        }
      } else {
        // For other 401s (NO_TOKEN, TOKEN_INVALID or failed retry), trigger logout
        const isTokenIssue = !code || ["TOKEN_EXPIRED", "TOKEN_INVALID", "NO_TOKEN"].includes(code);
        if (isTokenIssue && _logout) {
          _logout();
        }
      }
    }

    return Promise.reject(err);
  }
);

// ── Caching utility ────────────────────────────────────────────────────────
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export const getCachedData = async (key, url) => {
  const cachedStr = localStorage.getItem(key);
  const now = Date.now();
  
  let cached = null;
  if (cachedStr) {
    try {
      cached = JSON.parse(cachedStr);
    } catch (_) {
      localStorage.removeItem(key);
    }
  }

  // If we have cache and it's not expired
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    if (key === "departments") {
      try {
        const metadataRes = await API.get("/departments/count");
        if (metadataRes.data.success && metadataRes.data.count === cached.data.length) {
          return cached.data;
        }
      } catch (err) {
        console.warn("Failed to verify department count, falling back to cache", err);
        return cached.data;
      }
    } else {
      return cached.data;
    }
  }

  // Cache miss, expired, or count mismatch
  try {
    const res = await API.get(url);
    if (res.data.success) {
      const dataToCache = res.data.data;
      localStorage.setItem(key, JSON.stringify({
        timestamp: Date.now(),
        data: dataToCache
      }));
      return dataToCache;
    }
  } catch (err) {
    console.error(`Failed to fetch fresh data for key ${key}:`, err);
    if (cached) {
      console.warn(`Falling back to expired cache for key ${key}`);
      return cached.data;
    }
  }
  return [];
};

export default API;
