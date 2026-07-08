// frontend/src/student/components/EditUserDetials.jsx
import Button from "../../components/Button";
const EditUserDetails = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      {/* MODAL CARD */}
      <div className="bg-white w-[720px] rounded-lg shadow-lg px-8 py-6 mt-16" onClick={(e) => e.stopPropagation()}>
        {/* TITLE */}
        <h2 className="text-base font-semibold text-blue-700 mb-5">
          EDIT USER DETAILS
        </h2>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {/* LEFT */}
          <div>
            <label className="form-label">Name</label>
            <input
              className="w-full mt-0 px-3 py-2 border rounded-md bg-slate-50"
              defaultValue={user.userName}
            />
          </div>

          <div>
            <label className="form-label">User Roll</label>
            <select
              className="w-full mt-0 px-3 py-2 border rounded-md bg-slate-50"
              defaultValue={user.userRole}
            >
              <option>Student</option>
              <option>Staff</option>
            </select>
          </div>

          <div>
            <label className="form-label">Batch</label>
            <select
              className="w-full mt-0 px-3 py-2 border rounded-md bg-slate-50"
              defaultValue={user.batch}
            >
              <option>2021</option>
              <option>2022</option>
              <option>2023</option>
              <option>2024</option>
              <option>2025</option>
              <option>2026</option>
              <option>2027</option>
            </select>
          </div>

          <div>
            <label className="form-label">Course</label>
            <select
              className="w-full mt-0 px-3 py-2 border rounded-md bg-slate-50"
              defaultValue={user.course}
            >
              <option>B.E</option>
              <option>M.E</option>
            </select>
          </div>

          <div>
            <label className="form-label">Department</label>
            <select
              className="w-full mt-0 px-3 py-2 border rounded-md bg-slate-50"
              defaultValue={user.department}
            >
              <option>CSE</option>
              <option>ECE</option>
              <option>MECH</option>
              <option>CIVIL</option>
              <option>IMT</option>
              <option>AUTO</option>
              <option>EEE</option>
            </select>
          </div>

          <div>
            <label className="form-label">Year</label>
            <select className="w-full mt-0 px-3 py-2 border rounded-md bg-slate-50">
              <option>Choose Year</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
            </select>
          </div>

          <div>
            <label className="form-label">Semester</label>
            <select className="w-full mt-0 px-3 py-2 border rounded-md bg-slate-50">
              <option>Choose Semester</option>
              <option>1</option>
              <option>2</option>
            </select>
          </div>

          <div>
            <label className="form-label">Register Number</label>
            <input
              className="w-full mt-0 px-3 py-2 border rounded-md bg-slate-50"
              defaultValue={user.registrationNo}
            />
          </div>

          <div>
            <label className="form-label">Roll Number</label>
            <input
              className="w-full mt-0 px-3 py-2 border rounded-md bg-slate-50"
              defaultValue={user.userId}
            />
          </div>

          <div>
            <label className="form-label">Last Updated By</label>
            <p className="mt-2 form-value">Vasuki</p>
          </div>

          <div>
            <label className="form-label">Last Updated On</label>
            <p className="mt-2 form-value">24 MAR 2025 01:30 AM</p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-4 mt-8">
          <Button label="Edit" variant="primary" />
          <Button label="Cancel" variant="danger" onClick={onClose} />
        </div>
      </div>
    </div>
  );
};

export default EditUserDetails;