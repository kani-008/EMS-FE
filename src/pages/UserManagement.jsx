// frontend/src/pages/UserManagement.jsx
import { useState, useEffect } from "react";
import assets from "../assets/assets";
import Table from "../components/table/Table";
import Modal from "../components/Modal";
import UserFilterBar from "../components/filter/FilterBar";
import PaginationMini from "../components/PaginationMini";
import PageTitleRow from "../components/PageTitleRow";
import ActionMenu from "../components/ActionMenu";
import CreateStaffForm from "../components/CreateStaffForm";
import CreateUserForm from "../components/CreateUserForm";
import UserDetailsModalAdmin from "../components/UserDetailsModal";
import EditUserDetailsStaff from "../components/EditUserDetails";
import { useAuth } from "../components/AuthContext";
import { useToast } from "../components/Toast";
import { adminUserColumns, staffUserColumns } from "../components/UserManagement/columns";
import API from "../ApiCall/Api";

// Helper functions for Admin
function toTitleCase(value) {
  const s = String(value || "").trim();
  if (!s) return "-";
  if (/^[A-Z0-9]{2,6}$/.test(s)) return s; // keep acronyms like CSE/ECE
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function formatTimestamp(value) {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return "-";

  const dd = String(d.getDate()).padStart(2, "0");
  const mmm = d.toLocaleString("en-US", { month: "short" });
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${dd} ${mmm} ${yyyy}, ${hh}:${mm}`;
}

function normalizeRole(value) {
  return String(value || "").trim();
}

function buildFullName(firstName, lastName) {
  const first = String(firstName || "").trim();
  const last = String(lastName || "").trim();
  const full = `${first} ${last}`.trim();
  return full || "-";
}

const UserManagement = () => {
  const { user } = useAuth();
  const toast = useToast();
  const role = user?.role;
  const isAdmin = role === "ADMIN";
  const isAdvisor = role === "ADVISOR";

  const [filters, setFilters] = useState({});
  const [page, setPage] = useState("1");
  const [selectedIds, setSelectedIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const pageSize = 6;

  // ──────────────── COMMON BULK ACTION METHODS ────────────────
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState(null);

  const handleBulkStatusChange = async () => {
    try {
      const targetStatus = bulkActionType === "Activate" ? "ACTIVE" : "INACTIVE";
      const res = await API.patch("/users/status", {
        userIds: selectedIds,
        status: targetStatus,
      });
      if (res.data.success) {
        toast.success("Successfully updated status for selected users.");
        setSelectedIds([]);
        if (isAdmin) {
          fetchUsersAdmin(filters);
        } else {
          fetchUsersStaff(filters);
        }
      } else {
        toast.error("Failed to update status: " + res.data.message);
      }
    } catch (err) {
      toast.error("Failed to update status: " + (err.response?.data?.message || err.message));
    } finally {
      setConfirmOpen(false);
      setBulkActionType(null);
    }
  };

  // ──────────────── ADMIN STATE & METHODS ────────────────
  const [openCreateAdmin, setOpenCreateAdmin] = useState(null); // null | "staff"
  const [modalModeAdmin, setModalModeAdmin] = useState(null); // "edit" | "info"
  const [selectedUserAdmin, setSelectedUserAdmin] = useState(null);

  const fetchUsersAdmin = async (currentFilters) => {
    setFetchError("");
    try {
      const res = await API.get("/users", { params: currentFilters });
      if (res.data.success) {
        setStats({
          total: res.data.total ?? 0,
          active: res.data.active ?? 0,
          inactive: res.data.inactive ?? 0
        });
        const formatted = (res.data.data || []).map((u) => {
          const roleVal = normalizeRole(
            u.userRole ?? u.role ?? u.user_role ?? u.user_role_name
          );
          const facultyId = u.faculty_id ?? u.facultyId ?? u.userId ?? u.user_id ?? u.id;
          const userId = facultyId ?? "-";
          const fullName = buildFullName(
            u.first_name ?? u.firstName ?? u.fname,
            u.last_name ?? u.lastName ?? u.lname
          );
          const department = toTitleCase(
            u.department ?? u.department_name ?? u.dept
          );
          const course = u.course && u.course.trim() && u.course.trim() !== "-"
            ? u.course.trim()
            : "-";
          const rawBatch = u.batch ?? u.assigned_batch ?? u.batch_year;
          const batchYear = rawBatch ?? "-";
          const batchDisplay = rawBatch && String(rawBatch).toUpperCase() !== "N/A"
            ? String(rawBatch)
            : "-";
          const statusRaw = String(u.status ?? "").trim().toUpperCase();
          const status = statusRaw === "ACTIVE" ? "ACTIVE" : "INACTIVE";
          const createdAt = formatTimestamp(
            u.timestamp ?? u.created_at ?? u.createdAt
          );
          const createdBy = u.createdBy ?? u.created_by ?? u.last_updated_by ?? null;

          return {
            ...u,
            userId: String(userId || "-"),
            fullName,
            department,
            course,
            batchYear,
            batchDisplay,
            status,
            createdAt,
            createdBy,
            current_year: u.current_year ?? u.currentYear ?? u.year ?? null,
            userRole: roleVal,
          };
        });
        setUsers(formatted);
      }
    } catch (err) {
      console.error("Fetch users admin error:", err);
      setFetchError(err.response?.data?.message || err.message || "Failed to load data");
    }
  };

  // ──────────────── STAFF STATE & METHODS ────────────────
  const [contextStaff, setContextStaff] = useState({
    department_id: null,
    department_name: "",
    batch: "",
    course: "",
    current_year: null,
    derived_semester: null,
  });
  const [openCreateStaff, setOpenCreateStaff] = useState(false);
  const [modalModeStaff, setModalModeStaff] = useState(null); // "edit" | "info"
  const [selectedUserStaff, setSelectedUserStaff] = useState(null);

  const fetchAdvisorContextStaff = async () => {
    setFetchError("");
    try {
      const res = await API.get("/staff/advisor-context");
      if (res.data.success && res.data.data) {
        setContextStaff(res.data.data);
      }
    } catch (err) {
      console.error("Fetch advisor context error:", err);
      setFetchError(err.response?.data?.message || err.message || "Failed to load advisor context");
    }
  };

  const fetchUsersStaff = async (currentFilters) => {
    setFetchError("");
    try {
      const res = await API.get("/students", { params: currentFilters });
      if (res.data.success && res.data.data) {
        setStats({
          total: res.data.total ?? 0,
          active: res.data.active ?? 0,
          inactive: res.data.inactive ?? 0
        });
        const formatted = res.data.data.map((u) => ({
          userId:          u.roll_no || "-",
          userName:        u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.user_name,
          course:          u.course || "-",
          department:      u.department || "-",
          year:            u.current_year || "-",
          registrationNo:  u.registration_no || "-",
          batch:           u.batch || "-",
          timestamp:       u.created_on ? new Date(u.created_on).toLocaleString() : "-",
          status:          u.status === "ACTIVE" || u.status === "Active" ? "Active" : "Inactive",
          userRole:        "Student",
          firstName:       u.first_name || "",
          lastName:        u.last_name || "",
          gender:          u.gender || "",
          semester:        u.semester || "-",
        }));
        setUsers(formatted);
      }
    } catch (err) {
      console.error("Fetch students staff error:", err);
      setFetchError(err.response?.data?.message || err.message || "Failed to load students");
    }
  };

  // ──────────────── MOUNT & DEPENDENCY FETCHING ────────────────
  useEffect(() => {
    if (!isAdmin) {
      fetchAdvisorContextStaff();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsersAdmin(filters);
    } else {
      fetchUsersStaff(filters);
    }
    setPage("1");
  }, [isAdmin, filters]);

  // ──────────────── FILTERING & PAGINATION ────────────────
  const uniqueBatchesStaff = [...new Set(users.map((u) => u.batch))].filter(Boolean).sort();
  
  const filteredData = users; // Server-side filtered

  const totalUsers = stats.total;
  const activeUsers = stats.active;
  const inactiveUsers = stats.inactive;

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const sortSelectedFirst = (data) => {
    return [...data].sort((a, b) => {
      const aSelected = selectedIds.includes(a.userId);
      const bSelected = selectedIds.includes(b.userId);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });
  };

  const paginatedData = sortSelectedFirst(
    filteredData.slice((page - 1) * pageSize, page * pageSize)
  );

  // ──────────────── ACTIONS MENU ────────────────
  const actions = (row, index) => {
    const items = [
      { id: "edit", label: "Edit", icon: assets.edit_icon },
      { id: "info", label: "Info", icon: assets.info_icon },
    ];

    return (
      <ActionMenu
        items={items}
        isLast={index === paginatedData.length - 1}
        isSecondLast={index === paginatedData.length - 2}
        onAction={async (action) => {
          if (isAdmin) {
            setSelectedUserAdmin(row);
            setModalModeAdmin(action.id);
          } else {
            const mappedUser = {
              userId: row.userId,
              userName: row.userName,
              first_name: row.firstName,
              last_name: row.lastName,
              firstName: row.firstName,
              lastName: row.lastName,
              gender: row.gender,
              course: row.course,
              department: row.department,
              department_name: row.department,
              current_year: row.year,
              registration_no: row.registrationNo,
              registrationNo: row.registrationNo,
              batch: row.batch,
              semester: row.semester,
              status: row.status,
              userRole: row.userRole,
              timestamp: row.timestamp,
            };
            setSelectedUserStaff(mappedUser);
            setModalModeStaff(action.id);
          }
        }}
      />
    );
  };

  // ──────────────── RENDERING ────────────────
  // Guard access to only Admin and Advisor (BUG 2)
  if (!isAdmin && !isAdvisor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Restricted</h2>
        <p className="text-slate-600 max-w-md">
          This page is only accessible to Academic Advisors and Administrators.
        </p>
      </div>
    );
  }

  if (isAdmin) {
    // ──────────────── ADMIN USER MANAGEMENT LAYOUT ────────────────
    return (
      <div className="space-y-2">
        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {fetchError}
          </div>
        )}
        <PageTitleRow
          title="User Management"
          onCreate={() => setOpenCreateAdmin("staff")}
          stats={[
            { value: String(totalUsers).padStart(2, "0"), label: "Total User", color: "blue" },
            { value: String(activeUsers).padStart(2, "0"), label: "Active", color: "green" },
            { value: String(inactiveUsers).padStart(2, "0"), label: "Inactive", color: "red" },
          ]}
        />

        {/* CREATE STAFF USERS */}
        {openCreateAdmin === "staff" && (
          <CreateStaffForm
            onClose={() => setOpenCreateAdmin(null)}
            refreshUsers={() => fetchUsersAdmin(filters)}
          />
        )}

        {/* EDIT / INFO USER */}
        {modalModeAdmin && (
          <UserDetailsModalAdmin
            user={selectedUserAdmin}
            mode={modalModeAdmin}
            onClose={() => setModalModeAdmin(null)}
            onSaved={() => fetchUsersAdmin(filters)}
          />
        )}

        {/* CONDITIONAL UI */}
        {users.length === 0 ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <p className="text-gray-500 text-lg">No users created yet</p>
          </div>
        ) : (
          <>
            {/* FILTER BAR */}
            <UserFilterBar
              type="user"
              filters={filters}
              setFilters={setFilters}
              selectedIds={selectedIds}
              onBulkAction={(type) => {
                setBulkActionType(type);
                setConfirmOpen(true);
              }}
              onReset={() => {
                setFilters({});
                setPage("1");
                setSelectedIds([]);
              }}
            >
              <PaginationMini
                pageInput={page}
                totalPages={totalPages}
                setPageInput={setPage}
              />
            </UserFilterBar>

            {/* TABLE */}
            <Table
              columns={adminUserColumns}
              data={paginatedData}
              selectable
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              actions={actions}
            />
          </>
        )}

        {/* CONFIRM MODAL */}
        <Modal
          isOpen={confirmOpen}
          title="Confirmation"
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleBulkStatusChange}
        >
          Do you want to {bulkActionType?.toLowerCase()} the selected users?
        </Modal>
      </div>
    );
  }

  // ──────────────── STAFF USER MANAGEMENT LAYOUT ────────────────
  return (
    <div className="space-y-2">
      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {fetchError}
        </div>
      )}
      <PageTitleRow
        title="User Management"
        onCreate={() => setOpenCreateStaff(true)}
        stats={[
          { value: String(totalUsers).padStart(2, "0"), label: "Total User", color: "blue" },
          { value: String(activeUsers).padStart(2, "0"), label: "Active", color: "green" },
          { value: String(inactiveUsers).padStart(2, "0"), label: "Inactive", color: "red" },
        ]}
      />

      {/* CREATE STUDENT MODAL */}
      {openCreateStaff && (
        <CreateUserForm
          onClose={() => setOpenCreateStaff(false)}
          refreshUsers={() => fetchUsersStaff(filters)}
          advisorContext={contextStaff}
        />
      )}

      {/* EDIT / INFO DETAILS MODAL */}
      {modalModeStaff && (
        <EditUserDetailsStaff
          user={selectedUserStaff}
          mode={modalModeStaff}
          onClose={() => setModalModeStaff(null)}
          onSaved={() => fetchUsersStaff(filters)}
        />
      )}

      {/* CONDITIONAL TABLE CONTENT */}
      {users.length === 0 ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-gray-500 text-lg">No users created yet</p>
        </div>
      ) : (
        <>
          {/* FILTER BAR */}
          <UserFilterBar
            type="user"
            filters={filters}
            setFilters={setFilters}
            selectedIds={selectedIds}
            onBulkAction={(type) => {
              setBulkActionType(type);
              setConfirmOpen(true);
            }}
            batches={uniqueBatchesStaff}
            onReset={() => {
              setFilters({});
              setPage("1");
              setSelectedIds([]);
            }}
          >
            <PaginationMini
              pageInput={page}
              totalPages={totalPages}
              setPageInput={setPage}
            />
          </UserFilterBar>

          {/* DATA TABLE */}
          <Table
            columns={staffUserColumns}
            data={paginatedData}
            selectable
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            getRowId={(row) => row.userId}
            actions={actions}
            scrollable
          />
        </>
      )}

      {/* CONFIRM MODAL */}
      <Modal
        isOpen={confirmOpen}
        title="Confirmation"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleBulkStatusChange}
      >
        Do you want to {bulkActionType?.toLowerCase()} the selected users?
      </Modal>
    </div>
  );
};

export default UserManagement;