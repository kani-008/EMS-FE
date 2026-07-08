// frontend/src/admin/components/EditUserDetials.jsx
import { useState } from "react";
import Button from "../../components/Button";

// Helper functions
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

function deriveYearFromBatch(batch) {
  const batchNum = Number(String(batch || "").trim());
  if (!Number.isFinite(batchNum) || String(batchNum).length < 4) return "";
  const currentYear = new Date().getFullYear();
  return Math.min(Math.max(currentYear - batchNum, 1), 4);
}

const EditUserDetails = ({ user, onClose }) => {
  if (!user) return null;

  // Extract user data with fallbacks
  const firstName = user.first_name ?? user.firstName ?? "";
  const lastName = user.last_name ?? user.lastName ?? "";
  const userRole = user.userRole ?? user.role ?? "-";
  const batch = user.batchYear ?? user.batch ?? "";
  const course = user.course ?? "";
  const department = user.department ?? "";
  const semester = user.semester ?? "";
  const registrationNo = user.registrationNo ?? user.registration_no ?? "";
  const rollNumber = user.userId ?? user.user_id ?? "";
  const lastUpdatedBy = user.last_updated_by ?? user.lastUpdatedBy ?? "-";
  const lastUpdatedOn = user.last_updated_on ?? user.lastUpdatedOn ?? "";

  // Derive year from batch
  const calculatedYear = deriveYearFromBatch(batch);

  // State for form edits
  const [editFirstName, setEditFirstName] = useState(firstName);
  const [editLastName, setEditLastName] = useState(lastName);
  const [editUserRole, setEditUserRole] = useState(userRole);
  const [editBatch, setEditBatch] = useState(batch);
  const [editCourse, setEditCourse] = useState(course);
  const [editDepartment, setEditDepartment] = useState(department);
  const [editYear, setEditYear] = useState(String(calculatedYear));
  const [editSemester, setEditSemester] = useState(semester);
  const [editRegistrationNo, setEditRegistrationNo] = useState(registrationNo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto pt-10 pb-10" onClick={onClose}>
      {/* MODAL CARD */}
      <div className="bg-white w-[720px] rounded-lg shadow-lg px-8 py-6 my-auto" onClick={(e) => e.stopPropagation()}>
        {/* TITLE */}
        <h2 className="text-base font-semibold text-blue-700 mb-5">
          EDIT USER DETAILS
        </h2>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          {/* First Name */}
          <div>
            <label className="form-label">FIRST NAME</label>
            <input
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              placeholder="First name"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="form-label">LAST NAME</label>
            <input
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              placeholder="Last name"
            />
          </div>

          {/* User Role */}
          <div>
            <label className="form-label">USER ROLE</label>
            <select
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editUserRole}
              onChange={(e) => setEditUserRole(e.target.value)}
            >
              <option value="">-</option>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Advisor">Advisor</option>
              <option value="HOD">HOD</option>
              <option value="Admin">Admin</option>
              <option value="Placement">Placement</option>
              <option value="Sports">Sports</option>
            </select>
          </div>

          {/* Batch */}
          <div>
            <label className="form-label">BATCH</label>
            <input
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editBatch}
              onChange={(e) => setEditBatch(e.target.value)}
              placeholder="e.g., 2023"
            />
          </div>

          {/* Course */}
          <div>
            <label className="form-label">COURSE</label>
            <select
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editCourse}
              onChange={(e) => setEditCourse(e.target.value)}
            >
              <option value="">-</option>
              <option value="B.E">B.E</option>
              <option value="M.E">M.E</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="form-label">DEPARTMENT</label>
            <select
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editDepartment}
              onChange={(e) => setEditDepartment(e.target.value)}
            >
              <option value="">-</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
              <option value="IMT">IMT</option>
              <option value="AUTO">AUTO</option>
              <option value="EEE">EEE</option>
              <option value="DS">DS</option>
            </select>
          </div>

          {/* Year (Auto-calculated, disabled) */}
          <div>
            <label className="form-label">YEAR</label>
            <select
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md bg-slate-50 focus:outline-none"
              value={editYear}
              disabled
            >
              <option value="">-</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">Auto-calculated from batch</p>
          </div>

          {/* Semester */}
          <div>
            <label className="form-label">SEMESTER</label>
            <select
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editSemester}
              onChange={(e) => setEditSemester(e.target.value)}
            >
              <option value="">-</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>

          {/* Registration Number */}
          <div>
            <label className="form-label">REGISTRATION NUMBER</label>
            <input
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editRegistrationNo}
              onChange={(e) => setEditRegistrationNo(e.target.value)}
              placeholder="Registration number"
            />
          </div>

          {/* Roll Number (Read-only) */}
          <div>
            <label className="form-label">ROLL NUMBER</label>
            <input
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md bg-slate-50"
              value={rollNumber}
              disabled
            />
            <p className="text-xs text-slate-500 mt-1">System-generated</p>
          </div>

          {/* Last Updated By (Read-only) */}
          <div>
            <label className="form-label">LAST UPDATED BY</label>
            <p className="mt-2 form-value">{lastUpdatedBy || "-"}</p>
          </div>

          {/* Last Updated On (Read-only) */}
          <div>
            <label className="form-label">LAST UPDATED ON</label>
            <p className="mt-2 form-value">
              {formatTimestamp(lastUpdatedOn) || "-"}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-4 mt-8">
          <Button
            label="Save"
            variant="primary"
            onClick={() => {
              console.log("Edit user data:", {
                firstName: editFirstName,
                lastName: editLastName,
                role: editUserRole,
                batch: editBatch,
                course: editCourse,
                department: editDepartment,
                semester: editSemester,
                registrationNo: editRegistrationNo,
              });
              alert("✅ Changes saved (functionality to be integrated)");
              onClose();
            }}
          />
          <Button
            label="Cancel"
            variant="danger"
            onClick={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default EditUserDetails;
