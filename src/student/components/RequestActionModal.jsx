// frontend/src/student/components/RequestActionModal.jsx
import { createPortal } from "react-dom";
import Button from "../../components/Button";


const RequestActionModal = ({ mode, request, onClose }) => {
  if (!mode) return null;

  const isDelete = mode === "delete";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-[420px] rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>

        {/* ---------- DELETE MODAL ONLY ---------- */}
        {isDelete && (
          <>
            {/* HEADER */}
            <h2 className="mb-4 text-lg font-semibold text-red-600 text-center">
              Delete Request
            </h2>

            {/* BODY */}
            <p className="mb-6 text-center text-sm text-slate-600">
              Are you sure you want to delete this request?
              <br />
              <span className="font-semibold text-slate-800">
                {request?.reqId}
              </span>
            </p>

            {/* FOOTER */}
            <div className="flex justify-center gap-6">
              <button
                className="rounded-md bg-red-600 px-8 py-2 text-white"
                onClick={() => {
                  // TODO: API call / state update later
                  onClose();
                }}
              >
                Delete
              </button>

              <Button
                onClick={onClose}
                variant="ghost"
                label="Cancel"
              />

            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default RequestActionModal;
