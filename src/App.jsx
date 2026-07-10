import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import RequestManagement from "./pages/RequestManagement";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/route/ProtectedRoute";
import { STAFF_ROLES } from "./components/constants";

const App = () => {
  return (
    <Routes>
      {/* Redirect root to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Single Unified Login Page */}
      <Route path="/login" element={<Login />} />

      {/* Student Portal */}
      <Route element={<ProtectedRoute roles={["STUDENT"]} />}>
        <Route path="/student" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="requests" element={<RequestManagement />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Staff Portal */}
      <Route element={<ProtectedRoute roles={STAFF_ROLES} />}>
        <Route path="/staff" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="requests" element={<RequestManagement />} />
          {/* Gate the users route to ADVISOR only */}
          <Route element={<ProtectedRoute roles={["ADVISOR"]} />}>
            <Route path="users" element={<UserManagement />} />
          </Route>
          <Route path="settings" element={<Settings />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Admin Portal */}
      <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
        <Route path="/admin" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="requests" element={<RequestManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;