// frontend/src/pages/Profile/Profile.jsx
//
// Single role-aware profile page for ADMIN / STUDENT / all staff roles
// (ADVISOR, HOD, PRINCIPAL, FACULTY, PLACEMENT, SPORTS).
//
// This replaces the previous AdminProfile.jsx / StaffProfile.jsx /
// StudentProfile.jsx trio. They existed as three near-identical copies of
// the same page even though the data already comes from one role-aware
// endpoint (GET/PUT /api/profile — see src/controllers/profileController.js
// on the backend, which dispatches on req.user.role internally). Keeping
// three frontend files meant every shared fix (styling, validation, the
// password flow) had to be repeated three times and inevitably drifted out
// of sync. This component reads the same role off useAuth().user and
// branches only where the actual data/permissions differ:
//   - ADMIN:   firstName/lastName/gender + phone are both editable
//   - STAFF:   identity fields are read-only (admin-managed); only phone
//              is editable; ADVISOR sees extra batch/course/year fields
//   - STUDENT: firstName/lastName/gender/registrationNo are editable;
//              roll no/department/course/batch/year/semester are read-only
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Dropdown from "../components/Dropdown";
import API from "../ApiCall/Api";
import { useAuth } from "../components/AuthContext";
import { useToast } from "../components/Toast";
import { STAFF_ROLES } from "../components/constants";

// ── Shared small building blocks ─────────────────────────────────────────────
const Field = ({ label, value, children }) => (
  <div>
    <p className="form-label">{label}</p>
    {children ?? <p className="form-value">{value || "—"}</p>}
  </div>
);

const Badge = ({ text, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-600",
    slate: "bg-slate-100 text-slate-600",
    purple: "bg-purple-100 text-purple-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${colors[color] || colors.slate}`}
    >
      {text}
    </span>
  );
};

const InitialsAvatar = ({ firstName, lastName }) => {
  const initials =
    [firstName?.[0], lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";
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
      {isErr ? "✖ " : "✔ "}
      {msg.text}
    </p>
  );
};

const Divider = () => <hr className="border-slate-200 my-5" />;

const ORDINAL = ["1st", "2nd", "3rd", "4th"];

// ═══════════════════════════════════════════════════════════════════════════
const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const role = user?.role;
  const isAdmin = role === "ADMIN";
  const isStudent = role === "STUDENT";
  const isAdvisor = role === "ADVISOR";
  const isStaff = STAFF_ROLES.includes(role);
  const homePath = isAdmin ? "/admin" : isStudent ? "/student" : "/staff";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState("");

  // ── Editable identity fields (which ones apply depends on role) ─────────────
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [registrationNo, setRegistrationNo] = useState(""); // student only
  const [savingIdentity, setSavingIdentity] = useState(false);
  const [identityMsg, setIdentityMsg] = useState(null);

  // ── Phone (admin + staff only) ───────────────────────────────────────────────
  const [phone, setPhone] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneMsg, setPhoneMsg] = useState(null);

  // ── Password change (all roles) ──────────────────────────────────────────────
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);

  // ── Fetch profile on mount ───────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await API.get("/profile");
        const data = res.data.data;
        setProfile(data);
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setGender(data.gender || "");
        setRegistrationNo(data.registrationNo || "");
        setPhone(data.phone || "");
      } catch (err) {
        setFetchErr(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Save identity fields (admin + student; staff identity is read-only) ─────
  const handleSaveIdentity = async () => {
    setSavingIdentity(true);
    setIdentityMsg(null);
    try {
      const payload = isStudent
        ? { first_name: firstName, last_name: lastName, registration_no: registrationNo, gender }
        : { firstName, lastName, gender };
      await API.put("/profile", payload);
      setProfile((p) => ({
        ...p,
        firstName,
        lastName,
        gender,
        registrationNo,
        fullName: `${firstName} ${lastName}`.trim() || p.username,
      }));
      setIdentityMsg({ type: "ok", text: "Profile details updated." });
    } catch (err) {
      setIdentityMsg({ type: "error", text: err.message });
    } finally {
      setSavingIdentity(false);
    }
  };

  // ── Save phone (admin + staff) ───────────────────────────────────────────────
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

  // ── Change password (all roles, same endpoint) ───────────────────────────────
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
      await API.put("/profile/password", {
        currentPassword: currentPwd,
        newPassword: newPwd,
        confirmPassword: confirmPwd,
      });
      setPwdMsg({ type: "ok", text: "Password changed successfully." });
      updateUser({ must_change_password: false });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      toast.success("Password changed successfully.");
      setTimeout(() => navigate(homePath), 1200);
    } catch (err) {
      setPwdMsg({ type: "error", text: err.message });
    } finally {
      setSavingPwd(false);
    }
  };

  // ── Loading / error states ───────────────────────────────────────────────────
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
  const yr = Number(profile.currentYear) || 0;
  const currentYearLabel = yr >= 1 && yr <= 4 ? `${ORDINAL[yr - 1]} Year` : "—";
  const roleBadgeText = isAdmin ? "ADMIN" : isStudent ? "STUDENT" : profile.roleName || profile.role || role;
  const subtitle = isAdmin
    ? "Administrator"
    : isStudent
    ? `Roll No: ${profile.rollNo || "—"}`
    : `ID: ${profile.facultyId || "—"}`;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-5">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">My Profile</h1>

        {user?.must_change_password && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl">
            <h4 className="font-semibold mb-1">Password Change Required</h4>
            <p className="text-sm">
              Please change your default password using the form below to unlock access to the
              rest of the application.
            </p>
          </div>
        )}

        {/* ── Identity card ─────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-5">
            <InitialsAvatar firstName={profile.firstName} lastName={profile.lastName} />
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-slate-900 truncate">
                {profile.fullName || profile.username}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge text={roleBadgeText} color={isAdmin ? "green" : "blue"} />
                <Badge text={profile.status || "ACTIVE"} color={statusColor} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Profile details card ─────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-700 mb-4">
            Profile Details
          </p>

          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {isStaff && !isAdmin ? (
              // ── STAFF (non-admin): identity is admin-managed, read-only ──────
              <>
                <Field label="First Name" value={profile.firstName} />
                <Field label="Last Name" value={profile.lastName} />
                <Field label="Gender" value={profile.gender} />
                <Field label="Department" value={profile.department} />
                <Field label="Role">
                  <Badge text={profile.roleName || profile.role || "—"} color="blue" />
                </Field>

                {isAdvisor && (
                  <>
                    <Field label="Batch" value={profile.batch} />
                    <Field label="Course" value={profile.course} />
                    <Field label="Current Year">
                      <div className="form-input-static w-full">
                        <span>{profile.currentYearLabel || `Year ${profile.currentYear}` || "—"}</span>
                        <Badge text="auto" color="slate" />
                      </div>
                    </Field>
                    <Field
                      label="Academic Year"
                      value={profile.academicYear || profile.academicYearId}
                    />
                  </>
                )}
              </>
            ) : (
              // ── ADMIN + STUDENT: identity fields editable ─────────────────────
              <>
                <div>
                  <label className="form-label">First Name</label>
                  <input
                    id="profile-first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Jane"
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <input
                    id="profile-last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Doe"
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">Gender</label>
                  <Dropdown
                    id="profile-gender"
                    value={gender}
                    onChange={setGender}
                    options={isStudent ? ["Male", "Female", "Other"] : ["Male", "Female"]}
                    placeholder="Select"
                  />
                </div>

                {isStudent && (
                  <div>
                    <label className="form-label">Registration No</label>
                    <input
                      id="profile-registration-no"
                      type="text"
                      value={registrationNo}
                      onChange={(e) => setRegistrationNo(e.target.value)}
                      className="form-input w-full"
                    />
                  </div>
                )}

                {isStudent && (
                  <>
                    <Field label="Roll No" value={profile.rollNo} />
                    <Field label="Department" value={profile.department} />
                    <Field label="Course" value={profile.course} />
                    <Field label="Batch" value={profile.batch} />
                    <Field label="Current Year">
                      <div className="form-input-static w-full">
                        <span>{currentYearLabel}</span>
                        <Badge text="auto" color="slate" />
                      </div>
                    </Field>
                    <Field label="Semester" value={profile.semester} />
                  </>
                )}

                <div className={isStudent ? "col-span-2 pt-2" : ""}>
                  <Button
                    id="profile-save-identity-btn"
                    onClick={handleSaveIdentity}
                    disabled={savingIdentity}
                    variant="primary"
                    label={savingIdentity ? "Saving…" : isStudent ? "Save Changes" : "Save"}
                  />
                  <Msg msg={identityMsg} />
                </div>
              </>
            )}

            {/* ── Phone — editable for admin + staff, not applicable to student ── */}
            {!isStudent && (
              <>
                {isAdmin && <Divider />}
                <div className="col-span-2">
                  <p className="form-label">{isAdmin ? "Contact Number" : "Phone / Contact"}</p>
                  <div className="flex gap-2">
                    <input
                      id="profile-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="form-input flex-1"
                    />
                    <Button
                      id="profile-save-phone-btn"
                      onClick={handleSavePhone}
                      disabled={savingPhone}
                      variant="primary"
                      label={savingPhone ? "Saving…" : "Save"}
                    />
                  </div>
                  <Msg msg={phoneMsg} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Change Password card (shared by every role) ─────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-700 mb-4">
            Change Password
          </p>
          <div className="space-y-3">
            <div>
              <label className="form-label">Current Password</label>
              <input
                id="profile-current-pwd"
                type="password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className="form-input w-full"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="form-label">New Password</label>
              <input
                id="profile-new-pwd"
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="form-input w-full"
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label className="form-label">Confirm New Password</label>
              <input
                id="profile-confirm-pwd"
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="form-input w-full"
                placeholder="Repeat new password"
              />
            </div>
            <Button
              id="profile-change-pwd-btn"
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

export default Profile;