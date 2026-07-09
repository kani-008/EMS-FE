// frontend/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./loginPage/Login";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import RequestManagement from "./pages/RequestManagement";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import AdminProfile from "./pages/Profile/AdminProfile";
import StaffProfile from "./pages/Profile/StaffProfile";
import StudentProfile from "./pages/Profile/StudentProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import { STAFF_ROLES } from "./utils/constants";

const App = () => {
  return (
    <Routes>
      {/* Redirect root to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      {/* Single Unified Login Page */}
      <Route path="/login" element={<Login />} />
      {/* Student App Routes */}
      <Route path="/student"element={<ProtectedRoute roles={["STUDENT"]}><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="requests" element={<RequestManagement />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>
      {/* Staff App Routes */}
      <Route path="/staff" element={<ProtectedRoute roles={STAFF_ROLES}><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="requests" element={<RequestManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="settings" element={<Settings />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<StaffProfile />} />
      </Route>
      {/* Admin App Routes */}
      <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="requests" element={<RequestManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="settings" element={<Settings />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
export default App;
