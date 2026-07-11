import { useState, useEffect, useRef, useCallback } from "react";
import DynamicForm from "./DynamicForm";
import API, { getCachedData } from "../ApiCall/Api";
import { useToast } from "./Toast";

const ORDINAL = ["1st", "2nd", "3rd", "4th"];

const CreateStaffForm = ({ onClose, refreshUsers }) => {
  const toast = useToast();
  const [departments, setDepartments] = useState([]);
  const [staffRoles, setStaffRoles]   = useState([]);

  const [values, setValues] = useState({
    department: "",
    staffRole: "",
    course: "",
    batch: "",
    firstName: "",
    lastName: "",
    gender: "",
  });
  const setField = (name, value) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "staffRole" && value !== "ADVISOR") {
        next.batch = "";
        next.course = "";
        setBatchValid(null);
        setDerivedCurrentYear(null);
        setBatchError("");
      }
      if (name === "course" && prev.batch) {
        validateBatch(prev.batch, value);
      }
      if (name === "batch") {
        setBatchValid(null);
        setDerivedCurrentYear(null);
        setBatchError("");
      }
      return next;
    });
  };

  const [loading, setLoading] = useState(false);

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

  const isAdvisor = values.staffRole === "ADVISOR";

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

  const academicYearLabel = (() => {
    if (!isAdvisor || !batchValid || !values.batch || !values.course) return null;
    const batchNum = parseInt(values.batch, 10);
    const courseDuration = values.course === "M.E" ? 2 : 4;
    if (isNaN(batchNum)) return null;
    return `${batchNum}–${batchNum + courseDuration}`;
  })();

  const currentYearLabel = derivedCurrentYear != null && derivedCurrentYear >= 1
    ? `${ORDINAL[derivedCurrentYear - 1]} Year`
    : "—";

  const [formError, setFormError] = useState("");

  const handleCreate = async () => {
    const { firstName, lastName, gender, department, staffRole, course, batch } = values;
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
      currentYear: isAdvisor ? derivedCurrentYear : 0,
    };

    try {
      setLoading(true);
      const res = await API.post("/staff", payload);
      const data = res.data;
      const generatedUsername = data.username || "unknown";
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

  const isCreateBlocked = isAdvisor && batchValid === false;

  const fields = [
    { name: "department", label: "Department", type: "select", options: departments, placeholder: "Choose Department" },
    { name: "staffRole", label: "Staff Role", type: "select", options: staffRoles, placeholder: "Choose Role" },
    {
      name: "course",
      label: "Course",
      type: "select",
      options: ["B.E", "M.E"],
      placeholder: "Choose Course",
      hidden: () => !isAdvisor,
    },
    {
      name: "batch",
      label: "Assigned Batch",
      hidden: () => !isAdvisor,
      render: (vals, onChange) => (
        <div>
          <label className="form-label">Assigned Batch</label>
          <input
            value={vals.batch}
            onChange={(e) => onChange("batch", e.target.value)}
            onBlur={() => vals.batch && vals.course && validateBatch(vals.batch, vals.course)}
            className={`form-input w-full ${
              batchValid === false
                ? "border-red-400 bg-red-50 focus:ring-red-300 focus:border-red-400"
                : batchValid === true
                ? "border-green-400 focus:ring-green-300 focus:border-green-400"
                : ""
            }`}
            placeholder="e.g. 2023"
          />
          {batchError && <p className="text-xs text-red-500 mt-1">{batchError}</p>}
          {academicYearLabel && !batchError && (
            <p className="text-xs text-blue-500 mt-1">Academic Year: {academicYearLabel}</p>
          )}
          {batchChecking && <p className="text-xs text-slate-400 mt-1">Validating batch…</p>}
        </div>
      ),
    },
    {
      name: "currentYearDisplay",
      label: "Current Year",
      type: "static",
      value: () => (batchValid ? currentYearLabel : "—"),
      staticBadge: batchValid ? "auto-calculated" : null,
      hidden: () => !isAdvisor,
    },
    { name: "firstName", label: "First Name", placeholder: "e.g. John" },
    { name: "lastName", label: "Last Name", placeholder: "e.g. Smith" },
    { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"], placeholder: "Choose Gender" },
  ];

  return (
    <DynamicForm
      title="CREATE NEW STAFF USER"
      fields={fields}
      values={values}
      onChange={setField}
      onSubmit={handleCreate}
      submitting={loading}
      submitDisabled={isCreateBlocked}
      formError={formError}
      onClose={onClose}
      secondaryAction={{
        label: uploading ? "Uploading..." : "Upload Excel",
        onClick: () => fileInputRef.current?.click(),
        disabled: uploading || loading,
      }}
      extraContent={
        <>
          <div className="col-span-2 text-xs text-slate-500 bg-slate-50 rounded-md px-3 py-2 border border-slate-200">
            Temporary password will be auto-generated as: <strong>&lt;generated_username&gt;7311</strong>
            {isAdvisor && (
              <span className="block mt-1 text-blue-600 font-medium">
                Excel template columns: first_name, last_name, gender, department, role, course, batch
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv"
            className="hidden"
            onChange={handleExcelUpload}
          />

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
                  <button onClick={downloadErrorReport} className="mt-1 text-blue-600 underline text-xs">
                    Download error report (.csv)
                  </button>
                </>
              )}
            </div>
          )}
        </>
      }
    />
  );
};

export default CreateStaffForm;
