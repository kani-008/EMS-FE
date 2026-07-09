import { useState, useEffect } from "react";
import Button from "../../components/Button";
import assets from "../../assets/assets";
import Table from "../../components/table/Table";
import Modal from "../../components/Modal";
import UserFilterBar from "../../components/filter/FilterBar";
import PaginationMini from "../../components/PaginationMini";
import PageTitleRow from "../../components/PageTitleRow";
import ActionMenu from "../../components/ActionMenu";

// Centralized APIs
import { fetchAdminUsers } from "../../api/usersApi";
import { fetchAdvisorContext as fetchStaffAdvisorContext, fetchStaffStudents } from "../../api/staffApi";

// Role-specific config and logics
import { userColumns as adminColumns } from "./admin.user.columns";
import { filterUsers as adminFilter } from "./admin.user.filtersLogic";
import { userColumns as staffColumns } from "./staff.user.columns";
import { filterUsers as staffFilter } from "./staff.user.filtersLogic";

// Forms & Modals
import CreateUserForm from "../../components/CreateUserForm";
import EditUserDetails from "../../components/EditUserDetails"; // staff modal
import UserDetailsModal from "../../admin/components/UserDetailsModal"; // admin modal (stays admin-only)
import CreateStaffForm from "../../admin/components/CreateStaffForm"; // admin-only

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
  return s;
}

function buildFullName(firstName, lastName) {
  const first = String(firstName || "").trim();
  const last = String(lastName || "").trim();
  const full = `${first} ${last}`.trim();
  return full || "-";
}

const UserManagement = ({ role = "STAFF" }) => {
  const isAdmin = role === "ADMIN";

  const [filters, setFilters] = useState({});
  const [page, setPage] = useState("1");
  const [selectedIds, setSelectedIds] = useState([]);

  // DATA STATES
  const [users, setUsers] = useState([]);
  const [context, setContext] = useState({
    department_id: null,
    department_name: "",
    batch: "",
    course: "",
    current_year: null,
    derived_semester: null,
  });

  // Bulk action (admin-only)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState(null);

  // Modal states
  const [openCreate, setOpenCreate] = useState(null); // admin: null|"select"|"students"|"staff", staff: null|boolean
  const [modalMode, setModalMode] = useState(null); // "edit" | "info"
  const [selectedUser, setSelectedUser] = useState(null);

  const pageSize = 6;

  // 1. Fetch Advisor Context (Staff only)
  const fetchAdvisorContext = async () => {
    try {
      const data = await fetchStaffAdvisorContext();
      if (data.success && data.data) {
        setContext(data.data);
      }
    } catch (err) {
      console.error("Fetch advisor context error:", err);
    }
  };

  // 2. Fetch Users list (depends on Admin/Staff role)
  const fetchUsers = async () => {
    try {
      if (isAdmin) {
        const data = await fetchAdminUsers();
        if (data.success) {
          const formatted = (data.data || []).map((u) => {
            const roleVal = normalizeRole(
              u.userRole ?? u.role ?? u.user_role ?? u.user_role_name,
            );
            const facultyId = u.faculty_id ?? u.facultyId ?? u.userId ?? u.user_id ?? u.id;
            const userId = facultyId ?? "-";
            const fullName = buildFullName(
              u.first_name ?? u.firstName ?? u.fname,
              u.last_name ?? u.lastName ?? u.lname,
            );
            const department = toTitleCase(u.department ?? u.department_name ?? u.dept);
            const course = u.course && u.course.trim() && u.course.trim() !== "-" ? u.course.trim() : "-";
            const rawBatch = u.batch ?? u.assigned_batch ?? u.batch_year;
            const batchYear = rawBatch ?? "-";
            const batchDisplay = rawBatch && String(rawBatch).toUpperCase() !== "N/A" ? String(rawBatch) : "-";
            const statusRaw = String(u.status ?? "").trim().toUpperCase();
            const status = statusRaw === "ACTIVE" ? "ACTIVE" : "INACTIVE";
            const createdAt = formatTimestamp(u.timestamp ?? u.created_at ?? u.createdAt);
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
      } else {
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
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      fetchAdvisorContext();
    }
    fetchUsers();
  }, [role]);

  // Determine filtering logic, columns, and custom layout attributes based on role
  const activeColumns = isAdmin ? adminColumns : staffColumns;
  const filterFn = isAdmin ? adminFilter : staffFilter;

  // Additional batch values for staff filtering
  const uniqueBatches = isAdmin ? [] : [...new Set(users.map((u) => u.batch))].filter(Boolean).sort();

  // Filter Logic
  const filteredData = filterFn(users, filters).filter((u) => {
    if (!isAdmin && filters.batch?.length && !filters.batch.includes(u.batch)) {
      return false;
    }
    return true;
  });

  const totalUsers = filteredData.length;
  const activeUsers = filteredData.filter((u) =>
    String(u.status || "").toUpperCase() === "ACTIVE"
  ).length;
  const inactiveUsers = filteredData.filter((u) =>
    String(u.status || "").toUpperCase() === "INACTIVE"
  ).length;

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
          setSelectedUser(row);
        } else {
          // Map student fields for staff EditUserDetails form expectation
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
          setSelectedUser(mappedUser);
        }
        setModalMode(action.id);
      }}
    />
  );

  return (
    <div className="space-y-2">
      <PageTitleRow
        title="User Management"
        onCreate={() => {
          if (isAdmin) setOpenCreate("select");
          else setOpenCreate(true);
        }}
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

      {/* CREATE TYPE SELECTION MODAL (Admin only) */}
      {isAdmin && openCreate === "select" && (
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

      {/* CREATE STUDENT/STAFF FORMS */}
      {isAdmin ? (
        <>
          {openCreate === "students" && (
            <CreateUserForm
              onClose={() => setOpenCreate(null)}
              refreshUsers={fetchUsers}
            />
          )}
          {openCreate === "staff" && (
            <CreateStaffForm
              onClose={() => setOpenCreate(null)}
              refreshUsers={fetchUsers}
            />
          )}
        </>
      ) : (
        <>
          {openCreate && (
            <CreateUserForm
              onClose={() => setOpenCreate(false)}
              refreshUsers={fetchUsers}
              advisorContext={context}
            />
          )}
        </>
      )}

      {/* EDIT / INFO DETAILS MODALS */}
      {modalMode && (
        isAdmin ? (
          <UserDetailsModal
            user={selectedUser}
            mode={modalMode}
            onClose={() => setModalMode(null)}
            onSaved={fetchUsers}
          />
        ) : (
          <EditUserDetails
            user={selectedUser}
            mode={modalMode}
            onClose={() => setModalMode(null)}
            onSaved={fetchUsers}
          />
        )
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
            onBulkAction={isAdmin ? (type) => {
              setBulkActionType(type);
              setConfirmOpen(true);
            } : () => {}}
            batches={isAdmin ? undefined : uniqueBatches}
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
            columns={activeColumns}
            data={paginatedData}
            selectable
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            getRowId={(row) => row.userId}
            actions={actions}
            // Pass max height vertical scroll configuration for staff role only
            maxHeight={isAdmin ? null : "max-h-[calc(100vh-220px)] overflow-y-auto"}
          />
        </>
      )}

      {/* CONFIRM MODAL (Admin only) */}
      {isAdmin && (
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
      )}
    </div>
  );
};

export default UserManagement;
