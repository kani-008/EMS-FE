// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Derive the user's correct home path from their role
function getHomePath(role) {
  if (role === "STUDENT") return "/student";
  if (role === "ADMIN") return "/admin";
  // All staff/faculty roles
  return "/staff";
}

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-slate-500 text-sm">Loading...</div>
      </div>
    );
  }

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but wrong role → redirect to their correct portal
  if (roles && !roles.includes(user.role)) {
    console.warn(
      `Access denied. Role '${user.role}' not in [${roles.join(", ")}]. Redirecting.`
    );
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
