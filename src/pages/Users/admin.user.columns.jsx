// Table columns: Staff ID | Full Name | Department | Batch | Year | Role | Status | Created By
// Username is intentionally excluded per requirements.

export const userColumns = [
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
  // Dynamically captured from session at insert time — never hardcoded.
  {
    header: "CREATED BY",
    accessor: "createdBy",
    width: "w-32",
    render: (row) => (
      <span className="text-slate-500 text-xs">{row.createdBy || "-"}</span>
    ),
  },
];
