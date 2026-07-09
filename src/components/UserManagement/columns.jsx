// frontend/src/components/UserManagement/columns.jsx
import StatusBadge from "../StatusBadge";

export const adminUserColumns = [
  // ── STAFF ID ──────────────────────────────────────────────────────────────
  {
    header: "USER ID",
    accessor: "userId",
    width: "w-24",
    render: (row) => (
      <span className="font-medium text-slate-500 ">
        {row.userId || "-"}
      </span>
    ),
  },

  // ── FULL NAME ─────────────────────────────────────────────────────────────
  {
    header: "FULL NAME",
    accessor: "fullName",
    width: "w-44",
    render: (row) => (
      <span className="font-medium text-slate-500">{row.fullName || "-"}</span>
    ),
  },

  // ── DEPARTMENT ────────────────────────────────────────────────────────────
  {
    header: "DEPARTMENT",
    accessor: "department",
    width: "w-28",
    render: (row) => <span className="text-slate-500">{row.department || "-"}</span>,
  },

  // ── COURSE ────────────────────────────────────────────────────────────────
  {
    header: "COURSE",
    accessor: "course",
    width: "w-20",
    render: (row) => {
      const val = row.course ?? "";
      const display = String(val).trim();
      return (
        <span className="text-slate-500">
          {display && display !== "-" ? display : "-"}
        </span>
      );
    },
  },

  // ── BATCH ─────────────────────────────────────────────────────────────────
  {
    header: "BATCH",
    accessor: "batchDisplay",
    width: "w-20",
    render: (row) => {
      const val = row.batchDisplay ?? row.batchYear ?? row.batch ?? "";
      const display = String(val).trim();
      return (
        <span className="text-slate-500">
          {display && display !== "-" && display.toUpperCase() !== "N/A"
            ? display
            : "-"}
        </span>
      );
    },
  },

  // ── YEAR ──────────────────────────────────────────────────────────────────
  {
    header: "YEAR",
    accessor: "current_year",
    width: "w-16",
    render: (row) => {
      const y = row.current_year;
      return (
        <span className="text-slate-500">
          {y != null && y !== "" ? `${y}` : "-"}
        </span>
      );
    },
  },

  // ── ROLE ──────────────────────────────────────────────────────────────────
  {
    header: "ROLE",
    accessor: "userRole",
    width: "w-28",
    render: (row) => (
      <span className="text-slate-500 font-medium">
        {row.userRole || "-"}
      </span>
    ),
  },

  // ── STATUS ────────────────────────────────────────────────────────────────
  {
    header: "STATUS",
    accessor: "status",
    width: "w-20",
    render: (row) => {
      const isActive = String(row.status || "").toUpperCase() === "ACTIVE";
      return (
        <span className={isActive ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
  },

  // ── CREATED BY ────────────────────────────────────────────────────────────
  {
    header: "CREATED BY",
    accessor: "createdBy",
    width: "w-32",
    render: (row) => (
      <span className="text-slate-500 text-xs">{row.createdBy || "-"}</span>
    ),
  },
];

export const staffUserColumns = [
  { header: "USER ID", accessor: "userId", width: "w-24" },
  { header: "USER NAME", accessor: "userName", width: "w-28" },
  { header: "COURSE", accessor: "course", width: "w-14" },
  { header: "DEPARTMENT", accessor: "department", width: "w-24" },
  { header: "YEAR", accessor: "year", width: "w-12" },
  {
    header: "REGISTRATION NO",
    accessor: "registrationNo",
    width: "w-40",
  },
  { header: "BATCH", accessor: "batch", width: "w-16" },
  { header: "TIMESTAMP", accessor: "timestamp", width: "w-48" },
  {
    header: "STATUS",
    width: "w-20",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    header: "USER ROLE",
    accessor: "userRole",
    width: "w-24",
    render: (row) => (
      <span
        className={`px-8 py-1 pl-9 -ml-5 rounded-full text-sm font-semibold border
          ${
            row.userRole === "Student"
              ? "border-red-500 text-red-600"
              : "border-slate-300 text-slate-600"
          }`}
      >
        {row.userRole}
      </span>
    ),
  },
];
