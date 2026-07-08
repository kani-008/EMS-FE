// frontend/src/staff/components/CreateUserForm.jsx
import { useState, useEffect, useRef } from "react";
import Button from "../../components/Button";

const CreateUserForm = ({ onClose, refreshUsers, advisorContext }) => {
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
        const res = await fetch("/api/staff/students/range", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            prefix: prefix.trim(),
            range_from: parseInt(rangeFrom, 10),
            range_to: parseInt(rangeTo, 10),
            course,
            semester: advisorContext?.derived_semester,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to create students range");

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
        const res = await fetch("/api/staff/students/single", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            roll_no: rollNo.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            gender,
            registration_no: registrationNo.trim(),
            course,
            semester: advisorContext?.derived_semester,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to create student");

        alert("Student created successfully!");
        await refreshUsers();
        onClose();
      } catch (err) {
        alert("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Hidden Excel Upload handler
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
      const res = await fetch("/api/staff/students/excel", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Excel upload failed");
      setUploadResult(data);
      await refreshUsers();
    } catch (err) {
      console.error("Excel upload error:", err);
      alert("Upload error: " + err.message);
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
              value={department || "Loading..."}
              readOnly
              className="w-full border border-slate-300 rounded-md px-3 py-2 bg-gray-100 text-slate-600 outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="form-label">Batch</label>
            <input
              value={batch || "Loading..."}
              readOnly
              className="w-full border border-slate-300 rounded-md px-3 py-2 bg-gray-100 text-slate-600 outline-none cursor-not-allowed"
            />
          </div>

          {/* Row 2: Course & Semester */}
          <div>
            <label className="form-label">Course</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
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
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
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
                  value={rangeFrom}
                  onChange={(e) => setRangeFrom(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none"
                  placeholder="e.g. 1"
                />
              </div>

              <div>
                <label className="form-label">To (Number)</label>
                <input
                  type="number"
                  value={rangeTo}
                  onChange={(e) => setRangeTo(e.target.value)}
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
};

export default CreateUserForm;