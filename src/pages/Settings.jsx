// frontend/src/pages/Settings.jsx
import { useState, useEffect } from "react";
import API from "../ApiCall/Api.jsx";
import Dropdown from "../components/Dropdown";

/* ── Inline SVG icons ────────────────────────────────────────────────────── */

const StatusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#198754">
    <circle cx="12" cy="12" r="8" />
  </svg>
);

const CreateIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke="#0d6efd" strokeWidth="3" fill="none">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CancelIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke="#dc3545" strokeWidth="3" fill="none">
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

const ForwardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fd7e14" strokeWidth="2.5">
    <circle cx="6" cy="7" r="3" />
    <path d="M2 18c0-2.5 2-4 4-4s4 1.5 4 4" />
    <path d="M11 12h6" />
    <path d="M15 9l3 3-3 3" />
    <circle cx="18" cy="7" r="3" />
  </svg>
);

/* ── Left-panel accent colours by field ─────────────────────────────────── */
const BORDER_MAP = {
  Status:  "border-l-4 border-l-green-600",
  Create:  "border-l-4 border-l-blue-600",
  Cancel:  "border-l-4 border-l-red-500",
  Forward: "border-l-4 border-l-orange-500",
};

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */

const GeneralSettings = () => {
  const [selected, setSelected] = useState("Status");

  const fields = [
    { name: "Status",  icon: <StatusIcon />  },
    { name: "Create",  icon: <CreateIcon />  },
    { name: "Cancel",  icon: <CancelIcon />  },
    { name: "Forward", icon: <ForwardIcon /> },
  ];

  return (
    <div className="p-4 bg-slate-100 min-h-full">
      <h1 className="text-base font-semibold mb-3 text-slate-800">General Settings</h1>

      <div className="flex bg-white border border-slate-300 rounded-lg overflow-hidden"
           style={{ height: "calc(100vh - 140px)" }}>

        {/* ── LEFT PANEL ────────────────────────────────────────────── */}
        <div className="w-64 shrink-0 p-3.5 border-r border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Required Fields
          </p>

          {fields.map((f) => (
            <button
              key={f.name}
              onClick={() => setSelected(f.name)}
              className={`
                w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border
                text-sm text-left mb-2 transition-colors
                ${BORDER_MAP[f.name]}
                ${selected === f.name
                  ? "bg-blue-50 border-slate-200 text-slate-800 font-medium"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}
              `}
            >
              <span className="flex items-center justify-center">{f.icon}</span>
              <span className="flex-1">{f.name}</span>
              <span className="text-slate-400 text-lg leading-none">⋯</span>
            </button>
          ))}
        </div>

        {/* ── RIGHT PANEL ───────────────────────────────────────────── */}
        <div className="flex-1 px-8 py-7 bg-slate-50 overflow-y-auto">
          <p className="text-sm font-semibold text-slate-700 mb-5">
            {selected} – Field Properties
          </p>

          {selected === "Status"  && <StatusConfig />}
          {selected === "Create"  && <CreateConfig />}
          {selected === "Cancel"  && <CancelConfig />}
          {selected === "Forward" && <ForwardConfig />}
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;

/* ══════════════════════════════════════════════════════════════════════════
   STATUS CONFIG — fetches real statuses from API; allows colour editing
══════════════════════════════════════════════════════════════════════════ */

/* Default colour palette for known statuses */
const DEFAULT_COLORS = {
  Pending:   "#7F7F7F",
  Forwarded: "#0d6efd",
  Accepted:  "#198754",
  Declined:  "#dc3545",
};

const StatusConfig = () => {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/requests/statuses")
      .then((res) => {
        if (res.data?.success) {
          setRows(
            res.data.data.map((s, i) => ({
              id:    s.id,
              name:  s.status,
              color: DEFAULT_COLORS[s.status] ?? "#7F7F7F",
              final: ["Accepted", "Declined"].includes(s.status),
            }))
          );
        }
      })
      .catch(() => {
        /* fallback to hardcoded defaults if API is unreachable */
        setRows([
          { id: "PS1", name: "Pending",   color: "#7F7F7F", final: false },
          { id: "PS2", name: "Forwarded", color: "#0d6efd", final: false },
          { id: "PS3", name: "Accepted",  color: "#198754", final: true  },
          { id: "PS4", name: "Declined",  color: "#dc3545", final: true  },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const update = (id, key, value) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, [key]: value } : x)));

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
        Loading statuses…
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="grid grid-cols-[3fr_3fr_1.5fr_1fr] gap-6 pb-3 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <span>Status</span>
        <span>Colour Code</span>
        <span>Colour</span>
        <span>Final</span>
      </div>

      {rows.map((r) => (
        <div
          key={r.id}
          className="grid grid-cols-[3fr_3fr_1.5fr_1fr] gap-6 items-center py-4 border-b border-slate-100"
        >
          <input
            value={r.name}
            onChange={(e) => update(r.id, "name", e.target.value)}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <input
            value={r.color}
            onChange={(e) => update(r.id, "color", e.target.value)}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <input
            type="color"
            value={r.color}
            onChange={(e) => update(r.id, "color", e.target.value)}
            className="h-10 w-12 cursor-pointer rounded border border-slate-200 p-0.5"
          />
          <input
            type="checkbox"
            checked={r.final}
            onChange={(e) => update(r.id, "final", e.target.checked)}
            className="h-5 w-5 cursor-pointer"
          />
        </div>
      ))}

      <div className="mt-6 flex gap-3">
        <button className="rounded-lg border border-green-600 px-6 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   CREATE CONFIG
══════════════════════════════════════════════════════════════════════════ */

const CreateConfig = () => {
  const [allowedRoles, setAllowedRoles] = useState("Admin");
  const [defaultStatus, setDefaultStatus] = useState("Pending");

  return (
    <div className="max-w-lg border-l-4 border-l-blue-600 pl-4 grid gap-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Allowed Roles
        </label>
        <Dropdown value={allowedRoles} onChange={setAllowedRoles} options={["Admin", "Staff", "All"]} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Default Status
        </label>
        <Dropdown value={defaultStatus} onChange={setDefaultStatus} options={["Pending"]} />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   CANCEL CONFIG
══════════════════════════════════════════════════════════════════════════ */

const CancelConfig = () => {
  const [allowedUntil, setAllowedUntil] = useState("Before Final");
  const [cancelAction, setCancelAction] = useState("Change Status");

  return (
    <div className="max-w-lg border-l-4 border-l-red-500 pl-4 grid gap-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Allowed Until
        </label>
        <Dropdown value={allowedUntil} onChange={setAllowedUntil} options={["Before Final", "Always"]} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Cancel Action
        </label>
        <Dropdown value={cancelAction} onChange={setCancelAction} options={["Change Status", "Exit Workflow"]} />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   FORWARD CONFIG
══════════════════════════════════════════════════════════════════════════ */

const ForwardConfig = () => {
  const [allowedStatus, setAllowedStatus] = useState("Pending");
  const [allowedRole, setAllowedRole] = useState("Staff");
  const [nextStatus, setNextStatus] = useState("Forwarded");

  return (
    <div className="max-w-lg border-l-4 border-l-orange-500 pl-4 grid gap-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Allowed Status
        </label>
        <Dropdown value={allowedStatus} onChange={setAllowedStatus} options={["Pending", "Forwarded"]} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Allowed Role
        </label>
        <Dropdown value={allowedRole} onChange={setAllowedRole} options={["Staff", "Admin"]} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Next Status
        </label>
        <Dropdown value={nextStatus} onChange={setNextStatus} options={["Forwarded", "Accepted"]} />
      </div>
    </div>
  );
};
