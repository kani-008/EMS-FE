// frontend/src/staff/components/Modal.jsx
import Button from "./Button";

const Modal = ({ isOpen, title, children, onConfirm, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl w-[420px] shadow-lg" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 pt-4 pb-2">
          <h2 className="text-lg text-blue-800 font-semibold">{title}</h2>
        </div>

        {/* BODY */}
        <div className="px-6 pt-1 pb-10 text-slate-700">{children}</div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 ">
          <Button
            onClick={onClose}
            variant="danger"
            label="Cancel"
          />


          <Button
            onClick={onConfirm}
            variant="primary"
            label="Confirm"
          />

        </div>
      </div>
    </div>
  );
};

export default Modal;
