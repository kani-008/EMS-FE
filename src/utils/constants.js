// frontend/src/utils/constants.js
export const STATUS_COLORS = {
  Pending: 'bg-orange-100 text-orange-700 border-orange-200',
  Approved: 'bg-green-100 text-green-700 border-green-200',
  Accepted: 'bg-green-100 text-green-700 border-green-200',
  Rejected: 'bg-red-100 text-red-700 border-red-200',
  Active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Inactive: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const STAFF_ROLES = ["ADVISOR", "HOD", "PRINCIPAL", "FACULTY", "PLACEMENT", "SPORTS"];

export const NAV_CONFIG = {
  ADMIN: [
    { to: "/admin", end: true, icon: "icon1", label: "Dashboard" },
    { to: "/admin/requests", icon: "icon2", label: "Requests" },
    { to: "/admin/users", icon: "icon3", label: "Users" },
    { to: "/admin/settings", icon: "icon4", label: "Settings" },
    { to: "/admin/reports", icon: "icon5", label: "Reports" },
  ],
  STAFF: [
    { to: "/staff", end: true, icon: "icon1", label: "Dashboard" },
    { to: "/staff/requests", icon: "icon2", label: "Requests" },
    { to: "/staff/users", icon: "icon3", label: "Users" },
    { to: "/staff/settings", icon: "icon4", label: "Settings" },
    { to: "/staff/reports", icon: "icon5", label: "Reports" },
  ],
  STUDENT: [
    { to: "/student", end: true, icon: "icon1", label: "Dashboard" },
    { to: "/student/requests", icon: "icon2", label: "Requests" },
  ],
};

