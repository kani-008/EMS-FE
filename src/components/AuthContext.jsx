/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import API, { injectLogout, refreshAccessToken } from "../ApiCall/Api";

// ── Context ────────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

const ACCESS_TOKEN_KEY = "ems_access_token";

// ── Provider ───────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-entrancy guard: /auth/logout itself 401s when there's no valid token,
  // and that 401 flows back through the response interceptor into this same
  // logout() — without this guard that's unbounded recursion (the interceptor
  // calls _logout() again, which POSTs again, which 401s again, forever).
  const loggingOutRef = useRef(false);

  const logout = () => {
    if (loggingOutRef.current) return Promise.resolve();
    loggingOutRef.current = true;

    const clear = () => {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      setUser(null);
      loggingOutRef.current = false;
    };

    // Nothing to invalidate server-side if we were never holding a token.
    if (!localStorage.getItem(ACCESS_TOKEN_KEY)) {
      clear();
      return Promise.resolve();
    }

    return API.post("/auth/logout")
      .catch((err) => console.error("Logout error:", err))
      .finally(clear);
  };

  // Wire logout into the API interceptor so any 401 response auto-clears auth
  useEffect(() => {
    injectLogout(logout);
  }, []);

  // Restore session on load / refresh.
  // The JWT lives in localStorage (shared across tabs of this origin) so a
  // second tab picks it up immediately; the refresh token never touches JS —
  // it's the httpOnly cookie, sent automatically by the browser.
  useEffect(() => {
    const bootstrap = async () => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (accessToken) {
        try {
          const res = await API.get("/auth/me");
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            setUser(null);
          }
        } catch {
          // API response interceptor already attempts a silent refresh on
          // TOKEN_EXPIRED; if we land here the token/cookie truly isn't valid.
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          setUser(null);
        } finally {
          setLoading(false);
        }
        return;
      }

      // No cached access token — try a silent refresh via the httpOnly cookie
      // alone before giving up and showing the login page.
      try {
        const res = await refreshAccessToken();
        if (res.data.success && res.data.accessToken) {
          localStorage.setItem(ACCESS_TOKEN_KEY, res.data.accessToken);
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  // Cross-tab sync: another tab logging out (token cleared) logs this tab out
  // too; another tab logging in (token written) hydrates this tab's user
  // without a manual refresh.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== ACCESS_TOKEN_KEY) return;

      if (!e.newValue) {
        setUser(null);
        return;
      }

      API.get("/auth/me")
        .then((res) => {
          if (res.data.success) setUser(res.data.user);
        })
        .catch(() => {});
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Set user and token directly from login response
  const login = (userData, accessToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
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
