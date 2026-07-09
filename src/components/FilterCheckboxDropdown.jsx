// frontend/src/staff/components/FilterCheckboxDropdown.jsx
import { useState, useRef, useEffect } from "react";
import CustomCheckbox from "../CustomCheckbox";
import assets from "../assets/assets";
import { tableHeadText } from "../../../styles/tableHeadText";

const FilterCheckboxDropdown = ({
  label,
  name,
  options,
  filters,
  setFilters,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = filters[name] || [];
  const isActive = selected.length > 0;

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

  const toggle = (value) => {
    setFilters((prev) => {
      const cur = prev[name] || [];
      const next = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value];

      return { ...prev, [name]: next };
    });
  };

  return (
    <div ref={ref} className="relative">
      {/* BUTTON */}
      <button
        onClick={() => setOpen((p) => !p)}
        className={`
          px-4 py-2 rounded-lg border flex items-center gap-2
          text-sm ${tableHeadText}
          ${
            isActive
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white border-slate-300 text-slate-700"
          }
        `}
      >
        {label}
        <img src={assets.downarrow_icon} className="w-3 h-3" />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute mt-2 w-44 bg-white border rounded-lg shadow-lg z-50 py-1">
          {options.map((opt) => {
            const checked = selected.includes(opt);

            return (
              <div
                key={opt}
                onClick={() => toggle(opt)}
                className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-slate-100"
              >
                <CustomCheckbox checked={checked} />
                <span className="text-sm">{opt}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterCheckboxDropdown;
