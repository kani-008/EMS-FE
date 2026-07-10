import { useState, useEffect } from "react";
import StatusBadge from "./StatusBadge";
import Button from "./Button";
import Dropdown from "./Dropdown";
import API, { getCachedData } from "../ApiCall/Api";
import { useToast } from "./Toast";

function ro(val) {
  return String(val ?? "-").trim() || "-";
}

// ── INFO MODE FIELD ───────────────────────────────────────────────────────────
function InfoField({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="form-label">{label}</p>
      <div className="form-input-static w-full form-value">{value || "—"}</div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const EditUserDetails = ({ user, mode, onClose, onSaved }) => {
  const toast = useToast();
  // Edit form states (unconditional)
  const [firstName, setFirstName] = useState(user?.firstName || user?.first_name || "");
  const [lastName, setLastName] = useState(user?.lastName || user?.last_name || "");
  const [gender, setGender] = useState(user?.gender || "Male");
  const [registrationNo, setRegistrationNo] = useState(user?.registrationNo || user?.registration_no || "");
  const [course, setCourse] = useState(user?.course || "B.E");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Password change states (unconditional)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState("");

  // Staff edit form states (unconditional — only rendered/used in the staff branch)
  const [staffFirstName, setStaffFirstName] = useState(user?.firstName || user?.first_name || "");
  const [staffLastName, setStaffLastName] = useState(user?.lastName || user?.last_name || "");
  const [staffDepartment, setStaffDepartment] = useState(user?.department_name || user?.department || "");
  const [staffRole, setStaffRole] = useState(user?.userRole || "");
  const [staffBatch, setStaffBatch] = useState(user?.batch || user?.batchYear || "");
  const [staffCurrentYear, setStaffCurrentYear] = useState(user?.current_year || user?.year || "");
  const [departments, setDepartments] = useState([]);
  const [staffRoles, setStaffRoles] = useState([]);

  // Same DB-driven pattern as CreateStaffForm.jsx — no hardcoded lists.
  useEffect(() => {
    const load = async () => {
      try {
        const [deptList, roleList] = await Promise.all([
          getCachedData("departments", "/departments"),
          getCachedData("roles", "/roles"),
        ]);
        setDepartments(deptList || []);
        setStaffRoles(roleList || []);
      } catch (err) {
        console.error("Failed to load department/role options:", err);
      }
    };
    load();
  }, []);

  if (!user) return null;

  const isEdit = mode === "edit";
  // API returns userRole as "STUDENT" (uppercase, matching the user_role table)
  // — comparing against "Student" here previously meant this NEVER matched,
  // so Edit silently fell through to read-only Info mode for every user.
  const isStudentRole = String(user.userRole || "").toUpperCase() === "STUDENT";

  const [derivedCurrentYear, setDerivedCurrentYear] = useState(null);
  const [derivedSemester, setDerivedSemester] = useState(null);

  useEffect(() => {
    const fetchDerivation = async () => {
      const batchVal = user?.batch;
      const courseVal = course || user?.course;
      if (batchVal && courseVal && batchVal !== "N/A") {
        try {
          const res = await API.get("/staff/validate-batch", {
            params: { batch: batchVal, course: courseVal }
          });
          if (res.data.valid) {
            setDerivedCurrentYear(res.data.currentYear);
            setDerivedSemester(res.data.semester);
          } else {
            setDerivedCurrentYear(null);
            setDerivedSemester(null);
          }
        } catch (err) {
          console.error("Failed to derive year/semester from backend:", err);
          setDerivedCurrentYear(null);
          setDerivedSemester(null);
        }
      }
    };
    fetchDerivation();
  }, [user?.batch, course, user?.course]);

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

      await API.put(`/students/${rollNo}`, body);

      await (onSaved ? onSaved() : null);
      onClose();
      toast.success("Student updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStaff = async () => {
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

    if (!staffFirstName.trim()) {
      setError("First Name is required.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const body = {
        firstName: staffFirstName.trim(),
        lastName: staffLastName.trim(),
        department: staffDepartment,
        role: staffRole,
        batch: staffBatch,
        currentYear: staffCurrentYear === "" ? undefined : Number(staffCurrentYear),
      };

      await API.put(`/staff/${facultyId}`, body);

      // Staff password change goes through /profile, not /staff/:id — that
      // endpoint only updates identity/role fields. Only attempted if the
      // admin actually filled in a new password.
      const attemptedPwdReset = newPassword && newPassword === confirmPassword;

      await (onSaved ? onSaved() : null);
      onClose();

      if (attemptedPwdReset) {
        // No admin-initiated staff password reset endpoint currently exists
        // (staff can only change their own password via /profile). Surface
        // that clearly — as a toast, since the modal is already closing and
        // an inline message here would never be seen.
        toast.info(
          "Identity details saved. Note: resetting another staff member's password isn't supported yet — they need to change it themselves from their own Profile page.",
          7000
        );
      } else {
        toast.success("Staff updated successfully.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resolve faculty_id for staff PUT requests
  const facultyId = user.faculty_id || user.userId;

  // ── EDIT MODE (Student role) ────────────────────────────────────────────────
  if (isEdit && isStudentRole) {
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
                className="form-input-static w-full"
              />
            </div>

            {/* Batch — read-only */}
            <div>
              <label className="form-label">Batch</label>
              <input
                readOnly
                value={user.batch || "—"}
                className="form-input-static w-full"
              />
            </div>

            {/* Roll No — read-only */}
            <div>
              <label className="form-label">Roll No</label>
              <input
                readOnly
                value={rollNo}
                className="form-input-static w-full font-mono"
              />
            </div>

            {/* Registration No — editable */}
            <div>
              <label className="form-label">Registration No</label>
              <input
                value={registrationNo}
                onChange={(e) => setRegistrationNo(e.target.value)}
                className="form-input w-full"
                placeholder="e.g. 910023104001"
              />
            </div>

            {/* First Name — editable */}
            <div>
              <label className="form-label">First Name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="form-input w-full"
                placeholder="e.g. John"
              />
            </div>

            {/* Last Name — editable */}
            <div>
              <label className="form-label">Last Name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="form-input w-full"
                placeholder="e.g. Doe"
              />
            </div>

            {/* Gender — editable dropdown */}
            <div>
              <label className="form-label">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="form-input w-full"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Course — editable dropdown */}
            <div>
              <label className="form-label">Course</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="form-input w-full"
              >
                <option value="B.E">B.E</option>
                <option value="M.E">M.E</option>
              </select>
            </div>

            {/* ── Change Password Section ─────────────────────────────────────── */}
            <div className="mt-5 border-t border-slate-200 pt-4 col-span-2">
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
                    className="form-input w-full"
                    placeholder="Min 6 characters"
                  />
                </div>
                <div>
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setPwdError(""); }}
                    className="form-input w-full"
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
              <div className="col-span-2 text-xs text-red-500 mt-3">
                ⚠️ {error}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="col-span-2 flex justify-end gap-3 mt-6">
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
      </div>
    );
  }

  // ── EDIT MODE (Staff — any non-STUDENT role) ────────────────────────────────
  // Previously there was no edit path for staff at all; Edit always fell
  // through to the read-only Info view below.
  if (isEdit && !isStudentRole) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto pt-20 pb-10" onClick={onClose}>
        <div className="w-[700px] bg-white rounded-xl shadow-lg p-6" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-sm font-semibold text-blue-800 mb-1">EDIT STAFF USER</h2>
          <p className="text-xs text-slate-500 mb-4">
            Faculty ID <span className="font-mono font-bold text-blue-700">{facultyId}</span> is immutable and cannot be changed.
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* First Name — editable */}
            <div>
              <label className="form-label">First Name</label>
              <input
                value={staffFirstName}
                onChange={(e) => setStaffFirstName(e.target.value)}
                className="form-input w-full"
                placeholder="e.g. John"
              />
            </div>

            {/* Last Name — editable */}
            <div>
              <label className="form-label">Last Name</label>
              <input
                value={staffLastName}
                onChange={(e) => setStaffLastName(e.target.value)}
                className="form-input w-full"
                placeholder="e.g. Doe"
              />
            </div>

            {/* Department — editable, DB-driven */}
            <div>
              <label className="form-label">Department</label>
              <Dropdown
                value={staffDepartment}
                onChange={setStaffDepartment}
                options={departments}
                placeholder="Choose Department"
              />
            </div>

            {/* Role — editable, DB-driven */}
            <div>
              <label className="form-label">Role</label>
              <Dropdown
                value={staffRole}
                onChange={setStaffRole}
                options={staffRoles}
                placeholder="Choose Role"
              />
            </div>

            {/* Batch — editable (only meaningful for ADVISOR, but harmless for others) */}
            <div>
              <label className="form-label">Batch</label>
              <input
                value={staffBatch}
                onChange={(e) => setStaffBatch(e.target.value)}
                className="form-input w-full"
                placeholder="e.g. 2023 or N/A"
              />
            </div>

            {/* Current Year — editable */}
            <div>
              <label className="form-label">Current Year</label>
              <input
                type="number"
                min="0"
                max="4"
                value={staffCurrentYear}
                onChange={(e) => setStaffCurrentYear(e.target.value)}
                className="form-input w-full"
              />
            </div>

            {/* ── Change Password Section — informational only for staff, see note below ── */}
            <div className="mt-5 border-t border-slate-200 pt-4 col-span-2">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-700 mb-3">
                Change Password <span className="font-normal text-slate-400 lowercase tracking-normal">(optional — leave blank to skip)</span>
              </p>
              <p className="text-xs text-slate-400 mb-3">
                Note: staff can only change their own password from their own Profile page. Filling
                this in will save your other changes but will NOT reset their password.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPwdError(""); }}
                    className="form-input w-full"
                    placeholder="Min 6 characters"
                  />
                </div>
                <div>
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setPwdError(""); }}
                    className="form-input w-full"
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

            {error && (
              <div className="col-span-2 text-xs text-red-500 mt-3">
                ⚠️ {error}
              </div>
            )}

            <div className="col-span-2 flex justify-end gap-3 mt-6">
              <Button
                label={loading ? "Saving…" : "Save"}
                onClick={handleSaveStaff}
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
      </div>
    );
  }

  // ── INFO MODE ───────────────────────────────────────────────────────────────
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

          {/* Row 5: Gender | Status */}
          <InfoField label="Gender" value={ro(infoGender)} />
          <div>
            <p className="form-label">Status</p>
            <div className="flex items-center min-h-[38px]">
              <StatusBadge status={infoStatus || "Active"} />
            </div>
          </div>

          {/* Row 6: Created On */}
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