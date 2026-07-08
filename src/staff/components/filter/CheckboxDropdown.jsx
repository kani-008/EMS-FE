// frontend/src/staff/components/filter/CheckboxDropdown.jsx

import { useState, useRef, useEffect } from "react";
import CustomCheckbox from "../CustomCheckbox";

const CheckboxDropdown = ({
  label,
  options = [],
  value = [],
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const allSelected =
    value.length === options.length && options.length > 0;

  const toggleAll = () => {
    if (allSelected) {
      onChange([]); // uncheck all
    } else {
      onChange([...options]); // check all
    }
  };

  const toggleOption = (opt) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  const isActive = value.length > 0;

  return (
    <div className="relative" ref={ref}>
      {/* Button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className={`
          px-2 py-1 rounded-md border text-sm font-semibold flex items-center gap-1
          ${
            isActive
              ? "bg-blue-200 border-blue-700 text-slate-700"
              : "bg-white border-slate-300 text-slate-500"
          }
        `}
      >
        {label}
        <span>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
          
          {/* ✅ ALL (manual) */}
          <label className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer ">
            <CustomCheckbox
              size="sm"
              checked={allSelected}
              onChange={toggleAll}
            />
            <span className="text-sm font-medium">All</span>
          </label>

          {/* OPTIONS */}
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer"
            >
              <CustomCheckbox
                size="sm"
                checked={value.includes(opt)}
                onChange={() => toggleOption(opt)}
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckboxDropdown;
