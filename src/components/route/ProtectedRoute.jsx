import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";

// Derive the user's correct home path from their role
function getHomePath(role) {
  if (role === "STUDENT") return "/student";
  if (role === "ADMIN")   return "/admin";
  return "/staff"; // all staff / faculty roles
}

/**
 * ProtectedRoute
 * Props:
 *   roles {string[]} — allowed roles; omit to allow any authenticated user
 *   redirectTo {string} — where unauthenticated users are sent (default: /login)
 */
const ProtectedRoute = ({ roles, redirectTo = "/login" }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-slate-500 text-sm">Loading...</div>
      </div>
    );
  }

  // Not logged in → go to login
  if (!user) return <Navigate to={redirectTo} replace />;

  // Authenticated but wrong role → redirect to their own portal
  if (roles && !roles.includes(user.role)) {
    console.warn(
      `Access denied. Role '${user.role}' not in [${roles.join(", ")}]. Redirecting.`
    );
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
