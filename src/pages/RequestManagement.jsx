// frontend/src/pages/RequestManagement.jsx
import { useState } from "react";
import { DummyRequests } from "../assets/DummyData";
import assets from "../assets/assets";
import Table from "../components/table/Table";
import FilterBar from "../components/filter/FilterBar";
import PaginationMini from "../components/PaginationMini";
import PageTitleRow from "../components/PageTitleRow";
import ActionMenu from "../components/ActionMenu";
import CreateRequestModal from "../components/CreateRequestModal";
import RequestActionModal from "../components/RequestActionModal";
import { useAuth } from "../context/AuthContext";
import { requestColumns } from "../components/RequestManagement/columns";
import { filterRequests } from "../components/RequestManagement/filtersLogic";

const RequestManagement = () => {
  const { user } = useAuth();
  const role = user?.role;
  const isStudent = role === "STUDENT";

  const [filters, setFilters] = useState({});
  const [page, setPage] = useState("1");
  const [selectedIds, setSelectedIds] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);

  // Unified action modal state
  const [actionMode, setActionMode] = useState(null); // forward | accept | decline | edit | info | success | failed | delete
  const [activeRequest, setActiveRequest] = useState(null);

  const pageSize = 6;

  /* ---------- FILTER ---------- */
  const filteredData = filterRequests(DummyRequests, filters);

  /* ---------- COUNTS ---------- */
  const total = filteredData.length;
  const actionTaken = filteredData.filter((r) => r.status !== "Pending").length;
  const actionNeed = filteredData.filter((r) => r.status === "Pending").length;

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /* ---------- ROW ACTION MENU ---------- */
  const requestActions = isStudent
    ? [
        {
          id: "delete",
          label: "Delete",
          icon: assets.delete_icon,
        },
      ]
    : [
        { id: "forward", label: "Forward", icon: assets.forward_icon },
        { id: "accept", label: "Accept", icon: assets.accept_icon },
        { id: "decline", label: "Decline", icon: assets.decline_icon },
        { id: "edit", label: "Edit", icon: assets.edit_icon },
        { id: "info", label: "Info", icon: assets.info_icon },
      ];

  const actions = (row, index) => (
    <ActionMenu
      items={requestActions}
      variant={isStudent ? "student" : "default"}
      isLast={index === paginatedData.length - 1}
      isSecondLast={index === paginatedData.length - 2}
      onAction={(action) => {
        setActiveRequest(row);
        setActionMode(action.id);
      }}
    />
  );

  return (
    <div className="space-y-3">
      {/* PAGE HEADER */}
      <PageTitleRow
        title="Request Management"
        onCreate={isStudent ? undefined : () => setOpenCreate(true)}
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
            label: isStudent ? "Action Rejected" : "Action Need",
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
        checkboxVariant={isStudent ? "student" : "default"}
      />

      {/* CREATE REQUEST */}
      {openCreate && (
        <CreateRequestModal onClose={() => setOpenCreate(false)} />
      )}

      {/* ACTION MODAL (FORWARD / ACCEPT / DECLINE / EDIT / INFO / DELETE) */}
      {actionMode && (
        <RequestActionModal
          mode={actionMode}
          request={activeRequest}
          onClose={() => {
            setActionMode(null);
            setActiveRequest(null);
          }}
          onConfirm={(req) => {
            console.log(`Confirmed confirmation for request: ${req?.reqId}`);
            // Mock confirmation action
          }}
        />
      )}
    </div>
  );
};

export default RequestManagement;
