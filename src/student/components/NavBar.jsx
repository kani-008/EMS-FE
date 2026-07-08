// frontend/src/student/components/NavBar.jsx
import { NavLink } from "react-router-dom";
import assets from "../../assets/assets";

const NavBar = () => {
  return (
    <aside className="sidebar-blue">
      {/* Dashboard */}
      <NavLink to="/student" end className="sidebar-icon">
        <img src={assets.icon1} alt="Dashboard" />
      </NavLink>

      {/* Requests */}
      <NavLink to="/student/requests" className="sidebar-icon">
        <img src={assets.icon2} alt="Requests" />
      </NavLink>
    </aside>
  );
};

export default NavBar;
