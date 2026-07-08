// frontend/src/student/components/ActionMenu.jsx
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import assets from "../../assets/assets";

const ActionMenu = ({ items = [], onAction }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null); // ✅ NEW

  /* ---------- Close on outside click ---------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleActionClick = (item) => {
    onAction?.(item); // sends { label, icon }
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {/* ACTION BUTTON */}
      <button
        type="button"
        className="w-9 h-9 flex items-center justify-center"
        onClick={() => setOpen((p) => !p)}
      >
        <img
          src={open ? assets.dorpdownarrow_icon : assets.rightarrow_icon}
          alt="action"
          className="w-4 h-4"
        />
      </button>

      {/* DROPDOWN (PORTAL) */}
      {open &&
        (() => {
          const rect = dropdownRef.current?.getBoundingClientRect();
          if (!rect) return null;

          const DROPDOWN_HEIGHT = items.length * 40;
          const SPACE_BELOW = window.innerHeight - rect.bottom;
          const openUp = SPACE_BELOW < DROPDOWN_HEIGHT + 16;

          return createPortal(
            <div
              ref={menuRef} // ✅ IMPORTANT
              className="
                fixed ml-6 w-28
                bg-white border border-slate-200
                 shadow-xl  rounded-lg
                py-1 -mt-2
              "
              style={{
                top: openUp ? rect.top - DROPDOWN_HEIGHT - 8 : rect.bottom + 8,
                left: rect.right - 144,
              }}
            >
              {items.map((item) => (
               <button
  key={item.label}
  onClick={() => handleActionClick(item)}
  className="
    w-full px-3 py-2
    text-sm font-semibold
    text-red-500
    hover:bg-red-50
    flex items-center gap-3
    transition-colors
  "
>
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="w-5 h-6 "
                  />
                  {item.label}
                </button>
              ))}
            </div>,
            document.body,
          );
        })()}
    </div>
  );
};

export default ActionMenu;
