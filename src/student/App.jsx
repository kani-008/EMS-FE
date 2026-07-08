// frontend/src/student/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";

import Dashboard from "./pages/Dashboard/Dashboard";
import RequestManagement from "./pages/Requests/RequestManagement";
import StudentProfile from "./pages/Profile/StudentProfile";

const App = () => {
  return (
    <div className="font-sans">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="requests" element={<RequestManagement />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </div>
  );
};

export default App;

