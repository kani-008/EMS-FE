/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import API, { injectLogout } from "../ApiCall/Api";

// ── Context ────────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

// ── Provider ───────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () =>
    API.post("/auth/logout")
      .catch((err) => console.error("Logout error:", err))
      .finally(() => setUser(null));

  // Wire logout into the API interceptor so any 401 response auto-clears auth
  useEffect(() => {
    injectLogout(logout);
  }, []);

  useEffect(() => {
    // Restore session from HTTP-only cookie on page load / refresh
    API.get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Set user directly from login response — no extra /api/auth/me round-trip
  const login = (userData) => setUser(userData);

  const updateUser = (data) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ────────────────────────────────────────────────────────────────────
export const useAuth = () => useContext(AuthContext);
