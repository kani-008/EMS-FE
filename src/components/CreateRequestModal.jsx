// frontend/src/components/CreateRequestModal.jsx
import { useState, useEffect } from "react";
import DynamicForm from "./DynamicForm";
import API from "../ApiCall/Api.jsx";
import { useAuth } from "./AuthContext";

const CreateRequestModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();

  const studentName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || ""
    : "";

  const [values, setValues] = useState({
    requestTypeId: "",
    requestedTo: "",
    requestDate: "",
    requestReason: "",
    semester: "",
  });
  const setField = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));

  const [requestTypes, setRequestTypes] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [typesLoading, setTypesLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const load = async () => {
      setTypesLoading(true);
      try {
        const [typesRes, staffRes] = await Promise.allSettled([
          API.get("/requests/types"),
          API.get("/staff"),
        ]);

        if (typesRes.status === "fulfilled" && typesRes.value.data?.success) {
          setRequestTypes(typesRes.value.data.data || []);
        }
        if (staffRes.status === "fulfilled" && staffRes.value.data?.success) {
          setStaffList(staffRes.value.data.data || []);
        }
      } catch {
        // ignore — dropdowns will just be empty
      } finally {
        setTypesLoading(false);
      }
    };
    load();
  }, []);

  const staffOptions = staffList.map((s) => ({
    value: s.user_name || s.faculty_id,
    label: s.full_name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.user_name,
  }));

  const handleSubmit = async () => {
    setSubmitError("");

    if (!values.requestTypeId) { setSubmitError("Please select a request category."); return; }
    if (!values.requestedTo)   { setSubmitError("Please select who to send the request to."); return; }
    if (!values.requestDate)   { setSubmitError("Please select a date."); return; }

    setSubmitting(true);
    try {
      const payload = {
        requestedTo: values.requestedTo,
        requestTypeId: values.requestTypeId,
        requestReason: values.requestReason || null,
        requestDate: values.requestDate,
        currentYear: user?.current_year    || null,
        semester:    values.semester || user?.semester || null,
        courseId:    user?.course            || null,
        departmentId: user?.department_id    || null,
        academicYearId: user?.academic_year_id || null,
      };

      const res = await API.post("/requests", payload);
      if (res.data?.success) {
        onSuccess?.();
      } else {
        setSubmitError(res.data?.message || "Submission failed.");
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { name: "studentName", label: "Student Name", type: "text", readOnly: true },
    { name: "requestDate", label: "Date", type: "date" },
    {
      name: "requestTypeId", label: "Request Category", type: "select",
      options: requestTypes, disabled: () => typesLoading,
      placeholder: typesLoading ? "Loading…" : "Select Category",
    },
    {
      name: "requestedTo", label: "Requested To", type: "select",
      options: staffOptions, placeholder: "Select Staff",
    },
    {
      name: "semester", label: "Semester", type: "select",
      options: ["1", "2", "3", "4", "5", "6", "7", "8"], placeholder: "Select Semester",
    },
    {
      name: "requestReason", label: "Reason (optional)", type: "textarea",
      placeholder: "Describe the reason for this request…", colSpan: 2, rows: 3,
    },
  ];

  // studentName is display-only and never submitted — keep values in sync
  // without wiring it through onChange.
  const displayValues = { ...values, studentName };

  return (
    <DynamicForm
      title="CREATE NEW REQUEST"
      width="w-[620px]"
      fields={fields}
      values={displayValues}
      onChange={setField}
      onSubmit={handleSubmit}
      submitLabel="Submit"
      submitting={submitting}
      formError={submitError}
      onClose={onClose}
    />
  );
};

export default CreateRequestModal;
