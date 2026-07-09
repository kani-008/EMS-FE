import { useState } from "react";

/* ================= ICONS (LEFT PANEL ONLY) ================= */

/* STATUS – bold green circle */
const StatusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#198754">
    <circle cx="12" cy="12" r="8" />
  </svg>
);

/* CREATE – bold blue plus */
const CreateIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke="#0d6efd" strokeWidth="3" fill="none">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

/* CANCEL – bold red cross */
const CancelIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke="#dc3545" strokeWidth="3" fill="none">
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

/* FORWARD – person to person move */
const ForwardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fd7e14" strokeWidth="2.5">
    <circle cx="6" cy="7" r="3" />
    <path d="M2 18c0-2.5 2-4 4-4s4 1.5 4 4" />
    <path d="M11 12h6" />
    <path d="M15 9l3 3-3 3" />
    <circle cx="18" cy="7" r="3" />
  </svg>
);

/* ================= PAGE ================= */

const GeneralSettings = () => {
  const [selected, setSelected] = useState("Status");

  const fields = [
    { name: "Status", cls: "wf-status", icon: <StatusIcon /> },
    { name: "Create", cls: "wf-create", icon: <CreateIcon /> },
    { name: "Cancel", cls: "wf-cancel", icon: <CancelIcon /> },
    { name: "Forward", cls: "wf-forward", icon: <ForwardIcon /> },
  ];

  return (
    <div className="gs-page">
      <div className="gs-title">General Settings</div>

      <div className="gs-box">
        {/* LEFT PANEL */}
        <div className="gs-left">
          <div className="gs-subtitle">Required Fields</div>

          {fields.map(f => (
            <div
              key={f.name}
              className={`gs-item ${f.cls} ${selected === f.name ? "active" : ""}`}
              onClick={() => setSelected(f.name)}
            >
              <span className="gs-icon">{f.icon}</span>
              <span>{f.name}</span>
              <span className="dots">⋯</span>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}
        <div className="gs-right">
          {/* ❌ NO ICON HERE — TEXT ONLY */}
          <div className="gs-subtitle">
            {selected} – Field Properties
          </div>

          {selected === "Status" && <StatusConfig />}
          {selected === "Create" && <CreateConfig />}
          {selected === "Cancel" && <CancelConfig />}
          {selected === "Forward" && <ForwardConfig />}
        </div>
      </div>
    </div>

  );
};

export default GeneralSettings;


/* ================= STATUS ================= */

const StatusConfig = () => {
  const [rows, setRows] = useState([
    { id: 1, name: "Pending", color: "#7F7F7F", final: false },
    { id: 2, name: "Forward", color: "#0d6efd", final: false },
    { id: 3, name: "Accepted", color: "#198754", final: true },
    { id: 4, name: "Rejected", color: "#dc3545", final: true },
  ]);

  const update = (id, key, value) => {
    setRows(r => r.map(x => x.id === id ? { ...x, [key]: value } : x));
  };

  return (
    <div className="gs-table">
      <div className="gs-header">
        <span>Status</span>
        <span>Color Code</span>
        <span>Color</span>
        <span>Final</span>
      </div>

      {rows.map(r => (
        <div className="gs-row" key={r.id}>
          <input value={r.name} onChange={e => update(r.id,"name",e.target.value)} />
          <input value={r.color} onChange={e => update(r.id,"color",e.target.value)} />
          <input type="color" className="color-picker" value={r.color} onChange={e => update(r.id,"color",e.target.value)} />
          <input type="checkbox" checked={r.final} onChange={e => update(r.id,"final",e.target.checked)} />
        </div>
      ))}
    </div>
  );
};

/* ================= CREATE ================= */
const CreateConfig = () => (
  <div className="gs-card blue">
    <label>Allowed Roles</label>
    <select><option>Admin</option><option>Staff</option><option>All</option></select>

    <label>Default Status</label>
    <select><option>Pending</option></select>
  </div>
);

/* ================= CANCEL ================= */
const CancelConfig = () => (
  <div className="gs-card red">
    <label>Allowed Until</label>
    <select><option>Before Final</option><option>Always</option></select>

    <label>Cancel Action</label>
    <select><option>Change Status</option><option>Exit Workflow</option></select>
  </div>
);

/* ================= FORWARD ================= */
const ForwardConfig = () => (
  <div className="gs-card orange">
    <label>Allowed Status</label>
    <select><option>Pending</option><option>Forward</option></select>

    <label>Allowed Role</label>
    <select><option>Staff</option><option>Admin</option></select>

    <label>Next Status</label>
    <select><option>Forward</option><option>Accepted</option></select>
  </div>
);


