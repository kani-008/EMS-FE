/* eslint-disable react-refresh/only-export-components */
// frontend/src/components/Toast.jsx
// Lightweight, dependency-free toast notification system.
// Replaces window.alert() everywhere in the app — alerts block the whole
// page on a native dialog and require a click before anything else can
// happen; toasts surface the same information without stopping the user.
//
// Usage:
//   const toast = useToast();
//   toast.success("Staff user created.");
//   toast.error("Something went wrong.");
//   toast.info("Heads up…");
import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

let idSeq = 0;

const ICONS = { success: "✔", error: "✖", info: "ℹ" };

const STYLES = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-red-50 border-red-200 text-red-700",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const push = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = ++idSeq;
      setToasts((list) => [...list, { id, message, type }]);
      timers.current[id] = setTimeout(() => remove(id), duration);
      return id;
    },
    [remove]
  );

  const api = useRef({
    success: (msg, duration) => push(msg, "success", duration),
    error: (msg, duration) => push(msg, "error", duration ?? 5500),
    info: (msg, duration) => push(msg, "info", duration),
    dismiss: remove,
  }).current;

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 w-[22rem] max-w-[92vw] pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`toast-in pointer-events-auto flex items-start gap-2.5 border rounded-lg shadow-lg px-4 py-3 text-sm font-medium ${
              STYLES[t.type] || STYLES.info
            }`}
          >
            <span className="shrink-0 leading-5">{ICONS[t.type] || ICONS.info}</span>
            <span className="flex-1 leading-5 whitespace-pre-line">{t.message}</span>
            <button
              type="button"
              onClick={() => remove(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 leading-5 opacity-50 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);