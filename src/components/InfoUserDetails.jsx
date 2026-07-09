import Button from "./Button";
const InfoUserDetails = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      {/* MODAL CARD */}
      <div className="bg-white w-[720px] rounded-lg shadow-lg px-8 py-6 mt-20" onClick={(e) => e.stopPropagation()}>
        {/* TITLE */}
        <h2 className="text-base font-semibold text-blue-700 mb-5">
          INFO USER DETAILS
        </h2>

        {/* FORM (READ-ONLY) */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <label className="form-label">Name</label>
            <input
              readOnly
              className="w-full mt-0 px-3 py-2 border rounded-md bg-slate-100 cursor-not-allowed"
              value={user.userName}
            />
          </div>

          <div>
            <label className="form-label">User Roll</label>
            <input
              readOnly
              className="w-full mt-0 px-3 py-2 border rounded-md bg-slate-100 cursor-not-allowed"
              value={user.userRole}
            />
          </div>

          <div>
            <label className="form-label">Batch</label>
            <input
              readOnly
              className="w-full mt-0 px-3 py-2 border rounded-md bg-slate-100 cursor-not-allowed"
              value={user.batch}
            />
          </div>

          <div>
            <label className="form-label">Course</label>
            <input
              readOnly
              className="w-full mt-0 px-3 py-2 border rounded-md bg-slate-100 cursor-not-allowed"
              value={user.course}
            />
          </div>

          <div>
            <label className="form-label">Department</label>
            <input
              readOnly
              className="w-full mt-0 px-3 py-2 border rounded-md bg-slate-100 cursor-not-allowed"
              value={user.department}
            />
          </div>

          <div>
            <label className="form-label">Year</label>
            <input
              readOnly
              className="w-full mt-0 px-3 py-2 border rounded-md bg-slate-100 cursor-not-allowed"
              value={user.year || "—"}
            />
          </div>

          <div>
            <label className="form-label">Semester</label>
            <input
              readOnly
              className="w-full mt-0 px-3 py-2 border rounded-md bg-slate-100 cursor-not-allowed"
              value={user.semester || "—"}
            />
          </div>

          <div>
            <label className="form-label">Register Number</label>
            <input
              readOnly
              className="w-full mt-0 px-3 py-2 border rounded-md bg-slate-100 cursor-not-allowed"
              value={user.registrationNo}
            />
          </div>

          <div>
            <label className="form-label">Roll Number</label>
            <input
              readOnly
              className="w-full mt-0 px-3 py-2 border rounded-md bg-slate-100 cursor-not-allowed"
              value={user.userId}
            />
          </div>

          <div>
            <label className="form-label">Last Updated By</label>
            <p className="mt-2 form-value">Vasuki</p>
          </div>

          <div>
            <label className="form-label">Last Updated On</label>
            <p className="mt-2 form-value">
              24 MAR 2025 01:30 AM
            </p>
          </div>
          {/* FOOTER */}
          <div className="flex justify-end gap-4 mt-8">
            <Button label="Close" variant="danger" onClick={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoUserDetails;
