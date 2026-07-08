// frontend/src/student/pages/Requests/RequestManagement.jsx
import { useState } from "react";
import { DummyRequests } from "../../../assets/DummyData";
import assets from "../../../assets/assets";
import Table from "../../components/table/Table";
import FilterBar from "../../components/filter/FilterBar";
import PaginationMini from "../../components/PaginationMini";
import PageTitleRow from "../../components/PageTitleRow";
import ActionMenu from "../../components/ActionMenu";
import { requestColumns } from "./request.columns";
import { filterRequests } from "./request.filtersLogice";
import CreateRequestModal from "../../components/CreateRequestModal";
import RequestActionModal from "../../components/RequestActionModal";

const RequestManagement = () => {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState("1");
  const [selectedIds, setSelectedIds] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);

  // 🔥 unified action modal state
  const [actionMode, setActionMode] = useState(null); // forward | accept | decline | edit | info | success | failed
  const [activeRequest, setActiveRequest] = useState(null);

  const pageSize = 6;

  /* ---------- FILTER ---------- */
  const filteredData = filterRequests(DummyRequests, filters);

  /* ---------- COUNTS ---------- */
  const total = filteredData.length;
   const actionTaken = filteredData.filter(
    (r) => r.status !== "Pending"
  ).length;
  const actionNeed = filteredData.filter(
    (r) => r.status === "Pending"
  ).length;

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /* ---------- ROW ACTION MENU ---------- */
const requestActions = [
  {
    id: "delete",
    label: "Delete",
    icon: assets.delete_icon,
  },
];

const actions = (row, index) => (
  <ActionMenu
    items={requestActions}
    isLast={index === paginatedData.length - 1}
    isSecondLast={index === paginatedData.length - 2}
    onAction={(action) => {
      if (action.id === "delete") {
        setActiveRequest(row);
        setActionMode("delete");
      }
    }}
  />
);


  return (
    <div className="space-y-3">
      {/* PAGE HEADER */}
      <PageTitleRow
        title="Request Management"
        // onCreate={() => setOpenCreate(true)}
        stats={[
          {
            value: String(total).padStart(2, "0"),
            label: "Total Request",
            color: "blue",
          },
          {
            value: String(actionTaken).padStart(2, "0"),
            label: "Action Taken",
            color: "green",
          },
          {
            value: String(actionNeed).padStart(2, "0"),
            label: "Action Rejected",
            color: "red",
          },
        ]}
      />

      {/* FILTER BAR */}
     <FilterBar
  type="request"
  filters={filters}
  setFilters={setFilters}
  selectedIds={selectedIds}
  onBulkAction={(action) => {
    if (action === "delete") {
      setActionMode("delete");
    }
  }}
  onReset={() => {
    setFilters({});
    setSelectedIds([]);
    setPage("1");
  }}
>
  <PaginationMini
    pageInput={page}
    totalPages={totalPages}
    setPageInput={setPage}
  />
</FilterBar>


      {/* TABLE */}
      <Table
        columns={requestColumns}
        data={paginatedData}
        selectable
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        getRowId={(row) => row.reqId}
        actions={actions}
      />

      {/* CREATE REQUEST */}
      {openCreate && (
        <CreateRequestModal onClose={() => setOpenCreate(false)} />
      )}

      {/* ACTION MODAL (FORWARD / ACCEPT / DECLINE / EDIT / INFO) */}
      

      </div>
  );
};

export default RequestManagement;
