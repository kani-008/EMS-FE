// frontend/src/admin/components/UserDetailsModal.jsx
// Handles both edit (staff only) and info modes.
// Edit mode: calls PUT /api/admin/update-staff/:facultyId via HTTP-only cookie.
// Departments loaded from API — no hardcoded lists.

import { useState, useEffect } from "react";
import Button from "./Button";
import API, { getCachedData } from "../ApiCall/Api";
import { useToast } from "./Toast";

function ro(val) {
  return String(val ?? "-").trim() || "-";
}

// ── INFO MODE ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div>
      <p className="form-label">{label}</p>
      <p className="form-value">{ro(value)}</p>
    </div>
  );
}

// ── EDIT MODE ─────────────────────────────────────────────────────────────────
function EditStaffModal({ user, onClose, onSaved }) {
  const toast = useToast();
  const [departments, setDepartments] = useState([]);
  const [staffRoles, setStaffRoles] = useState([]);
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [department, setDepartment] = useState(user.department || "");
  const [role, setRole] = useState(user.userRole || "");
  const [batch, setBatch] = useState(
    String(user.batchYear ?? user.batchDisplay ?? user.batch ?? "").replace(/^N\/A$/i, "")
  );
  const [currentYear, setCurrentYear] = useState(
    user.current_year != null ? String(user.current_year) : ""
  );
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Academic year preview: derived from batch + course (never stored)
  const courseDuration = String(user.course || "").startsWith("M") ? 2 : 4;
  const batchNum = parseInt(batch, 10);
  const academicYear =
    !isNaN(batchNum) && String(batchNum).length === 4
      ? `${batchNum}–${batchNum + courseDuration}`
      : "—";

  useEffect(() => {
    Promise.all([
      getCachedData("departments", "/departments"),
      getCachedData("roles", "/roles"),
    ]).then(([dd, rd]) => {
      setDepartments(dd || []);
      setStaffRoles(rd || []);
    }).catch(() => { });
  }, []);

  const handleSave = async () => {
    if (!firstName.trim()) { setFormError("First name is required."); return; }
    if (!department) { setFormError("Department is required."); return; }
    if (!role) { setFormError("Role is required."); return; }
    setFormError("");

    setLoading(true);
    try {
      await API.put(`/staff/${user.userId}`, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        department,
        role,
        batch: batch.trim() || null,
        currentYear: currentYear ? parseInt(currentYear, 10) : null,
      });
      await onSaved();
      onClose();
      toast.success(`${user.userId} updated successfully.`);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || "Failed to update staff user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-10" onClick={onClose}>
      <div className="w-[680px] bg-white rounded-xl shadow-lg p-6 my-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-sm font-semibold text-blue-800 mb-1">EDIT STAFF USER</h2>
        <p className="text-xs text-slate-500 mb-4">
          Staff ID <span className="font-mono font-bold text-blue-700">{user.userId}</span> is
          immutable and cannot be changed.
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">

          {/* Staff ID — read-only */}
          <div>
            <label className="form-label">Staff ID</label>
            <input
              readOnly
              value={user.userId || "-"}
              className="w-full border border-slate-200 rounded-md px-3 py-2 bg-slate-100 text-slate-700 font-mono cursor-not-allowed"
            />
          </div>

          {/* Role — editable dropdown */}
          <div>
            <label className="form-label">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-input w-full"
            >
              <option value="" disabled>Choose Role</option>
              {staffRoles.map((r) => (
                <option key={r.user_role_id} value={r.user_role}>
                  {r.user_role}
                </option>
              ))}
            </select>
          </div>

          {/* First Name */}
          <div>
            <label className="form-label">First Name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="form-input w-full"
              placeholder="First name"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="form-label">Last Name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="form-input w-full"
              placeholder="Last name"
            />
          </div>

          {/* Department */}
          <div>
            <label className="form-label">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="form-input w-full"
            >
              <option value="" disabled>Choose Department</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_name}>
                  {d.department_name}
                </option>
              ))}
            </select>
          </div>

          {/* Batch */}
          <div>
            <label className="form-label">Batch</label>
            <input
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="form-input w-full"
              placeholder="e.g. 2023"
            />
          </div>

          {/* Academic Year preview — read-only, derived from batch */}
          <div>
            <label className="form-label">
              Academic Year <span className="font-normal text-slate-400">(auto)</span>
            </label>
            <div className="form-input-static w-full">{academicYear}</div>
          </div>

          {/* Current Year (study year) — editable */}
          <div>
            <label className="form-label">Current Year</label>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
              className="form-input w-full"
            >
              <option value="">— None —</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          {formError && (
            <div className="col-span-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              ⚠ {formError}
            </div>
          )}

        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            label={loading ? "Saving…" : "Save"}
            variant="primary"
            onClick={handleSave}
            disabled={loading}
          />
          <Button
            label="Cancel"
            variant="danger"
            onClick={onClose}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
const UserDetailsModal = ({ user, mode, onClose, onSaved }) => {
  if (!user) return null;

  if (mode === "edit") {
    return (
      <EditStaffModal
        user={user}
        onClose={onClose}
        onSaved={onSaved || (() => { })}
      />
    );
  }

  // ── INFO MODE ───────────────────────────────────────────────────────────────
  const courseDuration = String(user.course || "").startsWith("M") ? 2 : 4;
  const batchNum = parseInt(user.batchYear ?? user.batchDisplay ?? user.batch ?? "", 10);
  const academicYear =
    !isNaN(batchNum) && String(batchNum).length === 4
      ? `${batchNum}–${batchNum + courseDuration}`
      : "—";
  const studyYear =
    !isNaN(batchNum) && String(batchNum).length === 4
      ? Math.min(Math.max(new Date().getFullYear() - batchNum, 1), courseDuration)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-10" onClick={onClose}>
      <div className="w-[680px] bg-white rounded-xl shadow-lg p-6 my-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-sm font-semibold text-blue-800 mb-4">STAFF DETAILS</h2>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <InfoRow label="Staff ID" value={user.userId} />
          <InfoRow label="Full Name" value={user.fullName} />
          <InfoRow label="Department" value={user.department} />
          <InfoRow label="Role" value={user.userRole} />
          <InfoRow label="Course" value={user.course} />
          <InfoRow label="Batch" value={
            String(user.batchDisplay ?? user.batchYear ?? user.batch ?? "").toUpperCase() === "N/A"
              ? "—"
              : (user.batchDisplay ?? user.batchYear ?? user.batch ?? "—")
          } />
          <InfoRow label="Academic Year" value={academicYear} />
          <InfoRow label="Study Year" value={studyYear ? `Year ${studyYear}` : "—"} />
          <InfoRow label="Status" value={user.status} />
          <InfoRow label="Created By" value={user.createdBy} />
        </div>

        <div className="flex justify-end mt-6">
          <Button label="Close" variant="danger" onClick={onClose} />
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;