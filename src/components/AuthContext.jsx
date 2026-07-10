/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import API, { injectLogout } from "../ApiCall/Api";

// ── Context ────────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

// ── Provider ───────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    const refreshToken = localStorage.getItem("ems_refresh_token");
    const accessToken = localStorage.getItem("ems_access_token");
    return API.post("/auth/logout", 
      { refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
      .catch((err) => console.error("Logout error:", err))
      .finally(() => {
        localStorage.removeItem("ems_access_token");
        localStorage.removeItem("ems_refresh_token");
        setUser(null);
      });
  };

  // Wire logout into the API interceptor so any 401 response auto-clears auth
  useEffect(() => {
    injectLogout(logout);
  }, []);

  useEffect(() => {
    // Restore session from localStorage refresh token on page load / refresh
    const refreshToken = localStorage.getItem("ems_refresh_token");
    if (!refreshToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    API.post("/auth/refresh-token", { refreshToken })
      .then((res) => {
        if (res.data.success && res.data.accessToken) {
          localStorage.setItem("ems_access_token", res.data.accessToken);
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        localStorage.removeItem("ems_access_token");
        localStorage.removeItem("ems_refresh_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Set user and tokens directly from login response
  const login = (userData, accessToken, refreshToken) => {
    localStorage.setItem("ems_access_token", accessToken);
    localStorage.setItem("ems_refresh_token", refreshToken);
    setUser(userData);
  };

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
