import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import API from "../ApiCall/Api";

// Roles that access the staff portal
const STAFF_ROLES = [
  "ADVISOR",
  "HOD",
  "PRINCIPAL",
  "FACULTY",
  "PLACEMENT",
  "SPORTS",
];

function getRoleRedirect(role) {
  if (role === "STUDENT") return "/student";
  if (role === "ADMIN") return "/admin";
  if (STAFF_ROLES.includes(role)) return "/staff";
  return null; // UNKNOWN role
}

// Navbar / sidebar colour — read from .sidebar-blue { background: #147cdd } in global.css
const BRAND = "#147cdd";
const BRAND_D = "#0f6ec2"; // hover / loading shade

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter your credentials.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Single API call — login response already includes role from JWT payload
      const res = await API.post("/auth/login", { username, password });

      if (!res.data.success) {
        setError("Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      const userData = res.data.user; // { username, role, roleId, department_id, status }

      // Populate AuthContext with user data (no extra /api/auth/me call needed)
      login(userData);

      // Redirect dynamically based on role returned by backend
      const path = getRoleRedirect(userData.role);
      if (path) {
        navigate(path);
      } else {
        setError("Your account role is not recognized. Please contact admin.");
      }
    } catch (err) {
      console.error("[Login] Error:", err.response?.data || err.message || err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        background: BRAND,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── WHITE CARD ──────────────────────────────────────────────────────── */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
        {/* 1. Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg"
            style={{ background: BRAND }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
        </div>

        {/* 2. App name */}
        <h1 className="text-center text-xl font-bold text-slate-800 tracking-tight leading-snug">
          EVENT TRACKING SYSTEM
        </h1>

        {/* 3. Subtitle */}
        <p className="text-center text-sm text-slate-500 mt-1 mb-7">
          Sign in to your account
        </p>

        {/* 4. Error message */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
            <svg
              className="flex-shrink-0 mt-0.5"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-red-700 text-xs font-medium">{error}</p>
          </div>
        )}

        {/* 5. Username */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Username
          </label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your username"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm text-slate-800
                       placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
            style={{ "--tw-ring-color": BRAND }}
          />
        </div>

        {/* 6. Password */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your password"
              className="w-full px-4 py-3 pr-11 border border-slate-300 rounded-lg text-sm text-slate-800
                         placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{ "--tw-ring-color": BRAND }}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 7. Sign In button */}
        <button
          id="login-submit"
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold text-white text-sm tracking-wide
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: loading ? `${BRAND}99` : BRAND }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = BRAND_D;
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = BRAND;
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <path
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeOpacity="0.25"
                />
                <path d="M21 12a9 9 0 00-9-9" />
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </button>

        {/* 8. Copyright */}
        <p className="text-center text-[10px] text-slate-400 mt-6">
          © 2025 Event Tracking System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
