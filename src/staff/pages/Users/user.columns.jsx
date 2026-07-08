// frontend/src/staff/pages/Users/user.columns.jsx
import StatusBadge from "../../components/StatusBadge";

export const userColumns = [
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
