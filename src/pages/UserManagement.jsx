// frontend/src/pages/UserManagement.jsx
import { useState, useEffect } from "react";
import Button from "../components/Button";
import assets from "../assets/assets";
import Table from "../components/table/Table";
import Modal from "../components/Modal";
import UserFilterBar from "../components/filter/FilterBar";
import PaginationMini from "../components/PaginationMini";
import PageTitleRow from "../components/PageTitleRow";
import ActionMenu from "../components/ActionMenu";
import CreateUserForm from "../components/CreateUserForm";
import CreateStaffForm from "../components/CreateStaffForm";
import UserDetailsModalAdmin from "../components/UserDetailsModal";
import EditUserDetailsStaff from "../components/EditUserDetails";
import { useAuth } from "../context/AuthContext";
import { adminUserColumns, staffUserColumns } from "../components/UserManagement/columns";
import { filterUsers } from "../components/UserManagement/filtersLogic";
import {
  fetchAdminUsers,
  fetchAdvisorContext,
  fetchStaffStudents
} from "../apiCall/Api";

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
  const role = user?.role;
  const isAdmin = role === "ADMIN";

  const [filters, setFilters] = useState({});
  const [page, setPage] = useState("1");
  const [selectedIds, setSelectedIds] = useState([]);
  const [users, setUsers] = useState([]);

  const pageSize = 6;

  // ──────────────── ADMIN STATE & METHODS ────────────────
  const [confirmOpenAdmin, setConfirmOpenAdmin] = useState(false);
  const [bulkActionTypeAdmin, setBulkActionTypeAdmin] = useState(null);
  const [openCreateAdmin, setOpenCreateAdmin] = useState(null); // null | "students" | "staff" | "select"
  const [modalModeAdmin, setModalModeAdmin] = useState(null); // "edit" | "info"
  const [selectedUserAdmin, setSelectedUserAdmin] = useState(null);

  const fetchUsersAdmin = async () => {
    try {
      const data = await fetchAdminUsers();
      if (data.success) {
        const formatted = (data.data || []).map((u) => {
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
    try {
      const data = await fetchAdvisorContext();
      if (data.success && data.data) {
        setContextStaff(data.data);
      }
    } catch (err) {
      console.error("Fetch advisor context error:", err);
    }
  };

  const fetchUsersStaff = async () => {
    try {
      const data = await fetchStaffStudents();
      if (data.success && data.data) {
        const formatted = data.data.map((u) => ({
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
    }
  };

  // ──────────────── MOUNT FETCHING ────────────────
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isAdmin) {
      fetchUsersAdmin();
    } else {
      fetchAdvisorContextStaff();
      fetchUsersStaff();
    }
  }, [isAdmin]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // ──────────────── FILTERING & PAGINATION ────────────────
  const uniqueBatchesStaff = [...new Set(users.map((u) => u.batch))].filter(Boolean).sort();
  
  const filteredData = filterUsers(users, filters).filter((u) => {
    if (!isAdmin && filters.batch?.length && !filters.batch.includes(u.batch)) {
      return false;
    }
    return true;
  });

  const totalUsers = filteredData.length;
  const activeUsers = filteredData.filter((u) => {
    const s = String(u.status || "").toUpperCase();
    return s === "ACTIVE";
  }).length;
  const inactiveUsers = filteredData.filter((u) => {
    const s = String(u.status || "").toUpperCase();
    return s === "INACTIVE" || s === "UNVERIFIED";
  }).length;

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
  const userActions = [
    { id: "edit", label: "Edit", icon: assets.edit_icon },
    { id: "info", label: "Info", icon: assets.info_icon },
  ];

  const actions = (row, index) => (
    <ActionMenu
      items={userActions}
      isLast={index === paginatedData.length - 1}
      isSecondLast={index === paginatedData.length - 2}
      onAction={(action) => {
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

  // ──────────────── RENDERING ────────────────
  if (isAdmin) {
    // ──────────────── ADMIN USER MANAGEMENT LAYOUT ────────────────
    return (
      <div className="space-y-2">
        <PageTitleRow
          title="User Management"
          onCreate={() => setOpenCreateAdmin("select")}
          stats={[
            { value: String(totalUsers).padStart(2, "0"), label: "Total User", color: "blue" },
            { value: String(activeUsers).padStart(2, "0"), label: "Active", color: "green" },
            { value: String(inactiveUsers).padStart(2, "0"), label: "Inactive", color: "red" },
          ]}
        />

        {/* CREATE TYPE SELECTION MODAL */}
        {openCreateAdmin === "select" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[500px] bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-6">
                What would you like to create?
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setOpenCreateAdmin("students")}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Create Student Users
                </button>
                <button
                  onClick={() => setOpenCreateAdmin("staff")}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                >
                  Create Staff Users
                </button>
              </div>
              <Button
                onClick={() => setOpenCreateAdmin(null)}
                variant="ghost"
                label="Cancel"
                className="w-full mt-3"
              />
            </div>
          </div>
        )}

        {/* CREATE STUDENT USERS */}
        {openCreateAdmin === "students" && (
          <CreateUserForm
            onClose={() => setOpenCreateAdmin(null)}
            refreshUsers={fetchUsersAdmin}
          />
        )}

        {/* CREATE STAFF USERS */}
        {openCreateAdmin === "staff" && (
          <CreateStaffForm
            onClose={() => setOpenCreateAdmin(null)}
            refreshUsers={fetchUsersAdmin}
          />
        )}

        {/* EDIT / INFO USER */}
        {modalModeAdmin && (
          <UserDetailsModalAdmin
            user={selectedUserAdmin}
            mode={modalModeAdmin}
            onClose={() => setModalModeAdmin(null)}
            onSaved={fetchUsersAdmin}
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
                setBulkActionTypeAdmin(type);
                setConfirmOpenAdmin(true);
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
          isOpen={confirmOpenAdmin}
          title="Confirmation"
          onClose={() => setConfirmOpenAdmin(false)}
          onConfirm={() => {
            setUsers((prev) =>
              prev.map((userObj) =>
                selectedIds.includes(userObj.userId)
                  ? {
                      ...userObj,
                      status: bulkActionTypeAdmin === "Activate" ? "ACTIVE" : "INACTIVE",
                    }
                  : userObj
              )
            );
            setConfirmOpenAdmin(false);
            setSelectedIds([]);
            setBulkActionTypeAdmin(null);
          }}
        >
          Do you want to {bulkActionTypeAdmin?.toLowerCase()} the selected users?
        </Modal>
      </div>
    );
  }

  // ──────────────── STAFF USER MANAGEMENT LAYOUT ────────────────
  return (
    <div className="space-y-2">
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
          refreshUsers={fetchUsersStaff}
          advisorContext={contextStaff}
        />
      )}

      {/* EDIT / INFO DETAILS MODAL */}
      {modalModeStaff && (
        <EditUserDetailsStaff
          user={selectedUserStaff}
          mode={modalModeStaff}
          onClose={() => setModalModeStaff(null)}
          onSaved={fetchUsersStaff}
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
            onBulkAction={() => {}}
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
    </div>
  );
};

export default UserManagement;
