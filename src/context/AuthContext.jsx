// frontend/src/context/AuthContext.jsx
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "./authContextObject";

// Include cookies with all requests (HTTP-only cookie auth)
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from HTTP-only cookie on page load/refresh
    fetchUser();
  }, []);

  // Called on page load/refresh to restore session from cookie
  const fetchUser = async () => {
    try {
      const res = await axios.get("/api/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Called after a successful login — set user directly from login response
  // (avoids a redundant /api/auth/me round-trip)
  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Re-exported for backward compatibility — all existing import sites keep working
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
