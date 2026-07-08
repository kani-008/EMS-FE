// frontend/src/admin/layout/Layout.jsx
import { Outlet } from "react-router-dom";
import Header from "./Header";
import NavBar from "../components/NavBar";

const Layout = () => {
  return (
    <>
      <Header />
      <div className="app-shell">
        <NavBar />
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;
