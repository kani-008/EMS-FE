import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../layout/Layout";

import Dashboard from "../pages/Dashboard/Dashboard";
import UserManagement from "../pages/Users/UserManagement";
import RequestManagement from "../pages/Requests/RequestManagement";
import GeneralSettings from "../pages/Settings/GeneralSettings";
import Reports from "../pages/Reports/Reports";
import AdminProfile from "../pages/Profile/AdminProfile";

const App = () => {
  return (
    <div className="font-sans">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManagement role="ADMIN" />} />
          <Route path="requests" element={<RequestManagement />} />
          <Route path="settings" element={<GeneralSettings />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </div>
  );
};

export default App;
