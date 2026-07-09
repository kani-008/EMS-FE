/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from "react";
import Button from "./Button";
import client from "../api/client";
import { createAdminUsers } from "../api/usersApi";
import { createStudentRange, createSingleStudent, uploadStudentExcel } from "../api/staffApi";

/* =============================================================================
   STAFF CREATE USER FORM
   ============================================================================= */
const StaffCreateUserForm = ({ onClose, refreshUsers, advisorContext }) => {
  const department = advisorContext?.department_name || "";
  const batch = advisorContext?.batch || "";
  const [creationType, setCreationType] = useState("Range"); // "Range" | "Individual"
  const [course, setCourse] = useState(advisorContext?.course || "B.E");

  // Range-specific state
  const [prefix, setPrefix] = useState("");
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");

  // Individual-specific state
  const [rollNo, setRollNo] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("Male");

  // Form states
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const fileInputRef = useRef(null);

  // Auto-suggest range prefix & course from advisorContext when loaded
  useEffect(() => {
    if (advisorContext) {
      setCourse(advisorContext.course || "B.E");
      const yrPart = String(advisorContext.batch || "").slice(-2);
      const deptMap = {
        // Upper case maps
        CSE: "CSE", ECE: "ECE", MECH: "MECH",
        EEE: "EEE", CIVIL: "CIV", IMT: "IMT", AUTO: "AUTO", DS: "DS"
      };
      const deptPart = deptMap[(advisorContext.department_name || "").toUpperCase()] || (advisorContext.department_name || "").toUpperCase();
      setPrefix(`${yrPart}${deptPart}`);
    }
  }, [advisorContext]);

  // Create Button Handler (Submits Form)
  const handleCreate = async () => {
    if (creationType === "Range") {
      if (!prefix || !rangeFrom || !rangeTo) {
        alert("Please fill all range fields.");
        return;
      }
      setLoading(true);
      setUploadResult(null);

      try {
        const data = await createStudentRange({
          prefix: prefix.trim(),
          range_from: parseInt(rangeFrom, 10),
          range_to: parseInt(rangeTo, 10),
          course,
          semester: advisorContext?.derived_semester,
        });

        alert(`Range creation complete — ${data.created} created successfully, ${data.failed} failed.`);
        await refreshUsers();
        onClose();
      } catch (err) {
        alert("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      if (!rollNo || !firstName) {
        alert("Roll number and first name are required.");
        return;
      }
      setLoading(true);
      setUploadResult(null);

      try {
        await createSingleStudent({
          roll_no: rollNo.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          gender,
          registration_no: registrationNo.trim(),
          course,
          semester: advisorContext?.derived_semester,
        });

        alert(`Student ${rollNo} created successfully!`);
        await refreshUsers();
        onClose();
      } catch (err) {
        alert("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Upload Excel Handler
  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate extension
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext)) {
      alert("Please upload a valid Excel or CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadResult(null);

    try {
      const data = await uploadStudentExcel(formData);
      setUploadResult({ success: true, ...data });
      alert("Excel file uploaded & processed successfully!");
      await refreshUsers();
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto pt-20 pb-10">
      <div className="w-[700px] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-sm font-semibold text-blue-800 mb-4">CREATE NEW USERS</h2>

        {/* Info row */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 text-slate-600">
          <div>
            <strong>Department:</strong> {department}
          </div>
          <div>
            <strong>Batch (Academic Year):</strong> {batch}
          </div>
        </div>

        {/* Tab layout style switcher */}
        <div className="flex gap-4 border-b border-slate-200 pb-2 mb-4 text-sm font-medium">
          {["Range", "Individual"].map((tab) => (
            <button
              key={tab}
              onClick={() => setCreationType(tab)}
              className={`pb-1 px-1 transition-all ${
                creationType === tab ? "border-b-2 border-blue-600 text-blue-700 font-semibold" : "text-slate-400"
              }`}
            >
              {tab} Mode
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {creationType === "Range" && (
            <>
              <div>
                <label className="form-label">Prefix</label>
                <input
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                  placeholder="e.g. 23CSE"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="form-label">From</label>
                  <input
                    value={rangeFrom}
                    onChange={(e) => setRangeFrom(e.target.value)}
                    type="number"
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="form-label">To</label>
                  <input
                    value={rangeTo}
                    onChange={(e) => setRangeTo(e.target.value)}
                    type="number"
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                    placeholder="60"
                  />
                </div>
              </div>
            </>
          )}

          {creationType === "Individual" && (
            <>
              <div>
                <label className="form-label">Roll No / User ID</label>
                <input
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                  placeholder="e.g. 23CSE01"
                />
              </div>

              <div>
                <label className="form-label">Registration No</label>
                <input
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                  placeholder="e.g. 910023104001"
                />
              </div>

              <div>
                <label className="form-label">First Name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                  placeholder="e.g. Jane"
                />
              </div>

              <div>
                <label className="form-label">Last Name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                  placeholder="e.g. Doe"
                />
              </div>

              <div>
                <label className="form-label">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="form-label">Course</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2"
            >
              <option value="B.E">B.E</option>
              <option value="M.E">M.E</option>
            </select>
          </div>
        </div>

        {/* ── EXCEL IMPORT SECTION ────────────────────────────────────────────── */}
        <div className="mt-6 border-t border-slate-200 pt-4">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-700 mb-2">
            Bulk Import (Excel)
          </p>
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleExcelUpload}
              disabled={uploading}
              accept=".xlsx,.xls,.csv"
              className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploading && <span className="text-xs text-slate-500">Uploading...</span>}
          </div>

          {/* Excel upload validation feedback */}
          {uploadResult && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <p className="font-semibold text-green-700">
                Created: {uploadResult.created} students
              </p>
              {uploadResult.failed > 0 && (
                <p className="text-red-600 font-semibold mt-1">
                  Failed: {uploadResult.failed} (Duplicate or invalid)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-4">
          <Button
            label={loading ? "Creating..." : "Create"}
            onClick={handleCreate}
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
};

/* =============================================================================
   ADMIN CREATE USER FORM
   ============================================================================= */
const AdminCreateUserForm = ({ onClose, refreshUsers }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [department, setDepartment] = useState("");
  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userType, setUserType] = useState("");
  const [serial, setSerial] = useState("");
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [semesterTouched, setSemesterTouched] = useState(false);

  const lastSerialFromDB = 50;

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await client.get("/api/auth/me");
        if (data.success) {
          setUserInfo({
            ...data.user,
            batchYear: data.user.academic_year ? data.user.academic_year.split("-")[0] : null,
          });
          setDepartment(data.user.departmentName);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const batchYear = userInfo?.batchYear;
    if (batchYear && department) {
      const yearPart = String(batchYear).slice(-2);
      const deptMap = {
        CSE: "CSE", ECE: "ECE", MECH: "MECH",
        EEE: "EEE", CIVIL: "CIV", IMT: "IMT", AUTO: "AUTO",
      };
      setPrefix(`${yearPart}${deptMap[department] || ""}`);
    } else {
      setPrefix("");
    }
  }, [userInfo, department]);

  useEffect(() => {
    if (userType === "Individual") {
      setSerial(lastSerialFromDB + 1);
      setRangeFrom("");
      setRangeTo("");
    }
  }, [userType]);

  const getSemesterOptions = () => {
    switch (year) {
      case "1": return ["1", "2"];
      case "2": return ["3", "4"];
      case "3": return ["5", "6"];
      case "4": return ["7", "8"];
      default: return [];
    }
  };

  const handleCreate = async () => {
    const batchYear = userInfo?.batchYear;
    if (!batchYear || !department || !userRole || !userType) {
      alert("Please fill all required fields");
      return;
    }
    if (userType === "Range" && (!rangeFrom || !rangeTo)) {
      alert("Please enter range values");
      return;
    }

    const payload = {
      prefix,
      userType,
      rangeFrom,
      rangeTo,
      course,
      semester,
      batch: String(batchYear),
    };

    try {
      const data = await createAdminUsers(payload);
      alert(`✅ ${data.totalCreated} users created successfully`);
      await refreshUsers();
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[680px] bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-sm font-semibold text-blue-800 mb-4">CREATE NEW USER</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Batch */}
          <div>
            <label className="form-label">Batch</label>
            <input
              value={userInfo?.academic_year ? userInfo.academic_year.split("-")[0] : "Loading..."}
              disabled
              className="w-full border border-slate-300 rounded-md px-3 py-2 bg-gray-100 text-slate-600 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">🔒 Locked to your academic year</p>
          </div>

          {/* User Roll */}
          <div>
            <label className="form-label">User Roll</label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800"
            >
              <option value="" disabled>Choose User Roll</option>
              <option>Student</option>
              <option>Staff</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="form-label">Department</label>
            <input
              value={department || "Loading..."}
              disabled
              className="w-full border border-slate-300 rounded-md px-3 py-2 bg-gray-100 text-slate-600 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">🔒 Locked to your department</p>
          </div>

          {/* Course */}
          <div>
            <label className="form-label">Course</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800"
            >
              <option value="" disabled>Choose Course</option>
              <option>B.E</option>
              <option>M.E</option>
              <option>B.Tech</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="form-label">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800"
            >
              <option value="" disabled>Choose Year</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="form-label">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              onBlur={() => setSemesterTouched(true)}
              disabled={!year}
              className={`w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800 ${!year ? "bg-gray-100" : ""}`}
            >
              <option value="" disabled>Choose Semester</option>
              {getSemesterOptions().map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
            {semesterTouched && !year && (
              <p className="mt-1 text-xs text-red-500">Please select Year first</p>
            )}
          </div>

          {/* Prefix */}
          <div>
            <label className="form-label">Add Prefix</label>
            <input
              value={prefix}
              readOnly
              placeholder="Auto generated"
              className="w-full border border-slate-300 rounded-md px-3 py-2 bg-gray-100 text-slate-500"
            />
          </div>

          {/* Name */}
          <div>
            <label className="form-label">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800"
              placeholder="Full name (optional)"
            />
          </div>

          {/* User Type */}
          <div>
            <label className="form-label">User Type</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800"
            >
              <option value="" disabled>Choose Type</option>
              <option>Individual</option>
              <option>Range</option>
            </select>
          </div>

          {/* Serial / Range inputs */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            {userType === "Individual" && (
              <div>
                <label className="form-label">Serial Number</label>
                <input
                  value={`${serial} (Individual)`}
                  disabled
                  className="w-full bg-gray-100 border border-slate-300 rounded-md px-3 py-2 text-slate-500"
                />
              </div>
            )}

            {userType === "Range" && (
              <>
                <div>
                  <label className="form-label">Range From</label>
                  <input
                    value={rangeFrom}
                    onChange={(e) => setRangeFrom(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="form-label">Range To</label>
                  <input
                    value={rangeTo}
                    onChange={(e) => setRangeTo(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="col-span-2 flex justify-end gap-4 mt-6">
          <Button
            onClick={handleCreate}
            label="Create"
            variant="primary"
          />
          <Button
            onClick={onClose}
            label="Cancel"
            variant="danger"
          />
        </div>
      </div>
    </div>
  );
};

/* =============================================================================
   MAIN DISPATCHER EXPORT
   ============================================================================= */
const CreateUserForm = (props) => {
  if (props.advisorContext) {
    return <StaffCreateUserForm {...props} />;
  } else {
    return <AdminCreateUserForm {...props} />;
  }
};

export default CreateUserForm;
