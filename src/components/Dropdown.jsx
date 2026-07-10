// src/components/Dropdown.jsx
// Reusable single-select dropdown — drop-in replacement for a native <select>
// in forms where the option list is dynamic or long.
//
// Props:
//   value       — currently selected value (string)
//   onChange    — fn(newValue: string) called on selection
//   options     — array of strings OR {value, label} objects
//                 Also accepts DB shapes like {department_id, department_name}
//                 and {user_role_id, user_role} — pass valueKey/labelKey if needed.
//   placeholder — shown when nothing is selected
//   disabled    — disables the trigger button
//   valueKey    — key to use as the option value  (default: "value")
//   labelKey    — key to use as the display label (default: "label")
//   className   — extra classes for the trigger button wrapper div
//   id          — forwarded to the trigger button for label association
//
// Interaction:
//   • Click trigger → open/close list
//   • Click option  → select, call onChange, close
//   • Click outside → close without changing value
//   • Enter / Space on trigger → toggle open
//   • ArrowDown / ArrowUp on trigger or list → move focus inside list
//   • Escape → close
//   • Enter on focused option → select that option
//   • Tab → closes list (natural focus movement)

import { useState, useRef, useEffect, useCallback } from "react";
import assets from "../assets/assets";

const Dropdown = ({
  value       = "",
  onChange,
  options     = [],
  placeholder = "Select…",
  disabled    = false,
  valueKey    = "value",
  labelKey    = "label",
  className   = "",
  id,
}) => {
  const [open, setOpen]     = useState(false);
  const containerRef        = useRef(null);
  const listRef             = useRef(null);
  const triggerRef          = useRef(null);

  // ── Normalise options to {value, label} ──────────────────────────────────────
  const normalised = options.map((opt) => {
    if (typeof opt === "string") return { value: opt, label: opt };
    // Support explicit valueKey/labelKey
    if (opt[valueKey] !== undefined) return { value: opt[valueKey], label: opt[labelKey] };
    // Auto-detect common DB shapes
    if (opt.department_id  !== undefined) return { value: opt.department_name, label: opt.department_name };
    if (opt.user_role_id   !== undefined) return { value: opt.user_role,       label: opt.user_role       };
    // Fallback
    return { value: String(opt), label: String(opt) };
  });

  const selectedLabel = normalised.find((o) => o.value === value)?.label ?? "";

  // ── Close on outside click ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Select an option ─────────────────────────────────────────────────────────
  const select = useCallback(
    (optValue) => {
      onChange?.(optValue);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [onChange]
  );

  // ── Keyboard handling on the trigger button ───────────────────────────────────
  const handleTriggerKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((p) => !p);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      // Move focus to first list item after paint
      requestAnimationFrame(() => {
        listRef.current?.querySelector("[role='option']")?.focus();
      });
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // ── Keyboard handling on individual list items ────────────────────────────────
  const handleOptionKeyDown = (e, optValue) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(optValue);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = e.currentTarget.nextElementSibling;
      if (next) next.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = e.currentTarget.previousElementSibling;
      if (prev) prev.focus();
      else triggerRef.current?.focus();
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      if (e.key === "Escape") triggerRef.current?.focus();
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* ── Trigger ────────────────────────────────────────────────────────────── */}
      <button
        id={id}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((p) => !p)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          "w-full flex items-center justify-between gap-2",
          "border border-slate-300 rounded-md px-3 py-2",
          "text-sm text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
          "transition-colors duration-150",
          disabled
            ? "bg-gray-100 text-slate-400 cursor-not-allowed"
            : "bg-white text-slate-800 hover:border-slate-400 cursor-pointer",
          open ? "border-blue-400" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className={selectedLabel ? "text-slate-800" : "text-slate-400"}>
          {selectedLabel || placeholder}
        </span>
        <img
          src={assets.downarrow_icon}
          className={`w-3 h-3 shrink-0 opacity-60 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* ── Options list ────────────────────────────────────────────────────────── */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={placeholder}
          className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-lg py-1"
        >
          {normalised.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400 select-none">No options</li>
          ) : (
            normalised.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onMouseDown={(e) => {
                    // Use mousedown so it fires before onBlur closes the list
                    e.preventDefault();
                    select(opt.value);
                  }}
                  onKeyDown={(e) => handleOptionKeyDown(e, opt.value)}
                  className={[
                    "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer select-none",
                    "hover:bg-blue-50 focus:bg-blue-50 focus:outline-none",
                    isSelected ? "text-blue-700 font-medium" : "text-slate-700",
                  ].join(" ")}
                >
                  {/* Selection indicator */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isSelected ? "bg-blue-600" : "bg-transparent"
                    }`}
                  />
                  {opt.label}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
