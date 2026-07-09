import { useState, useEffect } from "react";
import Button from "../../components/Button";
import { fetchStudentProfile, updateStudentProfile, updateStudentPassword } from "../../api/studentApi";

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

const ORDINAL = ["1st", "2nd", "3rd", "4th"];

// ═══════════════════════════════════════════════════════════════════════════════
// StudentProfile
// Full-page student self-service profile.
// Data from GET /api/student/profile (calls sp_get_student_profile).
// Student can edit: first_name, last_name, registration_no, gender.
// ═══════════════════════════════════════════════════════════════════════════════
const StudentProfile = () => {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [fetchErr, setFetchErr] = useState("");

  // ── Editable fields ───────────────────────────────────────────────────────
  const [firstName, setFirstName]         = useState("");
  const [lastName, setLastName]           = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [gender, setGender]               = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg]       = useState(null);

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
        const data = await fetchStudentProfile();
        setProfile(data.data);
        setFirstName(data.data.firstName || "");
        setLastName(data.data.lastName || "");
        setRegistrationNo(data.data.registrationNo || "");
        setGender(data.data.gender || "");
      } catch (err) {
        setFetchErr(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await updateStudentProfile({
        first_name:      firstName,
        last_name:       lastName,
        registration_no: registrationNo,
        gender,
      });
      setProfile((p) => ({
        ...p,
        firstName,
        lastName,
        registrationNo,
        gender,
        fullName: `${firstName} ${lastName}`.trim(),
      }));
      setProfileMsg({ type: "ok", text: "Profile updated successfully." });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setSavingProfile(false);
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
      await updateStudentPassword({ currentPassword: currentPwd, newPassword: newPwd, confirmPassword: confirmPwd });
      setPwdMsg({ type: "ok", text: "Password changed successfully." });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
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
  const yr = Number(profile.currentYear) || 0;
  const currentYearLabel = yr >= 1 && yr <= 4 ? `${ORDINAL[yr - 1]} Year` : "—";

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Page title */}
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">My Profile</h1>

        {/* ── Identity card ───────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-5">
            <InitialsAvatar firstName={profile.firstName} lastName={profile.lastName} />
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-slate-900 truncate">
                {profile.fullName || profile.username}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Roll No: {profile.rollNo || "—"}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge text="STUDENT" color="blue" />
                <Badge text={profile.status || "ACTIVE"} color={statusColor} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Editable profile fields ──────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-700 mb-4">Profile Details</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">

            {/* First Name — editable */}
            <div>
              <label className="form-label">
                First Name
              </label>
              <input
                id="student-first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Last Name — editable */}
            <div>
              <label className="form-label">
                Last Name
              </label>
              <input
                id="student-last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Gender — editable dropdown */}
            <div>
              <label className="form-label">
                Gender
              </label>
              <select
                id="student-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Registration No — editable */}
            <div>
              <label className="form-label">
                Registration No
              </label>
              <input
                id="student-reg-no"
                type="text"
                value={registrationNo}
                onChange={(e) => setRegistrationNo(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Read-only fields */}
            <Field label="Roll No"       value={profile.rollNo} />
            <Field label="Department"    value={profile.department} />
            <Field label="Course"        value={profile.course} />
            <Field label="Batch"         value={profile.batch} />

            <Field label="Current Year">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-indigo-700">{currentYearLabel}</span>
                <Badge text="auto-calculated" color="slate" />
              </div>
            </Field>

            <Field label="Semester"      value={profile.semester} />

            {/* Save button */}
            <div className="col-span-2 pt-2">
              <Button
                id="student-save-profile-btn"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                variant="primary"
                label={savingProfile ? "Saving…" : "Save Changes"}
              />
              <Msg msg={profileMsg} />
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
                id="student-current-pwd"
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
                id="student-new-pwd"
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
                id="student-confirm-pwd"
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Repeat new password"
              />
            </div>
            <Button
              id="student-change-pwd-btn"
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

export default StudentProfile;
