import { useState, useEffect, useRef } from "react";
import DynamicForm from "./DynamicForm";
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

  const [departments, setDepartments] = useState([]);

  const [values, setValues] = useState({
    department: advisorContext?.department_name || "",
    batch: advisorContext?.batch || "",
    course: advisorContext?.course || "B.E",
    semester: "",
    creationType: "Range",
    prefix: "",
    rollNo: "",
    registrationNo: "",
    firstName: "",
    lastName: "",
    gender: "Male",
    rangeFrom: "",
    rangeTo: "",
  });
  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

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
      const yrPart = String(advisorContext.batch || "").slice(-2);
      const deptPart = getDeptPrefix(advisorContext.department_name);
      setValues((prev) => ({
        ...prev,
        course: advisorContext.course || "B.E",
        prefix: `${yrPart}${deptPart}`,
      }));
    }
  }, [advisorContext, isStaffFlow]);

  // Derive Admin prefix
  useEffect(() => {
    if (!isStaffFlow) {
      if (values.batch && values.department) {
        const yrPart = String(values.batch).slice(-2);
        const deptPart = getDeptPrefix(values.department);
        setValues((prev) => ({ ...prev, prefix: `${yrPart}${deptPart}` }));
      } else {
        setValues((prev) => ({ ...prev, prefix: "" }));
      }
    }
  }, [values.batch, values.department, isStaffFlow]);

  const activeSemester = isStaffFlow ? advisorContext?.derived_semester : values.semester;

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

    if (!values.department || !values.batch || !values.course || !activeSemester) {
      toast.error("Please select Department, Batch, Course, and Semester before uploading Excel.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("department", values.department);
    formData.append("batch", String(values.batch));
    formData.append("course", values.course);
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

  const handleCreate = async () => {
    setLoading(true);
    setUploadResult(null);
    setFormError("");

    const { department, batch, course, creationType, prefix, rangeFrom, rangeTo, rollNo, firstName, lastName, gender, registrationNo } = values;

    if (!department || !batch || !course || !activeSemester) {
      setFormError("Please fill all required department, batch, course, and semester fields.");
      setLoading(false);
      return;
    }

    if (creationType === "Range") {
      if (!prefix || !rangeFrom || !rangeTo) {
        setFormError("Please fill all range fields.");
        setLoading(false);
        return;
      }

      try {
        const res = await API.post("/students/range", {
          prefix: prefix.trim(),
          range_from: parseInt(rangeFrom, 10),
          range_to: parseInt(rangeTo, 10),
          course,
          semester: parseInt(activeSemester, 10),
          department,
          batch: String(batch),
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
      if (!rollNo || !firstName) {
        setFormError("Roll number and first name are required.");
        setLoading(false);
        return;
      }

      try {
        await API.post("/students/single", {
          roll_no: rollNo.trim(),
          first_name: firstName.trim(),
          last_name: (lastName || "").trim(),
          gender,
          registration_no: (registrationNo || "").trim(),
          course,
          semester: parseInt(activeSemester, 10),
          department,
          batch: String(batch),
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

  const isRange = values.creationType === "Range";

  const fields = [
    {
      name: "department", label: "Department", type: "static",
      hidden: () => !isStaffFlow,
      value: () => values.department || "Loading...",
    },
    {
      name: "department", label: "Department", type: "select",
      hidden: () => isStaffFlow,
      options: departments, placeholder: "Choose Department",
    },
    {
      name: "batch", label: "Batch", type: "static",
      hidden: () => !isStaffFlow,
      value: () => values.batch || "Loading...",
    },
    {
      name: "batch", label: "Batch", type: "text",
      hidden: () => isStaffFlow,
      placeholder: "e.g. 2023",
    },
    {
      name: "course", label: "Course", type: "select",
      options: ["B.E", "M.E"],
    },
    {
      name: "semester", label: "Semester", type: "static",
      hidden: () => !isStaffFlow,
      value: () => advisorContext?.derived_semester || "—",
      staticBadge: advisorContext?.derived_semester ? "auto" : null,
    },
    {
      name: "semester", label: "Semester", type: "select",
      hidden: () => isStaffFlow,
      options: [...Array(8)].map((_, i) => String(i + 1)),
      placeholder: "Choose Semester",
    },
    {
      name: "creationType", label: "Creation Type", type: "select",
      options: ["Range", "Individual"],
    },
    {
      name: "prefix", label: "Roll No Prefix", type: "text",
      hidden: () => !isRange,
      placeholder: "e.g. 23CSE",
    },
    {
      name: "rollNo", label: "Roll No", type: "text",
      hidden: () => isRange,
      placeholder: "e.g. 23CSE101",
    },
    {
      name: "rangeFrom", label: "From (Number)", type: "number",
      hidden: () => !isRange,
      placeholder: "e.g. 1",
    },
    {
      name: "rangeTo", label: "To (Number)", type: "number",
      hidden: () => !isRange,
      placeholder: "e.g. 60",
    },
    {
      name: "registrationNo", label: "Registration No", type: "text",
      hidden: () => isRange,
      placeholder: "e.g. 910023104001",
    },
    {
      name: "firstName", label: "First Name", type: "text",
      hidden: () => isRange,
      placeholder: "e.g. John",
    },
    {
      name: "lastName", label: "Last Name", type: "text",
      hidden: () => isRange,
      placeholder: "e.g. Doe",
    },
    {
      name: "gender", label: "Gender", type: "select",
      hidden: () => isRange,
      options: ["Male", "Female", "Other"],
    },
  ];

  return (
    <DynamicForm
      title={`CREATE NEW STUDENT USER (${isStaffFlow ? "ADVISOR FLOW" : "ADMIN FLOW"})`}
      fields={fields}
      values={values}
      onChange={setField}
      onSubmit={handleCreate}
      submitting={loading}
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
            Temporary password will be auto-generated as random secure string.
            <span className="block mt-1 text-blue-600 font-medium">
              Excel template columns: roll_no, first_name, last_name, gender, registration_no, course
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
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
                <div>
                  <button onClick={downloadExcelErrorReport} className="text-blue-600 underline text-xs font-semibold">
                    Download error report (.csv)
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      }
    />
  );
};

export default CreateUserForm;
