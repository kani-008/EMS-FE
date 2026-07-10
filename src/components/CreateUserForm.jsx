// frontend/src/components/CreateUserForm.jsx
import { useState, useEffect, useRef } from "react";
import Button from "./Button";
import API from "../ApiCall/Api";

const CreateUserForm = ({ onClose, refreshUsers, advisorContext }) => {
  const isStaffFlow = !!advisorContext;

  // ──────────────── STAFF/ADVISOR FLOW STATE ────────────────
  const departmentStaff = advisorContext?.department_name || "";
  const batchStaff = advisorContext?.batch || "";
  const [creationType, setCreationType] = useState("Range"); // "Range" | "Individual"
  const [courseStaff, setCourseStaff] = useState(advisorContext?.course || "B.E");

  // Staff Range-specific state
  const [prefixStaff, setPrefixStaff] = useState("");
  const [rangeFromStaff, setRangeFromStaff] = useState("");
  const [rangeToStaff, setRangeToStaff] = useState("");

  // Staff Individual-specific state
  const [rollNo, setRollNo] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("Male");

  // Common Form states
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  // Auto-suggest range prefix & course from advisorContext when loaded
  useEffect(() => {
    if (isStaffFlow && advisorContext) {
      setCourseStaff(advisorContext.course || "B.E");
      const yrPart = String(advisorContext.batch || "").slice(-2);
      const deptMap = {
        CSE: "CSE", ECE: "ECE", MECH: "MECH",
        EEE: "EEE", CIVIL: "CIV", IMT: "IMT", AUTO: "AUTO", DS: "DS"
      };
      const deptPart = deptMap[(advisorContext.department_name || "").toUpperCase()] || (advisorContext.department_name || "").toUpperCase();
      setPrefixStaff(`${yrPart}${deptPart}`);
    }
  }, [advisorContext, isStaffFlow]);

  // Hidden Excel Upload handler for staff
  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (ext !== "xlsx") {
      alert("Only .xlsx files are accepted.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setUploadResult(null);
      const res = await API.post("/students/excel", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const data = res.data;
      setUploadResult(data);
      await refreshUsers();
    } catch (err) {
      console.error("Excel upload error:", err);
      alert("Upload error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // CSV error report downloader for staff
  const downloadExcelErrorReport = () => {
    if (!uploadResult?.errors?.length) return;
    const header = "Row,Roll No,Reason\n";
    const rows = uploadResult.errors
      .map((e) => `"${e.row}","${e.roll_no}","${(e.reason || "").replace(/"/g, '""')}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student_upload_errors.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // ──────────────── ADMIN FLOW STATE ────────────────
  const [userInfo, setUserInfo] = useState(null);
  const [departmentAdmin, setDepartmentAdmin] = useState("");
  const [nameAdmin, setNameAdmin] = useState("");
  const [prefixAdmin, setPrefixAdmin] = useState("");
  const [userRoleAdmin, setUserRoleAdmin] = useState("");
  const [userTypeAdmin, setUserTypeAdmin] = useState("");
  const [serialAdmin, setSerialAdmin] = useState("");
  const [rangeFromAdmin, setRangeFromAdmin] = useState("");
  const [rangeToAdmin, setRangeToAdmin] = useState("");
  const [courseAdmin, setCourseAdmin] = useState("");
  const [yearAdmin, setYearAdmin] = useState("");
  const [semesterAdmin, setSemesterAdmin] = useState("");
  const [semesterTouched, setSemesterTouched] = useState(false);

  const lastSerialFromDB = 50;

  // Load Admin user info from context on mount if admin flow
  useEffect(() => {
    if (!isStaffFlow) {
      const fetchUserInfo = async () => {
        try {
          const res = await API.get("/auth/me");
          const data = res.data;
          if (data.success) {
            setUserInfo({
              ...data.user,
              batchYear: data.user.academic_year ? data.user.academic_year.split("-")[0] : null,
            });
            setDepartmentAdmin(data.user.departmentName);
          }
        } catch (err) {
          console.error("Error fetching user info:", err);
        }
      };
      fetchUserInfo();
    }
  }, [isStaffFlow]);

  // Derive Admin prefix
  useEffect(() => {
    if (!isStaffFlow && userInfo?.batchYear && departmentAdmin) {
      const yearPart = String(userInfo.batchYear).slice(-2);
      const deptMap = {
        CSE: "CSE", ECE: "ECE", MECH: "MECH",
        EEE: "EEE", CIVIL: "CIV", IMT: "IMT", AUTO: "AUTO", DS: "DS"
      };
      setPrefixAdmin(`${yearPart}${deptMap[departmentAdmin] || ""}`);
    } else if (!isStaffFlow) {
      setPrefixAdmin("");
    }
  }, [userInfo, departmentAdmin, isStaffFlow]);

  // Individual Serial for Admin
  useEffect(() => {
    if (!isStaffFlow && userTypeAdmin === "Individual") {
      setSerialAdmin(lastSerialFromDB + 1);
      setRangeFromAdmin("");
      setRangeToAdmin("");
    }
  }, [userTypeAdmin, isStaffFlow]);

  const getSemesterOptionsAdmin = () => {
    switch (yearAdmin) {
      case "1": return ["1", "2"];
      case "2": return ["3", "4"];
      case "3": return ["5", "6"];
      case "4": return ["7", "8"];
      default: return [];
    }
  };


  // ──────────────── SHARED SUBMIT LOGIC ────────────────
  const handleCreate = async () => {
    setLoading(true);
    setUploadResult(null);

    if (isStaffFlow) {
      // STAFF/ADVISOR ACTIONS
      if (creationType === "Range") {
        if (!prefixStaff || !rangeFromStaff || !rangeToStaff) {
          alert("Please fill all range fields.");
          setLoading(false);
          return;
        }
        try {
          const res = await API.post("/students/range", {
            prefix: prefixStaff.trim(),
            range_from: parseInt(rangeFromStaff, 10),
            range_to: parseInt(rangeToStaff, 10),
            course: courseStaff,
            semester: advisorContext?.derived_semester,
          });
          const data = res.data;
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
          setLoading(false);
          return;
        }
        try {
          await API.post("/students/single", {
            roll_no: rollNo.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            gender,
            registration_no: registrationNo.trim(),
            course: courseStaff,
            semester: advisorContext?.derived_semester,
          });
          alert("Student created successfully!");
          await refreshUsers();
          onClose();
        } catch (err) {
          alert("Error: " + err.message);
        } finally {
          setLoading(false);
        }
      }
    } else {
      // ADMIN ACTIONS
      try {
        const batchYear = userInfo?.batchYear;
        if (!batchYear || !departmentAdmin || !userRoleAdmin || !userTypeAdmin) {
          alert("Please fill all required fields");
          setLoading(false);
          return;
        }
        if (userTypeAdmin === "Range" && (!rangeFromAdmin || !rangeToAdmin)) {
          alert("Please enter range values");
          setLoading(false);
          return;
        }

        const payload = {
          prefix: prefixAdmin,
          userType: userTypeAdmin,
          rangeFrom: rangeFromAdmin,
          rangeTo: rangeToAdmin,
          course: courseAdmin,
          semester: semesterAdmin,
          batch: String(batchYear),
        };

        const res = await API.post("/students", payload);
        const data = res.data;
        alert(`\u2705 ${data.totalCreated} users created successfully`);
        await refreshUsers();
        onClose();
      } catch (err) {
        console.error(err);
        alert("\u274c Error: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // ──────────────── RENDERING ────────────────
  if (isStaffFlow) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-[700px] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-sm font-semibold text-blue-800 mb-4">
            CREATE NEW STUDENT USER
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Row 1: Department & Batch */}
            <div>
              <label className="form-label">Department</label>
              <input
                value={departmentStaff || "Loading..."}
                readOnly
                className="w-full border border-slate-300 rounded-md px-3 py-2 bg-gray-100 text-slate-600 outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="form-label">Batch</label>
              <input
                value={batchStaff || "Loading..."}
                readOnly
                className="w-full border border-slate-300 rounded-md px-3 py-2 bg-gray-100 text-slate-600 outline-none cursor-not-allowed"
              />
            </div>

            {/* Row 2: Course & Semester */}
            <div>
              <label className="form-label">Course</label>
              <select
                value={courseStaff}
                onChange={(e) => setCourseStaff(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none"
              >
                <option value="B.E">B.E</option>
                <option value="M.E">M.E</option>
              </select>
            </div>

            <div>
              <label className="form-label">Semester</label>
              <div className="flex items-center h-[38px] px-3 rounded-md border border-slate-200 bg-slate-50">
                <span className="text-sm font-semibold text-blue-700">
                  {advisorContext?.derived_semester || "—"}
                </span>
                {advisorContext?.derived_semester && (
                  <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    AUTO-CALCULATED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Derived from batch · not editable
              </p>
            </div>

            {/* Row 3: Creation Type & Roll No Prefix / Roll No */}
            <div>
              <label className="form-label">Creation Type</label>
              <select
                value={creationType}
                onChange={(e) => {
                  setCreationType(e.target.value);
                  setUploadResult(null);
                }}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none"
              >
                <option value="Range">Range</option>
                <option value="Individual">Individual</option>
              </select>
            </div>

            {creationType === "Range" ? (
              <div>
                <label className="form-label">Roll No Prefix</label>
                <input
                  value={prefixStaff}
                  onChange={(e) => setPrefixStaff(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none"
                  placeholder="e.g. 23CSE"
                />
              </div>
            ) : (
              <div>
                <label className="form-label">Roll No</label>
                <input
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none"
                  placeholder="e.g. 23CSE101"
                />
              </div>
            )}

            {/* Conditional Fields based on Creation Type */}
            {creationType === "Range" ? (
              <>
                {/* Row 4 (Range): From & To */}
                <div>
                  <label className="form-label">From (Number)</label>
                  <input
                    type="number"
                    value={rangeFromStaff}
                    onChange={(e) => setRangeFromStaff(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none"
                    placeholder="e.g. 1"
                  />
                </div>

                <div>
                  <label className="form-label">To (Number)</label>
                  <input
                    type="number"
                    value={rangeToStaff}
                    onChange={(e) => setRangeToStaff(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none"
                    placeholder="e.g. 60"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Row 4 (Individual): Registration No & First Name */}
                <div>
                  <label className="form-label">Registration No</label>
                  <input
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none"
                    placeholder="e.g. 910023104001"
                  />
                </div>

                <div>
                  <label className="form-label">First Name</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none"
                    placeholder="e.g. John"
                  />
                </div>

                {/* Row 5 (Individual): Last Name & Gender */}
                <div>
                  <label className="form-label">Last Name</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none"
                    placeholder="e.g. Doe"
                  />
                </div>

                <div>
                  <label className="form-label">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </>
            )}

            {/* Info bar */}
            <div className="col-span-2 text-xs text-slate-500 bg-slate-50 rounded-md px-3 py-2 border border-slate-200">
              Temporary password will be auto-generated as: <strong>&lt;roll_no&gt;@&lt;batch_year&gt;</strong>
              <span className="block mt-1 text-blue-600 font-medium">
                Excel template columns: roll_no, first_name, last_name, gender, registration_no, course
              </span>
            </div>

            {/* Excel upload result summary inline in the info bar area */}
            {uploadResult && (
              <div className="col-span-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 space-y-2">
                <p className="font-semibold text-slate-800">
                  Upload complete — {uploadResult.total} processed,{" "}
                  <span className="text-green-600">{uploadResult.created} created</span>,{" "}
                  <span className="text-red-500">{uploadResult.failed} failed</span>
                </p>

                {uploadResult.errors?.length > 0 && (
                  <div>
                    <button
                      onClick={downloadExcelErrorReport}
                      className="text-blue-600 underline text-xs font-semibold"
                    >
                      Download error report (.csv)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="col-span-2 flex justify-end gap-3 mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleExcelUpload}
              />
              <Button
                label={uploading ? "Uploading..." : "Upload Excel"}
                variant="outline-blue"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || loading}
              />
              <Button
                label={loading ? "Creating..." : "Create"}
                variant="primary"
                onClick={handleCreate}
                disabled={loading || uploading}
              />
              <Button
                label="Cancel"
                variant="danger"
                onClick={onClose}
                disabled={loading || uploading}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN FLOW RENDER
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[680px] bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-sm font-semibold text-blue-800 mb-4">
          CREATE NEW USER
        </h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Batch - Locked to admin's academic year */}
          <div>
            <label className="form-label">Batch</label>
            <input
              value={userInfo?.batchYear || "Loading..."}
              disabled
              className="w-full border border-slate-300 rounded-md px-3 py-2 bg-gray-100 text-slate-600 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">🔒 Locked to your academic year</p>
          </div>

          {/* User Roll */}
          <div>
            <label className="form-label">User Roll</label>
            <select
              value={userRoleAdmin}
              onChange={(e) => setUserRoleAdmin(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800"
            >
              <option value="" disabled className="text-slate-400">
                Choose User Roll
              </option>
              <option className="text-slate-800">Student</option>
              <option className="text-slate-800">Staff</option>
            </select>
          </div>

          {/* Department - Read-only (from token) */}
          <div>
            <label className="form-label">Department</label>
            <input
              value={departmentAdmin || "Loading..."}
              disabled
              className="w-full border border-slate-300 rounded-md px-3 py-2 bg-gray-100 text-slate-600 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">🔒 Locked to your department</p>
          </div>

          {/* Course */}
          <div>
            <label className="form-label">Course</label>
            <select
              value={courseAdmin}
              onChange={(e) => setCourseAdmin(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800"
            >
              <option value="" disabled className="text-slate-400">
                Choose Course
              </option>
              <option className="text-slate-800">B.E</option>
              <option className="text-slate-800">M.E</option>
              <option className="text-slate-800">B.Tech</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="form-label">Year</label>
            <select
              value={yearAdmin}
              onChange={(e) => {
                setYearAdmin(e.target.value);
                setSemesterAdmin(""); // reset semester
                setSemesterTouched(false); // reset alert
              }}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800"
            >
              <option value="" disabled className="text-slate-400">
                Choose Year
              </option>
              <option value="1" className="text-slate-800">1</option>
              <option value="2" className="text-slate-800">2</option>
              <option value="3" className="text-slate-800">3</option>
              <option value="4" className="text-slate-800">4</option>
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="form-label">Semester</label>
            <select
              value={semesterAdmin}
              onChange={(e) => setSemesterAdmin(e.target.value)}
              onMouseDown={(e) => {
                if (!yearAdmin) {
                  e.preventDefault(); // block dropdown
                  setSemesterTouched(true); // show alert
                }
              }}
              className={`w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800 ${
                !yearAdmin ? "bg-gray-100 " : ""
              }`}
            >
              <option value="" disabled className="text-slate-400">
                Choose Semester
              </option>
              {getSemesterOptionsAdmin().map((sem) => (
                <option key={sem} value={sem} className="text-slate-800">
                  {sem}
                </option>
              ))}
            </select>

            {/* ALERT ONLY WHEN USER TRIES WITHOUT YEAR */}
            {semesterTouched && !yearAdmin && (
              <p className="mt-1 text-xs text-red-500">
                Please select Year first
              </p>
            )}
          </div>

          {/* Prefix */}
          <div>
            <label className="form-label">Add Prefix</label>
            <input
              value={prefixAdmin}
              readOnly
              placeholder="Auto generated"
              className="w-full border border-slate-300 rounded-md px-3 py-2 bg-gray-100 text-slate-500"
            />
          </div>

          {/* Name (optional) */}
          <div>
            <label className="form-label">Name</label>
            <input
              value={nameAdmin}
              onChange={(e) => setNameAdmin(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800"
              placeholder="Full name (optional)"
            />
          </div>

          {/* User Type */}
          <div>
            <label className="form-label">User Type</label>
            <select
              value={userTypeAdmin}
              onChange={(e) => setUserTypeAdmin(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800"
            >
              <option value="" disabled className="text-slate-400">
                Choose Type
              </option>
              <option className="text-slate-800">Individual</option>
              <option className="text-slate-800">Range</option>
            </select>
          </div>

          {/* Serial / Range */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            {userTypeAdmin === "Individual" && (
              <div>
                <label className="form-label">Serial Number</label>
                <input
                  value={`${serialAdmin} (Individual)`}
                  disabled
                  className="w-full bg-gray-100 border border-slate-300 rounded-md px-3 py-2 text-slate-500"
                />
              </div>
            )}

            {userTypeAdmin === "Range" && (
              <>
                <div>
                  <label className="form-label">Range From</label>
                  <input
                    value={rangeFromAdmin}
                    onChange={(e) => setRangeFromAdmin(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="form-label">Range To</label>
                  <input
                    value={rangeToAdmin}
                    onChange={(e) => setRangeToAdmin(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="col-span-2 flex justify-end gap-4 mt-6">
            <Button
              onClick={handleCreate}
              disabled={loading}
              variant="primary"
              label={loading ? "Creating..." : "Create"}
            />
            <Button
              onClick={onClose}
              variant="danger"
              label="Cancel"
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUserForm;
