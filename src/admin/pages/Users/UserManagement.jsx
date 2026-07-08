// frontend/src/admin/pages/Users/UserManagement.jsx
import { useState, useEffect } from "react";
import Button from "../../../components/Button";

import assets from "../../../assets/assets";
import Table from "../../components/table/Table";
import Modal from "../../components/Modal";
import UserFilterBar from "../../components/filter/FilterBar";
import PaginationMini from "../../components/PaginationMini";
import PageTitleRow from "../../components/PageTitleRow";
import ActionMenu from "../../components/ActionMenu";
import CreateUserForm from "../../components/CreateUserForm";
import CreateStaffForm from "../../components/CreateStaffForm";
import UserDetailsModal from "../../components/UserDetailsModal";
import { userColumns } from "./user.columns.jsx";
import { filterUsers } from "./user.filtersLogic";

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
  const s = String(value || "").trim();
  if (!s) return "-";
  // Return role as-is from DB — do NOT apply toTitleCase on ENUM values
  // (ADVISOR, HOD, PRINCIPAL, STUDENT should remain uppercase as stored)
  return s;
}

function buildFullName(firstName, lastName) {
  const first = String(firstName || "").trim();
  const last = String(lastName || "").trim();
  const full = `${first} ${last}`.trim();
  return full || "-";
}

const UserManagement = () => {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState("1");
  const [selectedIds, setSelectedIds] = useState([]);

  // 🔥 DATA STATE
  const [users, setUsers] = useState([]);

  // bulk action
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState(null);

  // modals
  const [openCreate, setOpenCreate] = useState(null); // null | "students" | "staff"
  const [modalMode, setModalMode] = useState(null); // "edit" | "info"
  const [selectedUser, setSelectedUser] = useState(null);

  const pageSize = 6;

  // 🔥 Fetch users using HTTP-Only Cookies (No localStorage)
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", {
        credentials: "include", // Required to send HTTP-only cookies
      });

      const data = await res.json();

      if (data.success) {
        // 🔥 Format data exactly as expected by the table
        const formatted = (data.data || []).map((u) => {
          const role = normalizeRole(
            u.userRole ?? u.role ?? u.user_role ?? u.user_role_name,
          );

          // Use faculty_id as primary identifier, fallback to userId
          const facultyId =
            u.faculty_id ?? u.facultyId ?? u.userId ?? u.user_id ?? u.id;
          const userId = facultyId ?? "-";

          const fullName = buildFullName(
            u.first_name ?? u.firstName ?? u.fname,
            u.last_name ?? u.lastName ?? u.lname,
          );

          const department = toTitleCase(
            u.department ?? u.department_name ?? u.dept,
          );
          // ✅ FIXED — preserve course value exactly as stored
          const course =
            u.course && u.course.trim() && u.course.trim() !== "-"
              ? u.course.trim()
              : "-";

          const rawBatch = u.batch ?? u.assigned_batch ?? u.batch_year;
          const batchYear = rawBatch ?? "-";
          const batchDisplay =
            rawBatch && String(rawBatch).toUpperCase() !== "N/A"
              ? String(rawBatch)
              : "-";

          const statusRaw = String(u.status ?? "")
            .trim()
            .toUpperCase();
          const status = statusRaw === "ACTIVE" ? "ACTIVE" : "INACTIVE";

          const createdAt = formatTimestamp(
            u.timestamp ?? u.created_at ?? u.createdAt,
          );

          // Created By — dynamically stored at insert time from admin session
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

            userRole: role,
          };
        });

        setUsers(formatted);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ---------------- FILTER ---------------- */
  const filteredData = filterUsers(users, filters);

  /* ---------------- COUNTS ---------------- */
  const totalUsers = filteredData.length;
  const activeUsers = filteredData.filter(
    (u) => String(u.status || "").toUpperCase() === "ACTIVE",
  ).length;
  const inactiveUsers = filteredData.filter(
    (u) => String(u.status || "").toUpperCase() === "INACTIVE",
  ).length;

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(filteredData.length / pageSize);

  /* ---------------- SORT SELECTED FIRST ---------------- */
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
    filteredData.slice((page - 1) * pageSize, page * pageSize),
  );

  /* ---------------- ROW ACTION MENU ---------------- */
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
        setSelectedUser(row);
        setModalMode(action.id); // "edit" | "info"
      }}
    />
  );

  return (
    <div className="space-y-2">
      <PageTitleRow
        title="User Management"
        onCreate={() => setOpenCreate("select")}
        stats={[
          {
            value: String(totalUsers).padStart(2, "0"),
            label: "Total User",
            color: "blue",
          },
          {
            value: String(activeUsers).padStart(2, "0"),
            label: "Active",
            color: "green",
          },
          {
            value: String(inactiveUsers).padStart(2, "0"),
            label: "Inactive",
            color: "red",
          },
        ]}
      />

      {/* CREATE TYPE SELECTION MODAL */}
      {openCreate === "select" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[500px] bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-6">
              What would you like to create?
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => setOpenCreate("students")}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Create Student Users
              </button>
              <button
                onClick={() => setOpenCreate("staff")}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                Create Staff Users
              </button>
            </div>
            <Button
              onClick={() => setOpenCreate(null)}
              variant="ghost"
              label="Cancel"
              className="w-full mt-3"
            />

          </div>
        </div>
      )}

      {/* CREATE STUDENT USERS */}
      {openCreate === "students" && (
        <CreateUserForm
          onClose={() => setOpenCreate(null)}
          refreshUsers={fetchUsers}
        />
      )}

      {/* CREATE STAFF USERS */}
      {openCreate === "staff" && (
        <CreateStaffForm
          onClose={() => setOpenCreate(null)}
          refreshUsers={fetchUsers}
        />
      )}

      {/* EDIT / INFO USER */}
      {modalMode && (
        <UserDetailsModal
          user={selectedUser}
          mode={modalMode}
          onClose={() => setModalMode(null)}
          onSaved={fetchUsers}
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
            columns={userColumns}
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
        onConfirm={() => {
          setUsers((prev) =>
            prev.map((user) =>
              selectedIds.includes(user.userId)
                ? {
                    ...user,
                    status:
                      bulkActionType === "Activate" ? "Active" : "Inactive",
                  }
                : user,
            ),
          );

          setConfirmOpen(false);
          setSelectedIds([]);
          setBulkActionType(null);
        }}
      >
        Do you want to {bulkActionType?.toLowerCase()} the selected users?
      </Modal>
    </div>
  );
};

export default UserManagement;
