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

export default API;
