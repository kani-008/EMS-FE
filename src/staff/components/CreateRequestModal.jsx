// frontend/src/staff/components/CreateRequestModal.jsx
import { useState } from "react";
import Button from "../../components/Button";


const CreateRequestModal = ({ onClose }) => {
  const [course, setCourse] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [staff, setStaff] = useState("");
  const [date, setDate] = useState("");

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [semesterError, setSemesterError] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-[650px] rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-6 text-lg font-semibold text-blue-700">
          CREATE NEW REQUEST
        </h2>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {/* Student Name */}
          <div>
            <label className="mb-1 block text-sm font-medium">Student Name</label>
            <input
              disabled
              value="Manikandan S"
              className="h-10 w-full rounded-md border bg-gray-100 px-3 text-sm"
            />
          </div>

          {/* Roll Number */}
          <div>
            <label className="mb-1 block text-sm font-medium">Roll Number</label>
            <input
              placeholder="Enter your roll number"
              className="h-10 w-full rounded-md border px-3 text-sm"
            />
          </div>

          {/* Registration Number */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Registration Number
            </label>
            <input
              placeholder="Enter your registration number"
              className="h-10 w-full rounded-md border px-3 text-sm"
            />
          </div>

          {/* Course */}
          <div>
            <label className="mb-1 block text-sm font-medium">Course</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="h-10 w-full rounded-md border px-3 text-sm"
            >
              <option value="" disabled hidden>
                Select Course
              </option>
              <option value="BE">B.E</option>
              <option value="ME">M.E</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="mb-1 block text-sm font-medium">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-10 w-full rounded-md border px-3 text-sm"
            >
              <option value="" disabled hidden>
                Select Department
              </option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="mb-1 block text-sm font-medium">Year</label>
            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setSemester("");
                setSemesterError("");
              }}
              className="h-10 w-full rounded-md border px-3 text-sm"
            >
              <option value="" disabled hidden>
                Select Year
              </option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="mb-1 block text-sm font-medium">Semester</label>
            <select
              value={semester}
              disabled={!year}
              onClick={() => {
                if (!year) setSemesterError("Please select Year first");
              }}
              onChange={(e) => {
                setSemester(e.target.value);
                setSemesterError("");
              }}
              className={`h-10 w-full rounded-md border px-3 text-sm ${
                !year ? "bg-gray-100 text-gray-400" : ""
              } ${semesterError ? "border-red-500" : ""}`}
            >
              <option value="" disabled hidden>
                Select Semester
              </option>

              {year === "1" && (
                <>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </>
              )}
              {year === "2" && (
                <>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </>
              )}
              {year === "3" && (
                <>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </>
              )}
              {year === "4" && (
                <>
                  <option value="7">7</option>
                  <option value="8">8</option>
                </>
              )}
            </select>

            {semesterError && (
              <p className="mt-1 text-xs text-red-500">{semesterError}</p>
            )}
          </div>

          {/* Requested To */}
          <div>
            <label className="mb-1 block text-sm font-medium">Requested to</label>
            <select
              value={staff}
              onChange={(e) => setStaff(e.target.value)}
              className="h-10 w-full rounded-md border px-3 text-sm"
            >
              <option value="" disabled hidden>
                Select Staff
              </option>
              <option value="A">Staff A</option>
              <option value="B">Staff B</option>
            </select>
          </div>

          {/* Request Category (button dropdown) */}
          <div className="relative">
            <label className="mb-1 block text-sm font-medium">
              Request Category
            </label>

            <button
              type="button"
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="flex h-10 w-full items-center justify-between rounded-md border px-3 text-sm"
            >
              {category || "Select Category"}
              <span>⌄</span>
            </button>

            {categoryOpen && (
              <div className="absolute top-[72px] w-full rounded-lg border bg-white shadow-lg">
                {["Leave", "Paper Presentation", "Non-Technical Event"].map(
                  (item) => (
                    <div
                      key={item}
                      onClick={() => {
                        setCategory(item);
                        setCategoryOpen(false);
                      }}
                      className="cursor-pointer px-4 py-3 text-sm hover:bg-gray-100"
                    >
                      {item}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="mb-1 block text-sm font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 w-full rounded-md border px-3 text-sm"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <button className="rounded-md border border-green-600 px-8 py-2 text-green-700">
            Submit
          </button>
          <Button
            onClick={onClose}
            variant="danger"
            label="Cancel"
          />

        </div>
      </div>
    </div>
  );
};

export default CreateRequestModal;
