// frontend/src/staff/components/NavBar.jsx
import { NavLink } from "react-router-dom";
import assets from "../../assets/assets";

const NavBar = () => {
  return (
    <aside className="sidebar-blue">
      {/* Dashboard */}
      <NavLink to="/admin" end className="sidebar-icon">
        <img src={assets.icon1} alt="Dashboard" />
      </NavLink>

      <NavLink to="/admin/requests" className="sidebar-icon">
        <img src={assets.icon2} alt="Requests" />
      </NavLink>

      <NavLink to="/admin/users" className="sidebar-icon">
        <img src={assets.icon3} alt="Users" />
      </NavLink>

      <NavLink to="/admin/settings" className="sidebar-icon">
        <img src={assets.icon4} alt="Settings" />
      </NavLink>

      <NavLink to="/admin/reports" className="sidebar-icon">
        <img src={assets.icon5} alt="Reports" />
      </NavLink>
    </aside>
  );
};

export default NavBar;
