// frontend/src/components/CreateUserForm.jsx
import { useState, useEffect, useRef } from "react";
import Button from "./Button";
import Dropdown from "./Dropdown";
import API, { getCachedData } from "../ApiCall/Api";
import { useToast } from "./Toast";

const getDeptPrefix = (deptName) => {
  const name = String(deptName || "").trim().toUpperCase();
  if (name === "CIVIL") return "CIV";
  return name.slice(0, 4);
};

const CreateUserForm = ({ onClose, refreshUsers, advisorContext }) => {
  const toast = useToast();
  const isStaffFlow = !!advisorContext;

  // ── Unified State ──
  const [departments, setDepartments] = useState([]);
  const [departmentAdmin, setDepartmentAdmin] = useState("");
  const [batchAdmin, setBatchAdmin] = useState("");
  const [courseAdmin, setCourseAdmin] = useState("B.E");
  const [semesterAdmin, setSemesterAdmin] = useState("");

  const departmentStaff = advisorContext?.department_name || "";
  const batchStaff = advisorContext?.batch || "";
  const [courseStaff, setCourseStaff] = useState(advisorContext?.course || "B.E");

  const [creationType, setCreationType] = useState("Range"); // "Range" | "Individual"

  // Range specific state
  const [prefixStaff, setPrefixStaff] = useState("");
  const [prefixAdmin, setPrefixAdmin] = useState("");
  const [rangeFromStaff, setRangeFromStaff] = useState("");
  const [rangeToStaff, setRangeToStaff] = useState("");
  const [rangeFromAdmin, setRangeFromAdmin] = useState("");
  const [rangeToAdmin, setRangeToAdmin] = useState("");

  // Individual specific state
  const [rollNo, setRollNo] = useState("");
  const [rollNoAdmin, setRollNoAdmin] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [registrationNoAdmin, setRegistrationNoAdmin] = useState("");
  const [firstName, setFirstName] = useState("");
  const [firstNameAdmin, setFirstNameAdmin] = useState("");
  const [lastName, setLastName] = useState("");
  const [lastNameAdmin, setLastNameAdmin] = useState("");
  const [gender, setGender] = useState("Male");
  const [genderAdmin, setGenderAdmin] = useState("Male");

  // Common Form states
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef(null);

  // Load departments if Admin
  useEffect(() => {
    if (!isStaffFlow) {
      const fetchDepts = async () => {
        try {
          const data = await getCachedData("departments", "/departments");
          setDepartments(data || []);
        } catch (err) {
          console.error("Error fetching departments:", err);
        }
      };
      fetchDepts();
    }
  }, [isStaffFlow]);

  // Derive Advisor prefix
  useEffect(() => {
    if (isStaffFlow && advisorContext) {
      setCourseStaff(advisorContext.course || "B.E");
      const yrPart = String(advisorContext.batch || "").slice(-2);
      const deptPart = getDeptPrefix(advisorContext.department_name);
      setPrefixStaff(`${yrPart}${deptPart}`);
    }
  }, [advisorContext, isStaffFlow]);

  // Derive Admin prefix
  useEffect(() => {
    if (!isStaffFlow && batchAdmin && departmentAdmin) {
      const yrPart = String(batchAdmin).slice(-2);
      const deptPart = getDeptPrefix(departmentAdmin);
      setPrefixAdmin(`${yrPart}${deptPart}`);
    } else if (!isStaffFlow) {
      setPrefixAdmin("");
    }
  }, [batchAdmin, departmentAdmin, isStaffFlow]);

  // Hidden Excel Upload handler
  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (ext !== "xlsx") {
      toast.error("Only .xlsx files are accepted.");
      return;
    }

    const activeDept = isStaffFlow ? departmentStaff : departmentAdmin;
    const activeBatch = isStaffFlow ? batchStaff : batchAdmin;
    const activeCourse = isStaffFlow ? courseStaff : courseAdmin;
    const activeSemester = isStaffFlow ? advisorContext?.derived_semester : semesterAdmin;

    if (!activeDept || !activeBatch || !activeCourse || !activeSemester) {
      toast.error("Please select Department, Batch, Course, and Semester before uploading Excel.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("department", activeDept);
    formData.append("batch", String(activeBatch));
    formData.append("course", activeCourse);
    formData.append("semester", String(activeSemester));

    try {
      setUploading(true);
      setUploadResult(null);
      const res = await API.post("/students/excel", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const data = res.data;
      setUploadResult(data);
      await refreshUsers();
      if (data.failed) {
        toast.info(`Upload complete — ${data.created} created, ${data.failed} failed. See details below.`);
      } else {
        toast.success(`Upload complete — ${data.created} student(s) created.`);
      }
    } catch (err) {
      console.error("Excel upload error:", err);
      toast.error(err.response?.data?.message || err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // CSV error report downloader
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

  // Shared Submit Logic
  const handleCreate = async () => {
    setLoading(true);
    setUploadResult(null);
    setFormError("");

    const activeDept = isStaffFlow ? departmentStaff : departmentAdmin;
    const activeBatch = isStaffFlow ? batchStaff : batchAdmin;
    const activeCourse = isStaffFlow ? courseStaff : courseAdmin;
    const activeSemester = isStaffFlow ? advisorContext?.derived_semester : semesterAdmin;
    const activePrefix = isStaffFlow ? prefixStaff : prefixAdmin;

    if (!activeDept || !activeBatch || !activeCourse || !activeSemester) {
      setFormError("Please fill all required department, batch, course, and semester fields.");
      setLoading(false);
      return;
    }

    if (creationType === "Range") {
      const fromVal = isStaffFlow ? rangeFromStaff : rangeFromAdmin;
      const toVal = isStaffFlow ? rangeToStaff : rangeToAdmin;

      if (!activePrefix || !fromVal || !toVal) {
        setFormError("Please fill all range fields.");
        setLoading(false);
        return;
      }

      try {
        const res = await API.post("/students/range", {
          prefix: activePrefix.trim(),
          range_from: parseInt(fromVal, 10),
          range_to: parseInt(toVal, 10),
          course: activeCourse,
          semester: parseInt(activeSemester, 10),
          department: activeDept,
          batch: String(activeBatch),
        });
        const data = res.data;
        await refreshUsers();
        onClose();
        toast.success(`Range creation complete — ${data.created} created, ${data.failed} failed.`);
      } catch (err) {
        setFormError(err.response?.data?.message || err.message || "Failed to create students.");
      } finally {
        setLoading(false);
      }
    } else {
      // Individual flow
      const activeRollNo = isStaffFlow ? rollNo : rollNoAdmin;
      const activeFirstName = isStaffFlow ? firstName : firstNameAdmin;
      const activeLastName = isStaffFlow ? lastName : lastNameAdmin;
      const activeGender = isStaffFlow ? gender : genderAdmin;
      const activeRegNo = isStaffFlow ? registrationNo : registrationNoAdmin;

      if (!activeRollNo || !activeFirstName) {
        setFormError("Roll number and first name are required.");
        setLoading(false);
        return;
      }

      try {
        await API.post("/students/single", {
          roll_no: activeRollNo.trim(),
          first_name: activeFirstName.trim(),
          last_name: activeLastName.trim(),
          gender: activeGender,
          registration_no: activeRegNo.trim(),
          course: activeCourse,
          semester: parseInt(activeSemester, 10),
          department: activeDept,
          batch: String(activeBatch),
        });
        await refreshUsers();
        onClose();
        toast.success("Student created successfully.");
      } catch (err) {
        setFormError(err.response?.data?.message || err.message || "Failed to create student.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[700px] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-sm font-semibold text-blue-800 mb-4">
          CREATE NEW STUDENT USER ({isStaffFlow ? "ADVISOR FLOW" : "ADMIN FLOW"})
        </h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Row 1: Department & Batch */}
          <div>
            <label className="form-label font-semibold text-slate-700">Department</label>
            {isStaffFlow ? (
              <input
                value={departmentStaff || "Loading..."}
                readOnly
                className="form-input-static w-full"
              />
            ) : (
              <Dropdown
                value={departmentAdmin}
                onChange={setDepartmentAdmin}
                options={departments}
                placeholder="Choose Department"
              />
            )}
          </div>

          <div>
            <label className="form-label font-semibold text-slate-700">Batch</label>
            {isStaffFlow ? (
              <input
                value={batchStaff || "Loading..."}
                readOnly
                className="form-input-static w-full"
              />
            ) : (
              <input
                type="text"
                value={batchAdmin}
                onChange={(e) => setBatchAdmin(e.target.value)}
                className="form-input w-full"
                placeholder="e.g. 2023"
              />
            )}
          </div>

          {/* Row 2: Course & Semester */}
          <div>
            <label className="form-label font-semibold text-slate-700">Course</label>
            {isStaffFlow ? (
              <select
                value={courseStaff}
                onChange={(e) => setCourseStaff(e.target.value)}
                className="form-input w-full"
              >
                <option value="B.E">B.E</option>
                <option value="M.E">M.E</option>
              </select>
            ) : (
              <select
                value={courseAdmin}
                onChange={(e) => setCourseAdmin(e.target.value)}
                className="form-input w-full"
              >
                <option value="B.E">B.E</option>
                <option value="M.E">M.E</option>
              </select>
            )}
          </div>

          <div>
            <label className="form-label font-semibold text-slate-700">Semester</label>
            {isStaffFlow ? (
              <div className="form-input-static w-full">
                <span>{advisorContext?.derived_semester || "—"}</span>
                {advisorContext?.derived_semester && (
                  <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    auto
                  </span>
                )}
              </div>
            ) : (
              <select
                value={semesterAdmin}
                onChange={(e) => setSemesterAdmin(e.target.value)}
                className="form-input w-full"
              >
                <option value="" disabled>Choose Semester</option>
                {[...Array(8)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            )}
          </div>

          {/* Row 3: Creation Type & Roll No Prefix / Roll No */}
          <div>
            <label className="form-label font-semibold text-slate-700">Creation Type</label>
            <select
              value={creationType}
              onChange={(e) => {
                setCreationType(e.target.value);
                setUploadResult(null);
              }}
              className="form-input w-full"
            >
              <option value="Range">Range</option>
              <option value="Individual">Individual</option>
            </select>
          </div>

          {creationType === "Range" ? (
            <div>
              <label className="form-label font-semibold text-slate-700">Roll No Prefix</label>
              {isStaffFlow ? (
                <input
                  value={prefixStaff}
                  onChange={(e) => setPrefixStaff(e.target.value)}
                  className="form-input w-full"
                  placeholder="e.g. 23CSE"
                />
              ) : (
                <input
                  value={prefixAdmin}
                  onChange={(e) => setPrefixAdmin(e.target.value)}
                  className="form-input w-full"
                  placeholder="e.g. 23CSE"
                />
              )}
            </div>
          ) : (
            <div>
              <label className="form-label font-semibold text-slate-700">Roll No</label>
              {isStaffFlow ? (
                <input
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="form-input w-full"
                  placeholder="e.g. 23CSE101"
                />
              ) : (
                <input
                  value={rollNoAdmin}
                  onChange={(e) => setRollNoAdmin(e.target.value)}
                  className="form-input w-full"
                  placeholder="e.g. 23CSE101"
                />
              )}
            </div>
          )}

          {/* Conditional Fields based on Creation Type */}
          {creationType === "Range" ? (
            <>
              {/* Row 4 (Range): From & To */}
              <div>
                <label className="form-label font-semibold text-slate-700">From (Number)</label>
                {isStaffFlow ? (
                  <input
                    type="number"
                    value={rangeFromStaff}
                    onChange={(e) => setRangeFromStaff(e.target.value)}
                    className="form-input w-full"
                    placeholder="e.g. 1"
                  />
                ) : (
                  <input
                    type="number"
                    value={rangeFromAdmin}
                    onChange={(e) => setRangeFromAdmin(e.target.value)}
                    className="form-input w-full"
                    placeholder="e.g. 1"
                  />
                )}
              </div>

              <div>
                <label className="form-label font-semibold text-slate-700">To (Number)</label>
                {isStaffFlow ? (
                  <input
                    type="number"
                    value={rangeToStaff}
                    onChange={(e) => setRangeToStaff(e.target.value)}
                    className="form-input w-full"
                    placeholder="e.g. 60"
                  />
                ) : (
                  <input
                    type="number"
                    value={rangeToAdmin}
                    onChange={(e) => setRangeToAdmin(e.target.value)}
                    className="form-input w-full"
                    placeholder="e.g. 60"
                  />
                )}
              </div>
            </>
          ) : (
            <>
              {/* Row 4 (Individual): Registration No & First Name */}
              <div>
                <label className="form-label font-semibold text-slate-700">Registration No</label>
                {isStaffFlow ? (
                  <input
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value)}
                    className="form-input w-full"
                    placeholder="e.g. 910023104001"
                  />
                ) : (
                  <input
                    value={registrationNoAdmin}
                    onChange={(e) => setRegistrationNoAdmin(e.target.value)}
                    className="form-input w-full"
                    placeholder="e.g. 910023104001"
                  />
                )}
              </div>

              <div>
                <label className="form-label font-semibold text-slate-700">First Name</label>
                {isStaffFlow ? (
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="form-input w-full"
                    placeholder="e.g. John"
                  />
                ) : (
                  <input
                    value={firstNameAdmin}
                    onChange={(e) => setFirstNameAdmin(e.target.value)}
                    className="form-input w-full"
                    placeholder="e.g. John"
                  />
                )}
              </div>

              {/* Row 5 (Individual): Last Name & Gender */}
              <div>
                <label className="form-label font-semibold text-slate-700">Last Name</label>
                {isStaffFlow ? (
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="form-input w-full"
                    placeholder="e.g. Doe"
                  />
                ) : (
                  <input
                    value={lastNameAdmin}
                    onChange={(e) => setLastNameAdmin(e.target.value)}
                    className="form-input w-full"
                    placeholder="e.g. Doe"
                  />
                )}
              </div>

              <div>
                <label className="form-label font-semibold text-slate-700">Gender</label>
                {isStaffFlow ? (
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="form-input w-full"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <select
                    value={genderAdmin}
                    onChange={(e) => setGenderAdmin(e.target.value)}
                    className="form-input w-full"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                )}
              </div>
            </>
          )}

          {/* Info bar */}
          <div className="col-span-2 text-xs text-slate-500 bg-slate-50 rounded-md px-3 py-2 border border-slate-200">
            Temporary password will be auto-generated as random secure string.
            <span className="block mt-1 text-blue-600 font-medium">
              Excel template columns: roll_no, first_name, last_name, gender, registration_no, course
            </span>
          </div>

          {/* Excel upload result summary */}
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

          {/* Form-level validation error (replaces alert()) */}
          {formError && (
            <div className="col-span-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              ⚠ {formError}
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
};

export default CreateUserForm;