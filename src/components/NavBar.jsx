import { NavLink } from "react-router-dom";
import assets from "../assets/assets";
import { useAuth } from "../context/AuthContext";

const NavBar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;
  const isStudent = role === "STUDENT";
  const basePath = isStudent ? "/student" : role === "ADMIN" ? "/admin" : "/staff";

  return (
    <aside className="sidebar-blue">
      {/* Dashboard */}
      <NavLink to={basePath} end className="sidebar-icon">
        <img src={assets.icon1} alt="Dashboard" />
      </NavLink>

      {/* Requests */}
      <NavLink to={`${basePath}/requests`} className="sidebar-icon">
        <img src={assets.icon2} alt="Requests" />
      </NavLink>

      {!isStudent && (
        <>
          {/* Users */}
          <NavLink to={`${basePath}/users`} className="sidebar-icon">
            <img src={assets.icon3} alt="Users" />
          </NavLink>

          {/* Settings */}
          <NavLink to={`${basePath}/settings`} className="sidebar-icon">
            <img src={assets.icon4} alt="Settings" />
          </NavLink>

          {/* Reports */}
          <NavLink to={`${basePath}/reports`} className="sidebar-icon">
            <img src={assets.icon5} alt="Reports" />
          </NavLink>
        </>
      )}
    </aside>
  );
};

export default NavBar;
