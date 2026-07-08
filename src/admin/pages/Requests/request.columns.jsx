// frontend/src/staff/pages/Requests/request.columns.jsx
import StatusBadge from "../../components/StatusBadge";
import RequestCategoryBadge from "../../components/RequestCategoryBadge";

export const requestColumns = [
  { header: "REQUEST ID", accessor: "reqId", width: "w-24" },
  { header: "REQUEST FROM", accessor: "requestFrom", width: "w-36" },
  { header: "COURSE", accessor: "course", width: "w-14" },
  { header: "DEPARTMENT", accessor: "department", width: "w-24" },
  { header: "YEAR", accessor: "year", width: "w-12" },
  { header: "REQUEST TO", accessor: "requestTo", width: "w-36" },

  {
    header: "TIMESTAMP",
    width: "w-48",
    render: (row) =>
      new Date(row.timestamp).toLocaleString("en-GB"),
  },

  {
    header: "STATUS",
    accessor: "status",
    width: "w-20",
    render: (row) => <StatusBadge status={row.status} />,
  },

  {
    header: "REQUEST CATEGORY",
    width: "w-40",
    render: (row) => (
      <RequestCategoryBadge category={row.requestCategory} />
    ),
  },
];
