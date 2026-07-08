// frontend/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./loginPage/Login";

import StudentApp from "./student/App";
import StaffApp from "./staff/App";
import AdminApp from "./admin/App";

import ProtectedRoute from "./components/ProtectedRoute";

// Must stay in sync with STAFF_ROLES in Login.jsx and ROLE_MAP in auth.service.js
const STAFF_ROLES = ["ADVISOR", "HOD", "PRINCIPAL", "FACULTY", "PLACEMENT", "SPORTS"];

const App = () => {
  return (
    <Routes>
      {/* Redirect root to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Single Unified Login Page */}
      <Route path="/login" element={<Login />} />

      {/* Student App (PROTECTED: only STUDENT role) */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute roles={["STUDENT"]}>
            <StudentApp />
          </ProtectedRoute>
        }
      />

      {/* Staff App (PROTECTED: all staff/faculty roles) */}
      <Route
        path="/staff/*"
        element={
          <ProtectedRoute roles={STAFF_ROLES}>
            <StaffApp />
          </ProtectedRoute>
        }
      />

      {/* Admin App (PROTECTED: only ADMIN role) */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminApp />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
