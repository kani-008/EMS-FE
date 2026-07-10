/* eslint-disable react-refresh/only-export-components */
import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL;

// ── Axios instance ─────────────────────────────────────────────────────────────
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── Auth injection ─────────────────────────────────────────────────────────
// AuthProvider calls injectLogout(fn) once on mount so the response
// interceptor below can clear auth state on any 401 without importing
// React context here (hooks can't run outside components).
let _logout = null;
export const injectLogout = (fn) => { _logout = fn; };

// ── Response interceptor — auto-logout on 401 ─────────────────────────────
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const code = err.response?.data?.code;
    const isTokenIssue = !code || ["TOKEN_EXPIRED", "TOKEN_INVALID", "NO_TOKEN"].includes(code);
    const isUnauthorized = err.response?.status === 401 && isTokenIssue;
    const isInactive = err.response?.status === 403 && err.response?.data?.message === "Account is inactive. Please contact admin.";
    if ((isUnauthorized || isInactive) && _logout) {
      _logout();
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
