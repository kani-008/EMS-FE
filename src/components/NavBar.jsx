// frontend/src/components/NavBar.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NAV_CONFIG, STAFF_ROLES } from "../utils/constants";
import assets from "../assets/assets";

const NavBar = () => {
  const { user } = useAuth();
  const role = user?.role;

  // Resolve config key
  let configKey = "STUDENT";
  if (role === "ADMIN") {
    configKey = "ADMIN";
  } else if (STAFF_ROLES.includes(role)) {
    configKey = "STAFF";
  }

  const navItems = NAV_CONFIG[configKey] || [];

  return (
    <aside className="sidebar-blue">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className="sidebar-icon"
        >
          <img src={assets[item.icon]} alt={item.label} />
        </NavLink>
      ))}
    </aside>
  );
};

export default NavBar;
