import { useState } from "react";
import StatusBadge from "./StatusBadge";
import Button from "./Button";
import { updateStudent } from "../api/staffApi";

function ro(val) {
  return String(val ?? "-").trim() || "-";
}

// ── INFO MODE FIELD ───────────────────────────────────────────────────────────
function InfoField({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="form-label">{label}</p>
      <div className="w-full border border-slate-200 rounded-md px-3 py-2 bg-slate-50 min-h-[38px] flex items-center form-value">
        {value || "—"}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const EditUserDetails = ({ user, mode, onClose, onSaved }) => {
  // Edit form states
  const [firstName, setFirstName] = useState(user?.firstName || user?.first_name || "");
  const [lastName, setLastName] = useState(user?.lastName || user?.last_name || "");
  const [gender, setGender] = useState(user?.gender || "Male");
  const [registrationNo, setRegistrationNo] = useState(user?.registrationNo || user?.registration_no || "");
  const [course, setCourse] = useState(user?.course || "B.E");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Password change states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState("");

  if (!user) return null;

  const isEdit = mode === "edit";

  // Derive Semester and Current Year based on batch
  const batchNum = parseInt(user.batch, 10);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const derivedCurrentYear = !isNaN(batchNum)
    ? currentYear - batchNum + 1
    : null;

  const derivedSemester = !isNaN(batchNum)
    ? (currentMonth >= 7
      ? ((currentYear - batchNum) * 2) + 1
      : ((currentYear - batchNum) * 2))
    : null;

  // Resolve roll_no for the request
  const rollNo = user.userId || user.roll_no;

  const handleSave = async () => {
    // Validate password fields if either is filled
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setPwdError("Passwords do not match");
        return;
      }
      if (newPassword.length < 6) {
        setPwdError("Password must be at least 6 characters");
        return;
      }
    }
    setPwdError("");

    if (!firstName.trim()) {
      setError("First Name is required.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const body = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        gender,
        registration_no: registrationNo.trim(),
        course,
      };

      // Include password only if both fields are filled and match
      if (newPassword && newPassword === confirmPassword) {
        body.newPassword = newPassword;
      }

      await updateStudent(rollNo, body);

      alert("Student updated successfully!");
      if (onSaved) await onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── EDIT MODE (Student role only) ───────────────────────────────────────────
  if (isEdit && user.userRole === "Student") {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto pt-20 pb-10" onClick={onClose}>
        <div className="w-[700px] bg-white rounded-xl shadow-lg p-6" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-sm font-semibold text-blue-800 mb-1">EDIT STUDENT USER</h2>
          <p className="text-xs text-slate-500 mb-4">
            Roll No <span className="font-mono font-bold text-blue-700">{rollNo}</span> is immutable and cannot be changed.
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Department — read-only */}
            <div>
              <label className="form-label">Department</label>
              <input
                readOnly
                value={user.department_name || user.department || "—"}
                className="w-full border border-slate-200 rounded-md px-3 py-2 bg-slate-100 text-slate-700 cursor-not-allowed"
              />
            </div>

            {/* Batch — read-only */}
            <div>
              <label className="form-label">Batch</label>
              <input
                readOnly
                value={user.batch || "—"}
                className="w-full border border-slate-200 rounded-md px-3 py-2 bg-slate-100 text-slate-700 cursor-not-allowed"
              />
            </div>

            {/* Roll No — read-only */}
            <div>
              <label className="form-label">Roll No</label>
              <input
                readOnly
                value={rollNo}
                className="w-full border border-slate-200 rounded-md px-3 py-2 bg-slate-100 text-slate-700 font-mono cursor-not-allowed"
              />
            </div>

            {/* Registration No — editable */}
            <div>
              <label className="form-label">Registration No</label>
              <input
                value={registrationNo}
                onChange={(e) => setRegistrationNo(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. 910023104001"
              />
            </div>

            {/* First Name — editable */}
            <div>
              <label className="form-label">First Name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. John"
              />
            </div>

            {/* Last Name — editable */}
            <div>
              <label className="form-label">Last Name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. Doe"
              />
            </div>

            {/* Gender — editable dropdown */}
            <div>
              <label className="form-label">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Course — editable dropdown */}
            <div>
              <label className="form-label">Course</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none"
              >
                <option value="B.E">B.E</option>
                <option value="M.E">M.E</option>
              </select>
            </div>

            {/* Semester — read-only badge */}
            <div>
              <label className="form-label">
                Semester <span className="font-normal text-slate-400">(auto)</span>
              </label>
              <div className="flex items-center h-[38px] px-3 rounded-md border border-slate-200 bg-slate-50">
                <span className="text-sm font-semibold text-blue-700">
                  {derivedSemester || "—"}
                </span>
                <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  auto-calculated
                </span>
              </div>
            </div>

            {/* Current Year — read-only badge */}
            <div>
              <label className="form-label">
                Current Year <span className="font-normal text-slate-400">(auto)</span>
              </label>
              <div className="flex items-center h-[38px] px-3 rounded-md border border-slate-200 bg-slate-50">
                <span className="text-sm font-semibold text-blue-700">
                  {derivedCurrentYear || "—"}
                </span>
                <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  auto-calculated
                </span>
              </div>
            </div>

            {/* Status — StatusBadge (no input box) */}
            <div className="flex items-center gap-3">
              <label className="form-label">Status</label>
              <StatusBadge status={user.status || "Active"} />
            </div>

          </div>

          {/* ── Change Password Section ─────────────────────────────────────── */}
          <div className="mt-5 border-t border-slate-200 pt-4">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-700 mb-3">
              Change Password <span className="font-normal text-slate-400 lowercase tracking-normal">(optional — leave blank to skip)</span>
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPwdError(""); }}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPwdError(""); }}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Repeat new password"
                />
              </div>
              {pwdError && (
                <div className="col-span-2 text-xs text-red-500">
                  ⚠️ {pwdError}
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-xs text-red-500 mt-3">
              ⚠️ {error}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              label={loading ? "Saving…" : "Save"}
              onClick={handleSave}
              disabled={loading}
              variant="primary"
            />
            <Button
              label="Cancel"
              onClick={onClose}
              disabled={loading}
              variant="danger"
            />
          </div>
        </div>
      </div>
    );
  }

  // ── INFO MODE ───────────────────────────────────────────────────────────────
  // Resolve fields with fallback key names
  const infoRollNo = user.userId || user.roll_no;
  const infoFullName = user.userName || user.full_name ||
    ((user.first_name || user.firstName || "") + " " + (user.last_name || user.lastName || "")).trim();
  const infoDept = user.department || user.department_name;
  const infoBatch = user.batch;
  const infoCourse = user.course;
  const infoYear = user.current_year || user.year || derivedCurrentYear;
  const infoSemester = user.semester || derivedSemester;
  const infoRegNo = user.registration_no || user.registrationNo;
  const infoGender = user.gender;
  const infoStatus = user.status;
  const infoCreated = user.timestamp || user.created_on || user.createdAt;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto pt-20 pb-10" onClick={onClose}>
      <div className="w-[700px] bg-white rounded-xl shadow-lg p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-sm font-semibold text-blue-800 mb-4">STUDENT DETAILS</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Row 1: Roll No | Full Name */}
          <div>
            <p className="form-label">Roll No</p>
            <div className="w-full border border-blue-200 rounded-md px-3 py-2 bg-blue-50 text-blue-800 font-bold font-mono text-sm min-h-[38px] flex items-center">
              {ro(infoRollNo)}
            </div>
          </div>
          <InfoField label="Full Name" value={ro(infoFullName)} />

          {/* Row 2: Department | Batch */}
          <InfoField label="Department" value={ro(infoDept)} />
          <InfoField label="Batch" value={ro(infoBatch)} />

          {/* Row 3: Course | Current Year */}
          <InfoField label="Course" value={ro(infoCourse)} />
          <InfoField label="Current Year" value={ro(infoYear)} />

          {/* Row 4: Semester | Registration No */}
          <InfoField label="Semester" value={ro(infoSemester)} />
          <InfoField label="Registration No" value={ro(infoRegNo)} />

          {/* Row 5: Gender | Status (StatusBadge — no box wrapper) */}
          <InfoField label="Gender" value={ro(infoGender)} />
          <div>
            <p className="form-label">Status</p>
            <div className="flex items-center min-h-[38px]">
              <StatusBadge status={infoStatus || "Active"} />
            </div>
          </div>

          {/* Row 6: Created On (col-span-2) */}
          <InfoField label="Created On" value={ro(infoCreated)} className="col-span-2" />
        </div>

        <div className="flex justify-end mt-6">
          <Button label="Close" onClick={onClose} variant="danger" />
        </div>
      </div>
    </div>
  );
};

export default EditUserDetails;
