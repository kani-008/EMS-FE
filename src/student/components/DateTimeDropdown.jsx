// frontend/src/student/components/DateTimeDropdown.jsx
import { useState, useRef, useEffect } from "react";
import assets from "../../assets/assets";

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const years = Array.from({ length: 8 }, (_, i) => 2022 + i);

const getDaysInMonth = (month, year) =>
  new Date(year, month + 1, 0).getDate();

const getFirstDayOfMonth = (month, year) =>
  new Date(year, month, 1).getDay();

const formatDateTime = (date) => {
  if (!date) return "";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const DateTimeDropdown = ({ label, value, onChange, align = "left" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState(1);

  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState("AM");

  /* Sync with value */
  useEffect(() => {
    if (!value) return;
    const d = new Date(value);

    setMonth(d.getMonth());
    setYear(d.getFullYear());
    setSelectedDate(d.getDate());

    const h = d.getHours();
    setHour(h % 12 || 12);
    setMinute(d.getMinutes());
    setAmpm(h >= 12 ? "PM" : "AM");
  }, [value]);

  /* Outside click */
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);

  const emitChange = (d = selectedDate) => {
    const hh =
      ampm === "PM" && hour !== 12 ? hour + 12 :
      ampm === "AM" && hour === 12 ? 0 : hour;

    onChange?.(new Date(year, month, d, hh, minute));
  };

  return (
    <div ref={ref} className="relative w-[230px] -py-1">

      <button
        onClick={() => setOpen((p) => !p)}
        className="relative w-30 h-7 rounded-lg border border-slate-300 bg-white px-3  flex items-center gap-2"
      >
        <span className="absolute -top-1 left-3 bg-white px-1 text-[11px] text-slate-500 leading-none">
          {label}
        </span>

        <img src={assets.calendar_icon} className="w-4 h-6 opacity-90 pt-1" />
        <span className="text-sm font-medium text-slate-800 py-0.5">
          {formatDateTime(value)}
        </span>
        <img src={assets.downarrow_icon} className="ml-auto w-3 h-3 opacity-70 " />
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-2 w-[300px] rounded-2xl bg-white p-4 shadow-xl
            ${align === "right" ? "right-0" : "left-0"}
          `}
        >
          <h3 className="mb-3 text-lg font-semibold">SELECT DATE</h3>

          {/* MONTH / YEAR */}
          <div className="mb-3 flex gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(+e.target.value)}
              className="rounded-md border px-2 py-1 text-sm"
            >
              {months.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(+e.target.value)}
              className="rounded-md border px-2 py-1 text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* WEEK */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-blue-500 mb-1">
            {weekDays.map(d => <div key={d}>{d}</div>)}
          </div>

          {/* DAYS */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {Array.from({ length: firstDay }).map((_, i) => <div key={i} />)}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const selected = d === selectedDate;

              return (
                <button
                  key={d}
                  onClick={() => {
                    setSelectedDate(d);
                    emitChange(d);
                    setOpen(false);
                  }}
                  className={`h-8 w-8 rounded-full mx-auto ${
                    selected ? "bg-blue-500 text-white" : "hover:bg-blue-100"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* TIME */}
          <div className="mt-4 flex justify-center gap-2">
            <select value={hour} onChange={(e) => setHour(+e.target.value)} className="border rounded px-2 py-1 text-sm">
              {Array.from({ length: 12 }).map((_, i) => <option key={i}>{i + 1}</option>)}
            </select>

            <select value={minute} onChange={(e) => setMinute(+e.target.value)} className="border rounded px-2 py-1 text-sm">
              {[0,15,30,45].map(m => <option key={m} value={m}>{String(m).padStart(2,"0")}</option>)}
            </select>

            <select value={ampm} onChange={(e) => setAmpm(e.target.value)} className="border rounded px-2 py-1 text-sm">
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimeDropdown;
