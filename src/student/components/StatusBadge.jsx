// frontend/src/student/components/StatusBadge.jsx

const statusColorMap = {
  // User Management
  Active: "text-green-800",
  Inactive: "text-red-500",

  // Request Management
  Pending: "text-blue-600",
  Accepted: "text-green-800",
  Rejected: "text-red-500",
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`
        ${statusColorMap[status] || "text-gray-500"}
        text-sm
        font-bold
        inline-block
        w-full
        text-center
        pr-10
      `}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
