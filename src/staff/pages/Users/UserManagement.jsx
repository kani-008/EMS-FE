// frontend/src/staff/pages/Users/UserManagement.jsx
import { useState, useEffect } from "react";
import assets from "../../../assets/assets";
import Table from "../../components/table/Table";
import Modal from "../../components/Modal";
import UserFilterBar from "../../components/filter/FilterBar";
import PaginationMini from "../../components/PaginationMini";
import PageTitleRow from "../../components/PageTitleRow";
import ActionMenu from "../../components/ActionMenu";
import UserDetailsModal from "../../components/EditUserDetails.jsx";
import CreateUserForm from "../../components/CreateUserForm";
import { userColumns } from "./user.columns.jsx";
import { filterUsers } from "./user.filtersLogic";

const UserManagement = () => {
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

  // MODAL STATES
  const [openCreate, setOpenCreate] = useState(false);
  const [modalMode, setModalMode] = useState(null); // "edit" | "info"
  const [selectedUser, setSelectedUser] = useState(null);

  const pageSize = 6;

  // 1. Fetch Advisor Context
  const fetchAdvisorContext = async () => {
    try {
      const res = await fetch("/api/staff/advisor-context", { credentials: "include" });
      const data = await res.json();
      if (data.success && data.data) {
        setContext(data.data);
      }
    } catch (err) {
      console.error("Fetch advisor context error:", err);
    }
  };

  // 2. Fetch Students
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/staff/students", { credentials: "include" });
      const data = await res.json();
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
      console.error("Fetch students error:", err);
    }
  };

  useEffect(() => {
    fetchAdvisorContext();
    fetchUsers();
  }, []);

  const uniqueBatches = [...new Set(users.map((u) => u.batch))].filter(Boolean).sort();

  // Filter Logic
  const filteredData = filterUsers(users, filters).filter((u) => {
    if (filters.batch?.length && !filters.batch.includes(u.batch)) {
      return false;
    }
    return true;
  });
  const totalUsers = filteredData.length;
  const activeUsers = filteredData.filter((u) => u.status === "Active").length;
  const inactiveUsers = filteredData.filter((u) => u.status === "Inactive").length;

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
        setModalMode(action.id);
      }}
    />
  );



  return (
    <div className="space-y-2">
      <PageTitleRow
        title="User Management"
        onCreate={() => setOpenCreate(true)}
        stats={[
          { value: String(totalUsers).padStart(2, "0"), label: "Total User", color: "blue" },
          { value: String(activeUsers).padStart(2, "0"), label: "Active", color: "green" },
          { value: String(inactiveUsers).padStart(2, "0"), label: "Inactive", color: "red" },
        ]}
      />

      {/* CREATE STUDENT MODAL */}
      {openCreate && (
        <CreateUserForm
          onClose={() => setOpenCreate(false)}
          refreshUsers={fetchUsers}
          advisorContext={context}
        />
      )}

      {/* EDIT / INFO DETAILS MODAL */}
      {modalMode && (
        <UserDetailsModal
          user={selectedUser}
          mode={modalMode}
          onClose={() => setModalMode(null)}
          onSaved={fetchUsers}
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
            batches={uniqueBatches}
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
            columns={userColumns}
            data={paginatedData}
            selectable
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            getRowId={(row) => row.userId}
            actions={actions}
          />
        </>
      )}
    </div>
  );
};

export default UserManagement;
