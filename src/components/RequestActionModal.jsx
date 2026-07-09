import { createPortal } from "react-dom";
import Button from "./Button";

const RequestActionModal = ({
  mode,          // "forward" | "accept" | "decline" | "edit" | "info" | "success" | "failed" | "delete"
  request,
  onClose,
  onConfirm,     // optional confirm handler for actions
}) => {
  if (!mode) return null;

  const isDelete = mode === "delete";
  const isForward = mode === "forward";
  const isAccept = mode === "accept";
  const isDecline = mode === "decline";
  const isSuccess = mode === "success";
  const isFailed = mode === "failed";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      {isDelete ? (
        <div className="w-[420px] rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
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
                onConfirm?.(request);
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
        </div>
      ) : (
        <div className="w-[560px] rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
          {/* ---------------- HEADER ---------------- */}
          {!isSuccess && !isFailed && (
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-blue-700">
                ADD ACTION TAKEN
              </h2>

              {isForward && (
                <select className="h-9 rounded-md border px-3 text-sm">
                  <option>Forward to</option>
                  <option>HOD</option>
                  <option>Principal</option>
                  <option>Advisor</option>
                </select>
              )}
            </div>
          )}

          {/* ---------------- BODY ---------------- */}
          {isSuccess && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-green-500">
                ✓
              </div>
              <p className="text-sm">
                Request has been accepted successfully.
              </p>
              <button
                onClick={onClose}
                className="rounded-md border border-green-600 px-10 py-2 text-green-600"
              >
                Ok
              </button>
            </div>
          )}

          {isFailed && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-yellow-500">
                !
              </div>
              <p className="text-sm">Failed</p>
              <button
                onClick={onClose}
                className="rounded-md border border-green-600 px-10 py-2 text-green-600"
              >
                Ok
              </button>
            </div>
          )}

          {!isSuccess && !isFailed && (
            <>
              <textarea
                defaultValue={
                  isForward
                    ? "Forward"
                    : isAccept
                    ? "Accepted"
                    : isDecline
                    ? "Not Accepted"
                    : ""
                }
                className="
                  mb-8 h-36 w-full resize-none
                  rounded-2xl border px-4 py-3 text-sm
                "
              />

              {/* ---------------- FOOTER ---------------- */}
              <div className="flex justify-center gap-6">
                {isForward && (
                  <button className="rounded-md border border-blue-600 px-10 py-2 text-blue-600">
                    Forward
                  </button>
                )}

                {isAccept && (
                  <button className="rounded-md bg-green-700 px-10 py-2 text-white">
                    Accept
                  </button>
                )}

                {isDecline && (
                  <button className="rounded-md border border-red-600 px-10 py-2 text-red-600">
                    Decline
                  </button>
                )}

                <Button
                  onClick={onClose}
                  variant="danger"
                  label="Cancel"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>,
    document.body
  );
};

export default RequestActionModal;
