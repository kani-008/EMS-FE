// frontend/src/components/RequestActionModal.jsx
import { useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import Dropdown from "./Dropdown";

const RequestActionModal = ({
  mode,        // "forward" | "accept" | "decline" | "edit" | "info" | "success" | "failed" | "delete"
  request,
  onClose,
  onConfirm,   // fn(request, { forwardedTo? }) — called after user confirms
}) => {
  const [forwardedTo, setForwardedTo] = useState("");
  const [notes, setNotes]             = useState(
    mode === "forward"  ? "Forward"      :
    mode === "accept"   ? "Accepted"     :
    mode === "decline"  ? "Not Accepted" : ""
  );
  const [busy, setBusy] = useState(false);

  if (!mode) return null;

  const isDelete  = mode === "delete";
  const isForward = mode === "forward";
  const isAccept  = mode === "accept";
  const isDecline = mode === "decline";
  const isSuccess = mode === "success";
  const isFailed  = mode === "failed";
  const isInfo    = mode === "info";

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm?.(request, { forwardedTo: forwardedTo || null, notes });
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      {/* ── DELETE CONFIRMATION ─────────────────────────────────────── */}
      {isDelete ? (
        <div
          className="w-[420px] rounded-xl bg-white p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="mb-4 text-center text-lg font-semibold text-red-600">
            Delete Request
          </h2>
          <p className="mb-6 text-center text-sm text-slate-600">
            Are you sure you want to delete this request?
            <br />
            <span className="font-semibold text-slate-800">{request?.reqId}</span>
          </p>
          <div className="flex justify-center gap-6">
            <button
              disabled={busy}
              className="rounded-md bg-red-600 px-8 py-2 text-white disabled:opacity-60 hover:bg-red-700 transition-colors"
              onClick={handleConfirm}
            >
              {busy ? "Deleting…" : "Delete"}
            </button>
            <Button onClick={onClose} variant="ghost" label="Cancel" />
          </div>
        </div>

      ) : (
        /* ── ACTION / INFO / STATUS MODAL ───────────────────────────── */
        <div
          className="w-[560px] rounded-xl bg-white p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          {!isSuccess && !isFailed && !isInfo && (
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-blue-700">
                ADD ACTION TAKEN
              </h2>

              {isForward && (
                <div className="w-48">
                  <Dropdown
                    value={forwardedTo}
                    onChange={setForwardedTo}
                    options={[
                      { value: "hod", label: "HOD" },
                      { value: "principal", label: "Principal" },
                      { value: "advisor", label: "Advisor" },
                    ]}
                    placeholder="Forward to…"
                  />
                </div>
              )}
            </div>
          )}

          {/* INFO VIEW */}
          {isInfo && (
            <div className="space-y-3 py-2">
              <h2 className="mb-4 text-lg font-semibold text-blue-700">Request Info</h2>
              {[
                ["Request ID",   request?.reqId],
                ["From",         request?.requestFrom],
                ["To",           request?.requestTo],
                ["Category",     request?.requestCategory],
                ["Status",       request?.status],
                ["Year",         request?.year],
                ["Department",   request?.department],
                ["Date",         request?.requestDate],
                ["Reason",       request?.reason],
              ].map(([label, val]) =>
                val != null ? (
                  <div key={label} className="flex gap-2 text-sm">
                    <span className="w-28 shrink-0 font-medium text-slate-600">{label}:</span>
                    <span className="text-slate-800">{String(val)}</span>
                  </div>
                ) : null
              )}
              <div className="mt-4 flex justify-end">
                <Button onClick={onClose} variant="ghost" label="Close" />
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {isSuccess && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-green-500 text-2xl text-green-600">
                ✓
              </div>
              <p className="text-sm">Request has been accepted successfully.</p>
              <button
                onClick={onClose}
                className="rounded-md border border-green-600 px-10 py-2 text-green-600 hover:bg-green-50"
              >
                Ok
              </button>
            </div>
          )}

          {/* FAILED */}
          {isFailed && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-yellow-500 text-2xl text-yellow-600">
                !
              </div>
              <p className="text-sm">Action failed. Please try again.</p>
              <button
                onClick={onClose}
                className="rounded-md border border-green-600 px-10 py-2 text-green-600 hover:bg-green-50"
              >
                Ok
              </button>
            </div>
          )}

          {/* BODY — action textarea */}
          {!isSuccess && !isFailed && !isInfo && (
            <>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mb-8 h-36 w-full resize-none rounded-2xl border px-4 py-3 text-sm"
              />

              {/* FOOTER */}
              <div className="flex justify-center gap-6">
                {isForward && (
                  <button
                    disabled={busy}
                    onClick={handleConfirm}
                    className="rounded-md border border-blue-600 px-10 py-2 text-blue-600 disabled:opacity-60 hover:bg-blue-50 transition-colors"
                  >
                    {busy ? "Forwarding…" : "Forward"}
                  </button>
                )}

                {isAccept && (
                  <button
                    disabled={busy}
                    onClick={handleConfirm}
                    className="rounded-md bg-green-700 px-10 py-2 text-white disabled:opacity-60 hover:bg-green-800 transition-colors"
                  >
                    {busy ? "Accepting…" : "Accept"}
                  </button>
                )}

                {isDecline && (
                  <button
                    disabled={busy}
                    onClick={handleConfirm}
                    className="rounded-md border border-red-600 px-10 py-2 text-red-600 disabled:opacity-60 hover:bg-red-50 transition-colors"
                  >
                    {busy ? "Declining…" : "Decline"}
                  </button>
                )}

                <Button onClick={onClose} variant="danger" label="Cancel" />
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
