import { useState, useEffect, useRef, useCallback } from "react";
import Button from "./Button";
import Dropdown from "./Dropdown";
import API from "../ApiCall/Api";
import { useToast } from "./Toast";
import { getCachedData } from "../ApiCall/cache";

const CreateStaffForm = ({ onClose, refreshUsers }) => {
  const toast = useToast();
  const [departments, setDepartments] = useState([]);
  const [staffRoles, setStaffRoles]   = useState([]);

  const [department, setDepartment] = useState("");
  const [staffRole, setStaffRole]   = useState("");
  const [course, setCourse]         = useState("");
  const [batch, setBatch]           = useState("");
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [gender, setGender]         = useState("");
  const [loading, setLoading]       = useState(false);

  // ── Batch validation state (all values come from backend SP) ────────────────
  const [batchValid, setBatchValid]           = useState(null);     // null | true | false
  const [derivedCurrentYear, setDerivedCurrentYear] = useState(null);
  const [batchError, setBatchError]           = useState("");
  const [batchChecking, setBatchChecking]     = useState(false);

  // ── Bulk upload state ────────────────────────────────────────────────────────
  const [uploading, setUploading]     = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  // Load departments and staff roles from DB — no hardcoded lists
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
        console.error("Failed to load form options:", err);
      }
    };
    load();
  }, []);

  const isAdvisor = staffRole === "ADVISOR";

  // ── Batch validation via backend SP ─────────────────────────────────────────
  // All math lives in sp_validate_batch_and_year — zero calculations here.
  const validateBatch = useCallback(async (batchVal, courseVal) => {
    if (!batchVal || !courseVal) {
      setBatchValid(null);
      setDerivedCurrentYear(null);
      setBatchError("");
      return;
    }

    setBatchChecking(true);
    try {
      const res = await API.get("/staff/validate-batch", { params: { batch: batchVal, course: courseVal } });
      const data = res.data;

      if (data.valid) {
        setBatchValid(true);
        setDerivedCurrentYear(data.currentYear);
        setBatchError("");
      } else {
        setBatchValid(false);
        setDerivedCurrentYear(null);
        setBatchError(data.message || "Invalid batch year");
      }
    } catch (err) {
      console.error("Batch validation error:", err);
      setBatchValid(false);
      setDerivedCurrentYear(null);
      setBatchError(err.message || "Could not reach validation service");
    } finally {
      setBatchChecking(false);
    }
  }, []);

  // Re-validate whenever course changes (if batch is already entered)
  const handleCourseChange = (val) => {
    setCourse(val);
    if (batch) validateBatch(batch, val);
  };

  // Validate on blur of batch field
  const handleBatchBlur = () => {
    if (batch && course) validateBatch(batch, course);
  };

  // ── Academic year label derived from batch (only displayed, not calculated) ─
  // We use batch + course duration from backend data to show e.g. "2023–2027"
  // Since batchValid=true means backend gave us currentYear, we can display
  // batch and batch+duration — but duration must also come from backend.
  // We show it only as "batch – batch+{4 or 2}" using the course the admin picks,
  // since this is purely display and the SP already enforced the constraint.
  const academicYearLabel = (() => {
    if (!isAdvisor || !batchValid || !batch || !course) return null;
    const batchNum      = parseInt(batch, 10);
    const courseDuration = course === "M.E" ? 2 : 4;
    if (isNaN(batchNum)) return null;
    return `${batchNum}–${batchNum + courseDuration}`;
  })();

  // ── Ordinal labels ───────────────────────────────────────────────────────────
  const ORDINAL = ["1st", "2nd", "3rd", "4th"];
  const currentYearLabel = derivedCurrentYear != null && derivedCurrentYear >= 1
    ? `${ORDINAL[derivedCurrentYear - 1]} Year`
    : "—";

  // ── Form-level validation message (inline, replaces alert()) ────────────────
  const [formError, setFormError] = useState("");

  // ── Single staff create ──────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!firstName || !gender || !department || !staffRole) {
      setFormError("Please fill all required fields.");
      return;
    }
    if (isAdvisor && !batch) {
      setFormError("Batch is required for Advisors.");
      return;
    }
    if (isAdvisor && !course) {
      setFormError("Please select a course for Advisor role.");
      return;
    }
    if (isAdvisor && !batchValid) {
      setFormError(batchError || "Please enter a valid batch year before creating.");
      return;
    }
    setFormError("");

    const payload = {
      firstName:   firstName.trim(),
      lastName:    lastName.trim(),
      gender,
      department,
      staffRole,
      course:      isAdvisor ? course : "",
      batch:       isAdvisor ? batch.trim() : "N/A",
      // derivedCurrentYear comes exclusively from the backend SP — no frontend math
      currentYear: isAdvisor ? derivedCurrentYear : 0,
    };

    try {
      setLoading(true);
      const res = await API.post("/staff", payload);
      const data = res.data;

      const generatedUsername = data.username || "unknown";
      // Refresh the table first so it's already showing the new row by the
      // time the modal closes — no intermediate dialog, no manual dismissal.
      await refreshUsers();
      onClose();
      toast.success(
        `Staff user "${generatedUsername}" created successfully.\nTemporary password: ${generatedUsername}7311`
      );
    } catch (err) {
      console.error("Create staff error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to create staff user.");
    } finally {
      setLoading(false);
    }
  };

  // ── Excel bulk upload ────────────────────────────────────────────────────────
  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "csv"].includes(ext)) {
      toast.error("Only .xlsx and .csv files are accepted.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setUploadResult(null);
      const res = await API.post("/staff/bulk", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const data = res.data;
      setUploadResult(data);
      await refreshUsers();
      if (data.failed) {
        toast.info(`Upload complete — ${data.created} created, ${data.failed} failed. See details below.`);
      } else {
        toast.success(`Upload complete — ${data.created} staff user(s) created.`);
      }
    } catch (err) {
      console.error("Excel upload error:", err);
      toast.error(err.response?.data?.message || err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // ── Download error report as CSV ─────────────────────────────────────────────
  const downloadErrorReport = () => {
    if (!uploadResult?.errors?.length) return;
    const header = "Row,first_name,last_name,department,role,batch,current_year,Error";
    const lines  = uploadResult.errors.map((e) => {
      const d = e.data || {};
      const errStr = (e.errors || []).join("; ").replace(/,/g, " ");
      return [e.row, d.first_name, d.last_name, d.department, d.role, d.batch, d.current_year, errStr].join(",");
    });
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "staff_upload_errors.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Is the Create button blocked?
  const isCreateBlocked = loading || uploading || (isAdvisor && batchValid === false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[700px] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-sm font-semibold text-blue-800 mb-4">
          CREATE NEW STAFF USER
        </h2>

        <div className="grid grid-cols-2 gap-4 text-sm">

          {/* Department */}
          <div>
            <label className="form-label">Department</label>
            <Dropdown
              value={department}
              onChange={setDepartment}
              options={departments}
              placeholder="Choose Department"
            />
          </div>

          {/* Staff Role */}
          <div>
            <label className="form-label">Staff Role</label>
            <Dropdown
              value={staffRole}
              onChange={(newRole) => {
                setStaffRole(newRole);
                if (newRole !== "ADVISOR") {
                  setBatch("");
                  setCourse("");
                  setBatchValid(null);
                  setDerivedCurrentYear(null);
                  setBatchError("");
                }
              }}
              options={staffRoles}
              placeholder="Choose Role"
            />
          </div>

          {/* Course — advisor only */}
          {isAdvisor ? (
            <div>
              <label className="form-label">Course</label>
              <select
                value={course}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="form-input w-full"
              >
                <option value="" disabled>Choose Course</option>
                <option value="B.E">B.E</option>
                <option value="M.E">M.E</option>
              </select>
            </div>
          ) : (
            <div />
          )}

          {/* Batch — advisor only */}
          {isAdvisor ? (
            <div>
              <label className="form-label">Assigned Batch</label>
              <input
                value={batch}
                onChange={(e) => {
                  setBatch(e.target.value);
                  // Clear previous validation result on change
                  setBatchValid(null);
                  setDerivedCurrentYear(null);
                  setBatchError("");
                }}
                onBlur={handleBatchBlur}
                className={`form-input w-full ${
                  batchValid === false
                    ? "border-red-400 bg-red-50 focus:ring-red-300 focus:border-red-400"
                    : batchValid === true
                    ? "border-green-400 focus:ring-green-300 focus:border-green-400"
                    : ""
                }`}
                placeholder="e.g. 2023"
              />
              {/* Error message from backend */}
              {batchError && (
                <p className="text-xs text-red-500 mt-1">{batchError}</p>
              )}
              {/* Academic year label */}
              {academicYearLabel && !batchError && (
                <p className="text-xs text-blue-500 mt-1">Academic Year: {academicYearLabel}</p>
              )}
              {batchChecking && (
                <p className="text-xs text-slate-400 mt-1">Validating batch…</p>
              )}
            </div>
          ) : (
            <div />
          )}

          {/* Current Year — derived by backend SP, displayed as read-only field.
              Same text-sm / text-slate-800 styling as every other field in this
              form, so it doesn't stand out as bold/blue against its neighbors. */}
          {isAdvisor ? (
            <div>
              <label className="form-label">Current Year</label>
              <div className="form-input-static w-full">
                <span className={batchValid ? "" : "text-slate-400"}>
                  {batchValid ? currentYearLabel : "—"}
                </span>
                {batchValid && (
                  <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    auto-calculated
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div />
          )}

          {/* Spacer to maintain grid alignment */}
          {!isAdvisor && <div />}

          {/* First Name */}
          <div>
            <label className="form-label">First Name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="form-input w-full"
              placeholder="e.g. John"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="form-label">Last Name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="form-input w-full"
              placeholder="e.g. Smith"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="form-label">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="form-input w-full"
            >
              <option value="" disabled>Choose Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Password info */}
          <div className="col-span-2 text-xs text-slate-500 bg-slate-50 rounded-md px-3 py-2 border border-slate-200">
            Temporary password will be auto-generated as: <strong>&lt;generated_username&gt;7311</strong>
            {isAdvisor && (
              <span className="block mt-1 text-blue-600 font-medium">
                Excel template columns: first_name, last_name, gender, department, role, course, batch
              </span>
            )}
          </div>

          {/* ── Upload result summary ──────────────────────────────────────────── */}
          {uploadResult && (
            <div className="col-span-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 space-y-2">
              <p className="font-semibold text-slate-800">
                Upload complete — {uploadResult.total} processed,{" "}
                <span className="text-green-600">{uploadResult.created} created</span>,{" "}
                <span className="text-red-500">{uploadResult.failed} failed</span>
              </p>

              {uploadResult.errors?.length > 0 && (
                <>
                  <p className="font-semibold text-red-600">Failed rows:</p>
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {uploadResult.errors.map((e, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-slate-500 shrink-0">Row {e.row}:</span>
                        <span className="text-red-500">{(e.errors || []).join(", ")}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={downloadErrorReport}
                    className="mt-1 text-blue-600 underline text-xs"
                  >
                    Download error report (.csv)
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── Inline validation error (replaces alert()) ──────────────────────── */}
          {formError && (
            <div className="col-span-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              ⚠ {formError}
            </div>
          )}

          {/* ── Footer Buttons ──────────────────────────────────────────────────── */}
          <div className="col-span-2 flex justify-end gap-3 mt-4">
            {/* Hidden file input for Excel upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv"
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
              disabled={isCreateBlocked}
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

export default CreateStaffForm;