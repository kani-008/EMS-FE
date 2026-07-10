// frontend/src/staff/pages/Profile/StaffProfile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import API from "../../ApiCall/Api";
import { useAuth } from "../../components/AuthContext";


// ── Tiny helpers ────────────────────────────────────────────────────────────────
const Field = ({ label, value, children }) => (
  <div>
    <p className="form-label">{label}</p>
    {children ?? (
      <p className="form-value">{value || "—"}</p>
    )}
  </div>
);

const Badge = ({ text, color = "blue" }) => {
  const colors = {
    blue:  "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    red:   "bg-red-100 text-red-600",
    slate: "bg-slate-100 text-slate-600",
    purple:"bg-purple-100 text-purple-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${colors[color] || colors.slate}`}>
      {text}
    </span>
  );
};

const InitialsAvatar = ({ firstName, lastName }) => {
  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";
  return (
    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md select-none">
      {initials}
    </div>
  );
};

const Msg = ({ msg }) => {
  if (!msg) return null;
  const isErr = msg.type === "error";
  return (
    <p className={`text-xs mt-2 font-medium ${isErr ? "text-red-500" : "text-emerald-600"}`}>
      {isErr ? "✖ " : "✔ "}{msg.text}
    </p>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// StaffProfile
// Full-page staff self-service profile.
// Data from GET /api/staff/profile (calls sp_get_staff_profile).
// Staff can edit: phone only.
// Admin-set fields are read-only.
// ═══════════════════════════════════════════════════════════════════════════════
const StaffProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [fetchErr, setFetchErr] = useState("");

  // ── Phone edit ─────────────────────────────────────────────────────────────
  const [phone, setPhone]             = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneMsg, setPhoneMsg]       = useState(null);

  // ── Password change ─────────────────────────────────────────────────────────
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd]         = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingPwd, setSavingPwd]   = useState(false);
  const [pwdMsg, setPwdMsg]         = useState(null);

  // ── Fetch profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await API.get("/profile");
        setProfile(res.data.data);
        setPhone(res.data.data.phone || "");
      } catch (err) {
        setFetchErr(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Save phone ─────────────────────────────────────────────────────────────
  const handleSavePhone = async () => {
    setSavingPhone(true);
    setPhoneMsg(null);
    try {
      await API.put("/profile", { phone });
      setProfile((p) => ({ ...p, phone }));
      setPhoneMsg({ type: "ok", text: "Contact number updated." });
    } catch (err) {
      setPhoneMsg({ type: "error", text: err.message });
    } finally {
      setSavingPhone(false);
    }
  };

  // ── Change password ────────────────────────────────────────────────────────
  const handleChangePwd = async () => {
    setPwdMsg(null);
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdMsg({ type: "error", text: "All password fields are required." });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    setSavingPwd(true);
    try {
      await API.put("/profile", { currentPassword: currentPwd, newPassword: newPwd, confirmPassword: confirmPwd });
      setPwdMsg({ type: "ok", text: "Password changed successfully." });
      updateUser({ must_change_password: false });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setTimeout(() => {
        navigate("/staff");
      }, 1500);
    } catch (err) {
      setPwdMsg({ type: "error", text: err.message });
    } finally {
      setSavingPwd(false);
    }
  };

  // ── Loading / error ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }
  if (fetchErr) {
    return (
      <div className="py-12 text-center text-sm text-red-500">
        Failed to load profile: {fetchErr}
      </div>
    );
  }

  const statusColor = profile.status === "ACTIVE" ? "green" : "red";
  const isAdvisor   = String(profile.roleName || "").toUpperCase() === "ADVISOR";

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Page title */}
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">My Profile</h1>

        {user?.must_change_password && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl">
            <h4 className="font-semibold mb-1">Password Change Required</h4>
            <p className="text-sm">Please change your default password using the form below to unlock access to the rest of the application.</p>
          </div>
        )}

        {/* ── Identity card ───────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-5">
            <InitialsAvatar firstName={profile.firstName} lastName={profile.lastName} />
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-slate-900 truncate">
                {profile.fullName || profile.username}
              </p>
              {/* Faculty ID */}
              <p className="text-xs text-slate-500 mt-0.5">ID: {profile.facultyId || "—"}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge text={profile.roleName || profile.role || "STAFF"} color="blue" />
                <Badge text={profile.status || "ACTIVE"} color={statusColor} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Admin-set read-only fields ──────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-700 mb-4">Profile Details</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <Field label="First Name"  value={profile.firstName} />
            <Field label="Last Name"   value={profile.lastName} />
            <Field label="Gender"      value={profile.gender} />
            <Field label="Department"  value={profile.department} />
            <Field label="Role">
              <Badge text={profile.roleName || profile.role || "—"} color="blue" />
            </Field>

            {isAdvisor && (
              <>
                <Field label="Batch"  value={profile.batch} />
                <Field label="Course" value={profile.course} />

                {/* Current Year — derived by backend, read-only */}
                <Field label="Current Year">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-indigo-700">
                      {profile.currentYearLabel || `Year ${profile.currentYear}` || "—"}
                    </span>
                    <Badge text="auto-calculated" color="slate" />
                  </div>
                </Field>

                {/* Academic Year — from DB, read-only */}
                <Field label="Academic Year">
                  <span className="form-value">
                    {profile.academicYear || profile.academicYearId || "—"}
                  </span>
                </Field>
              </>
            )}

            {/* Phone — EDITABLE by staff */}
            <div className="col-span-2">
              <p className="form-label">Phone / Contact</p>
              <div className="flex gap-2">
                <input
                  id="staff-phone-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <Button
                  id="staff-save-phone-btn"
                  onClick={handleSavePhone}
                  disabled={savingPhone}
                  variant="primary"
                  label={savingPhone ? "Saving…" : "Save"}
                />

              </div>
              <Msg msg={phoneMsg} />
            </div>
          </div>
        </div>

        {/* ── Change Password ─────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-700 mb-4">Change Password</p>
          <div className="space-y-3">
            <div>
              <label className="form-label">
                Current Password
              </label>
              <input
                id="staff-current-pwd"
                type="password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="form-label">
                New Password
              </label>
              <input
                id="staff-new-pwd"
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label className="form-label">
                Confirm New Password
              </label>
              <input
                id="staff-confirm-pwd"
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Repeat new password"
              />
            </div>
            <Button
              id="staff-change-pwd-btn"
              onClick={handleChangePwd}
              disabled={savingPwd}
              variant="primaryCreate"
              label={savingPwd ? "Changing…" : "Change Password"}
              className="mt-1"
            />

            <Msg msg={pwdMsg} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default StaffProfile;
