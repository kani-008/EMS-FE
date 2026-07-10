// frontend/src/components/CreateRequestModal.jsx
import { useState, useEffect } from "react";
import Button from "./Button";
import API from "../ApiCall/Api.jsx";
import { useAuth } from "./AuthContext";

const CreateRequestModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();

  // ── Auto-filled from session ──────────────────────────────────────
  const studentName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || ""
    : "";

  // ── Form state ────────────────────────────────────────────────────
  const [requestTypeId, setRequestTypeId] = useState("");
  const [requestedTo,   setRequestedTo]   = useState("");
  const [requestDate,   setRequestDate]   = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [semester,      setSemester]      = useState("");
  const [semesterError, setSemesterError] = useState("");

  // ── Reference data ────────────────────────────────────────────────
  const [requestTypes, setRequestTypes] = useState([]);
  const [staffList,    setStaffList]    = useState([]);
  const [typesLoading, setTypesLoading] = useState(true);

  // ── Submit state ──────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  /* ── Fetch reference data on mount ───────────────────────────────── */
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
          // staff list may come as array of objects with user_name / first_name etc.
          setStaffList(staffRes.value.data.data || []);
        }
      } catch (_) {
        // ignore — dropdowns will just be empty
      } finally {
        setTypesLoading(false);
      }
    };
    load();
  }, []);

  /* ── Submit ──────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    setSubmitError("");

    if (!requestTypeId) { setSubmitError("Please select a request category."); return; }
    if (!requestedTo)   { setSubmitError("Please select who to send the request to."); return; }
    if (!requestDate)   { setSubmitError("Please select a date."); return; }

    setSubmitting(true);
    try {
      const payload = {
        requestedTo,
        requestTypeId,
        requestReason: requestReason || null,
        requestDate,
        currentYear: user?.current_year    || null,
        semester:    semester || user?.semester || null,
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

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-[620px] rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-lg font-semibold text-blue-700">
          CREATE NEW REQUEST
        </h2>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {/* Student Name — read-only from session */}
          <div>
            <label className="mb-1 block text-sm font-medium">Student Name</label>
            <input
              disabled
              value={studentName}
              className="h-10 w-full rounded-md border bg-gray-100 px-3 text-sm text-gray-600"
            />
          </div>

          {/* Request Date */}
          <div>
            <label className="mb-1 block text-sm font-medium">Date</label>
            <input
              type="date"
              value={requestDate}
              onChange={(e) => setRequestDate(e.target.value)}
              className="h-10 w-full rounded-md border px-3 text-sm"
            />
          </div>

          {/* Request Category */}
          <div>
            <label className="mb-1 block text-sm font-medium">Request Category</label>
            <select
              value={requestTypeId}
              onChange={(e) => setRequestTypeId(e.target.value)}
              disabled={typesLoading}
              className="h-10 w-full rounded-md border px-3 text-sm disabled:bg-gray-100"
            >
              <option value="" disabled hidden>
                {typesLoading ? "Loading…" : "Select Category"}
              </option>
              {requestTypes.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {rt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Requested To — staff dropdown */}
          <div>
            <label className="mb-1 block text-sm font-medium">Requested To</label>
            <select
              value={requestedTo}
              onChange={(e) => setRequestedTo(e.target.value)}
              className="h-10 w-full rounded-md border px-3 text-sm"
            >
              <option value="" disabled hidden>Select Staff</option>
              {staffList.map((s) => {
                const name = s.full_name
                  || `${s.first_name || ""} ${s.last_name || ""}`.trim()
                  || s.user_name;
                return (
                  <option key={s.user_name || s.faculty_id} value={s.user_name}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="mb-1 block text-sm font-medium">Semester</label>
            <select
              value={semester}
              onChange={(e) => { setSemester(e.target.value); setSemesterError(""); }}
              className={`h-10 w-full rounded-md border px-3 text-sm ${semesterError ? "border-red-500" : ""}`}
            >
              <option value="" disabled hidden>Select Semester</option>
              {["1","2","3","4","5","6","7","8"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {semesterError && (
              <p className="mt-1 text-xs text-red-500">{semesterError}</p>
            )}
          </div>

          {/* Reason */}
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium">
              Reason <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              rows={3}
              placeholder="Describe the reason for this request…"
              className="w-full resize-none rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Error */}
        {submitError && (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {submitError}
          </p>
        )}

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-md border border-green-600 px-8 py-2 text-green-700 disabled:opacity-60 hover:bg-green-50 transition-colors"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
          <Button onClick={onClose} variant="danger" label="Cancel" />
        </div>
      </div>
    </div>
  );
};

export default CreateRequestModal;
