// frontend/src/layout/Header.jsx
import assets from "../assets/assets.js";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { STAFF_ROLES } from "../utils/constants";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = user?.username
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
    : "User";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleProfileClick = () => {
    setDropdownOpen(false);
    const role = user?.role;
    if (role === "ADMIN") {
      navigate("/admin/profile");
    } else if (STAFF_ROLES.includes(role)) {
      navigate("/staff/profile");
    } else {
      navigate("/student/profile");
    }
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <>
      <div className="header">
        <h2 className="heading">EVENT TRACKING SYSTEM</h2>

        <div className="relative flex items-center gap-3" ref={dropdownRef}>
          <span className="text-slate-600 font-semibold text-sm">{displayName}</span>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center justify-center rounded-full hover:bg-slate-100 transition p-1 focus:outline-none"
            title="My Profile Menu"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <img src={assets.profile_icon} style={{ width: "40px" }} alt="Profile" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50">
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-blue-600 hover:text-white transition-colors text-left"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                My Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-blue-600 hover:text-white transition-colors text-left"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
