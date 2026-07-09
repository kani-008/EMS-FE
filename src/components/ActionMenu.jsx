// frontend/src/staff/components/ActionMenu.jsx
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import assets from "../assets/assets";

const ActionMenu = ({ items = [], onAction }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null); // ✅ NEW

  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (open && dropdownRef.current) {
      setCoords(dropdownRef.current.getBoundingClientRect());
    } else {
      setCoords(null);
    }
  }, [open]);

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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
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
      {open && coords &&
        (() => {
          const DROPDOWN_HEIGHT = items.length * 40;
          const SPACE_BELOW = window.innerHeight - coords.bottom;
          const openUp = SPACE_BELOW < DROPDOWN_HEIGHT + 16;

          return createPortal(
            <div
              ref={menuRef} // ✅ IMPORTANT
              className="
                fixed z-[9999] w-36
                bg-white border border-slate-200
                rounded-xl shadow-lg
                py-1
              "
              style={{
                top: openUp
                  ? coords.top - DROPDOWN_HEIGHT - 8
                  : coords.bottom + 8,
                left: coords.right - 144,
              }}
            >
              {items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleActionClick(item)}
                  className="
                    w-full px-3 py-2
                    text-sm text-slate-600
                    hover:bg-slate-100
                    flex items-center gap-2
                  "
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="w-4 h-4 opacity-70"
                  />
                  {item.label}
                </button>
              ))}
            </div>,
            document.body
          );
        })()}
    </div>
  );
};

export default ActionMenu;
