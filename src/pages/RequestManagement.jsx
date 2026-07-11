// frontend/src/pages/RequestManagement.jsx
import { useState, useEffect, useCallback } from "react";
import API from "../ApiCall/Api.jsx";
import assets from "../assets/assets";
import Table from "../components/table/Table";
import FilterBar from "../components/filter/FilterBar";
import PaginationMini from "../components/PaginationMini";
import PageTitleRow from "../components/PageTitleRow";
import ActionMenu from "../components/ActionMenu";
import CreateRequestModal from "../components/CreateRequestModal";
import RequestActionModal from "../components/RequestActionModal";
import { useAuth } from "../components/AuthContext";
import { requestColumns } from "../components/RequestManagement/columns";
import { filterRequests } from "../components/RequestManagement/filtersLogic";

const RequestManagement = () => {
  const { user } = useAuth();
  const role = user?.role;
  const isStudent = role === "STUDENT";

  const [requests, setRequests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState("");

  const [filters, setFilters]         = useState({});
  const [page, setPage]               = useState("1");
  const [selectedIds, setSelectedIds] = useState([]);
  const [openCreate, setOpenCreate]   = useState(false);

  // Unified action modal state
  const [actionMode, setActionMode]       = useState(null); // forward|accept|decline|edit|info|delete
  const [activeRequest, setActiveRequest] = useState(null);

  const pageSize = 6;

  /* ─── Fetch from API ─────────────────────────────────────────────── */
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await API.get("/requests");
      if (res.data.success) {
        setRequests(res.data.data || []);
      }
    } catch (err) {
      setFetchError(
        err.response?.data?.message || "Failed to load requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  /* ─── Filter + Pagination ────────────────────────────────────────── */
  const filteredData  = filterRequests(requests, filters);
  const total         = filteredData.length;
  const actionTaken   = filteredData.filter((r) => r.status !== "Pending").length;
  const actionNeed    = filteredData.filter((r) => r.status === "Pending").length;
  const totalPages    = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (parseInt(page, 10) - 1) * pageSize,
    parseInt(page, 10) * pageSize
  );

  /* ─── Handle confirmed action from modal ────────────────────────── */
  const handleActionConfirm = async (req, extra) => {
    if (!req?.reqId) return;

    if (actionMode === "delete") {
      try {
        await API.delete(`/requests/${req.reqId}`);
        await fetchRequests();
      } catch (err) {
        console.error("Delete failed:", err.response?.data?.message || err.message);
      }
    } else if (["accept", "decline", "forward"].includes(actionMode)) {
      try {
        await API.patch(`/requests/${req.reqId}/status`, {
          action:      actionMode,
          forwardedTo: extra?.forwardedTo || null,
        });
        await fetchRequests();
      } catch (err) {
        console.error("Status update failed:", err.response?.data?.message || err.message);
      }
    }
  };

  /* ─── Row action menu ────────────────────────────────────────────── */
  const requestActions = isStudent
    ? [{ id: "delete", label: "Delete", icon: assets.delete_icon }]
    : [
        { id: "forward", label: "Forward", icon: assets.forward_icon },
        { id: "accept",  label: "Accept",  icon: assets.accept_icon  },
        { id: "decline", label: "Decline", icon: assets.decline_icon },
        { id: "edit",    label: "Edit",    icon: assets.edit_icon    },
        { id: "info",    label: "Info",    icon: assets.info_icon    },
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

  /* ─── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="space-y-3">
      {/* PAGE HEADER */}
      <PageTitleRow
        title="Request Management"
        onCreate={isStudent ? undefined : () => setOpenCreate(true)}
        stats={[
          { value: String(total).padStart(2, "0"),       label: "Total Request",  color: "blue"  },
          { value: String(actionTaken).padStart(2, "0"), label: "Action Taken",   color: "green" },
          { value: String(actionNeed).padStart(2, "0"),  label: isStudent ? "Action Rejected" : "Action Need", color: "red" },
        ]}
      />

      {/* FILTER BAR */}
      <FilterBar
        type="request"
        filters={filters}
        setFilters={setFilters}
        selectedIds={selectedIds}
        onBulkAction={(action) => {
          if (action === "delete") setActionMode("delete");
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

      {/* ERROR BANNER */}
      {fetchError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {fetchError}
        </div>
      )}

      {/* LOADING SKELETON */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <span className="ml-3 text-sm text-slate-500">Loading requests…</span>
        </div>
      )}

      {/* TABLE */}
      {!loading && (
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
      )}

      {/* CREATE REQUEST MODAL */}
      {openCreate && (
        <CreateRequestModal
          onClose={() => setOpenCreate(false)}
          onSuccess={() => {
            setOpenCreate(false);
            fetchRequests();
          }}
        />
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
          onConfirm={handleActionConfirm}
        />
      )}
    </div>
  );
};

export default RequestManagement;
