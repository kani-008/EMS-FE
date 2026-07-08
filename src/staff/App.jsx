// frontend/src/staff/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";

import Dashboard from "./pages/Dashboard/Dashboard";
import UserManagement from "./pages/Users/UserManagement";
import RequestManagement from "./pages/Requests/RequestManagement";
import StaffProfile from "./pages/Profile/StaffProfile";

import Reports from "./pages/Reports/Reports";

const App = () => {
  return (
    <div className="font-sans">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="requests" element={<RequestManagement />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </div>
  );
};

export default App;
