// frontend/src/staff/components/CreateUserForm.jsx
import { useState, useEffect } from "react";
import Button from "../../components/Button";

const CreateUserForm = ({ onClose, refreshUsers }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [batch, setBatch] = useState("");
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

  /* ---------------- MOCK DB VALUE ---------------- */
  const lastSerialFromDB = 50;

  /* ✅ FETCH USER INFO FROM API (using credentials: include) */
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        const data = await res.json();

        console.log("User info response:", data);

        if (data.success) {
          setUserInfo({
            ...data.user,
            batchYear: data.user.academic_year ? data.user.academic_year.split("-")[0] : null,
          });
          // 🔥 Lock department from token
          setDepartment(data.user.departmentName);
        } else {
          console.error("Failed to fetch user info:", data);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };
    fetchUserInfo();
  }, []);

  /* ---------------- PREFIX LOGIC ---------------- */
  useEffect(() => {
    if (batch && department) {
      const yearPart = batch.slice(-2);
      const deptMap = {
        CSE: "CSE",
        ECE: "ECE",
        MECH: "MECH",
        EEE: "EEE",
        CIVIL: "CIV",
        IMT: "IMT",
        AUTO: "AUTO",
      };
      setPrefix(`${yearPart}${deptMap[department] || ""}`);
    } else {
      setPrefix("");
    }
  }, [batch, department]);

  /* ---------------- INDIVIDUAL SERIAL ---------------- */
  useEffect(() => {
    if (userType === "Individual") {
      setSerial(lastSerialFromDB + 1);
      setRangeFrom("");
      setRangeTo("");
    }
  }, [userType]);
  const getSemesterOptions = () => {
    switch (year) {
      case "1":
        return ["1", "2"];
      case "2":
        return ["3", "4"];
      case "3":
        return ["5", "6"];
      case "4":
        return ["7", "8"];
      default:
        return [];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[680px] bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-sm font-semibold text-blue-800 mb-4">
          CREATE NEW USER
        </h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Batch - Locked to advisor's academic year */}
          <div>
            <label className="form-label">
              Batch
            </label>
            <input
              value={
                userInfo?.academic_year
                  ? userInfo.academic_year.split("-")[0]
                  : "Loading..."
              }
              disabled
              className="w-full border border-slate-300 rounded-md px-3 py-2 bg-gray-100 text-slate-600 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">🔒 Locked to your academic year</p>
          </div>

          {/* User Roll */}
          <div>
            <label className="form-label">
              User Roll
            </label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
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
            <label className="form-label">
              Department
            </label>
            <input
              value={department || "Loading..."}
              disabled
              className="w-full border border-slate-300 rounded-md px-3 py-2 bg-gray-100 text-slate-600 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">🔒 Locked to your department</p>
          </div>

          {/* Course */}
          <div>
            <label className="form-label">
              Course
            </label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
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
            <label className="form-label">
              Year
            </label>

            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setSemester(""); // reset semester
                setSemesterTouched(false); // reset alert
              }}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800"
            >
              <option value="" disabled className="text-slate-400">
                Choose Year
              </option>
              <option value="1" className="text-slate-800">
                1
              </option>
              <option value="2" className="text-slate-800">
                2
              </option>
              <option value="3" className="text-slate-800">
                3
              </option>
              <option value="4" className="text-slate-800">
                4
              </option>
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="form-label">
              Semester
            </label>

            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              onMouseDown={(e) => {
                if (!year) {
                  e.preventDefault(); // block dropdown
                  setSemesterTouched(true); // show alert
                }
              }}
              className={`
      w-full
      border border-slate-300
      rounded-md
      px-3 py-2
      text-slate-800
      ${!year ? "bg-gray-100 " : ""}
    `}
            >
              <option value="" disabled className="text-slate-400">
                Choose Semester
              </option>

              {getSemesterOptions().map((sem) => (
                <option key={sem} value={sem} className="text-slate-800">
                  {sem}
                </option>
              ))}
            </select>

            {/* ALERT ONLY WHEN USER TRIES WITHOUT YEAR */}
            {semesterTouched && !year && (
              <p className="mt-1 text-xs text-red-500">
                Please select Year first
              </p>
            )}
          </div>

          {/* Prefix */}
          <div>
            <label className="form-label">
              Add Prefix
            </label>
            <input
              value={prefix}
              readOnly
              placeholder="Auto generated"
              className="w-full border border-slate-300 rounded-md px-3 py-2 bg-gray-100 text-slate-500"
            />
          </div>

          {/* Name (optional) */}
          <div>
            <label className="form-label">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800"
              placeholder="Full name (optional)"
            />
          </div>

          {/* User Type */}
          <div>
            <label className="form-label">
              User Type
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
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
            {userType === "Individual" && (
              <div>
                <label className="form-label">
                  Serial Number
                </label>
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
                  <label className="form-label">
                    Range From
                  </label>
                  <input
                    value={rangeFrom}
                    onChange={(e) => setRangeFrom(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Range To
                  </label>
                  <input
                    value={rangeTo}
                    onChange={(e) => setRangeTo(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="col-span-2 flex justify-end gap-4 mt-6">
            <Button
              onClick={async () => {
                try {
                  // ✅ Use pre-computed batchYear from userInfo
                  const batchYear = userInfo?.batchYear;

                  // ✅ Validation
                  if (!batchYear || !department || !userRole || !userType) {
                    alert("Please fill all required fields");
                    return;
                  }

                  if (userType === "Range" && (!rangeFrom || !rangeTo)) {
                    alert("Please enter range values");
                    return;
                  }

                  // 🔥 Get token
                  // NOTE: Token is now sent via credentials: "include" with HTTP-only cookie

                  // ✅ Payload uses batchYear
                  const payload = {
                    prefix,
                    userType,
                    rangeFrom,
                    rangeTo,
                    course,
                    semester,
                    batch: String(batchYear),
                  };

                  console.log("FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

                  const base = import.meta.env.VITE_API_URL || "http://localhost:5000";

                  const res = await fetch(`${base}/api/admin/create-users`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(payload),
                  });

                  const data = await res.json();

                  if (!res.ok) {
                    throw new Error(data.message || "Failed to create users");
                  }

                  alert(`✅ ${data.totalCreated} users created successfully`);
                  await refreshUsers(); // 🔥 Refresh user list
                  onClose();
                } catch (err) {
                  console.error(err);
                  alert("❌ Error: " + err.message);
                }
              }}
              variant="primary"
              label="Create"
            />


            <Button
              onClick={onClose}
              variant="danger"
              label="Cancel"
            />

          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUserForm;
