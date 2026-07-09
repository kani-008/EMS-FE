// frontend/src/staff/pages/Reports/Reports.jsx
import "./Reports.css";

export default function Reports() {
  return (
    <div className="dashboard">

      {/* TOP METRICS */}
      <div className="stats">
        <Stat title="Total Students" value="1300" />
        <Stat title="Active Students" value="1050" change="+3.2%" positive />
        <Stat title="Inactive Students" value="250" change="-1.4%" />
        <Stat title="Participation Rate" value="80.8%" positive />
      </div>

      {/* MIDDLE GRID */}
      <div className="grid">

        {/* RECENT EVENTS */}
        <div className="card">
          <h4>Recent Event Status</h4>

          <div className="alert high">
            <strong>Low Attendance</strong>
            <p>AI Workshop – 2nd Year</p>
          </div>

          <div className="alert medium">
            <strong>Event Completed</strong>
            <p>Web Dev Bootcamp</p>
          </div>

          <div className="alert medium">
            <strong>Upcoming Event</strong>
            <p>Cybersecurity Seminar</p>
          </div>
        </div>

        {/* PARTICIPATION TREND */}
        <div className="card">
          <p className="chart-title">Participation Trend (Last 6 Months)</p>
          <svg viewBox="0 0 300 120" width="100%">
            <polyline
              points="10,90 60,70 110,80 160,50 210,40 260,30"
              className="line"
            />
          </svg>
        </div>

        {/* ATTENDANCE */}
        <div className="card gauge">
          <h4>Average Attendance</h4>
          <h1>85.2%</h1>
          <p className="green">Good Performance</p>
        </div>

      </div>

      {/* BOTTOM ANALYTICS */}
      <div className="bottom">

        {/* EVENTS COMPLETION */}
        <div className="card gradient">
          <h4>Events Completion</h4>
          <p>37 Completed Events</p>
          <svg viewBox="0 0 300 120" width="100%">
            <polyline
              points="10,100 60,80 110,60 160,55 210,40 260,30"
              className="line white"
            />
          </svg>
        </div>

        {/* YEAR-WISE DISTRIBUTION */}
        <div className="card">
          <h4>Students by Year</h4>

          <svg viewBox="0 0 300 120" width="100%">
            <rect x="40" y="40" width="40" height="70" className="bar second" />
            <rect x="120" y="20" width="40" height="90" className="bar third" />
            <rect x="200" y="30" width="40" height="80" className="bar fourth" />
          </svg>

          <div className="legend">
            <span className="second">2nd Year</span>
            <span className="third">3rd Year</span>
            <span className="fourth">4th Year</span>
          </div>
        </div>

        {/* SYSTEM HEALTH */}
        <div className="card gauge">
          <h4>System Health</h4>
          <h1>✔ Stable</h1>
          <p>All modules operational</p>
        </div>

      </div>
    </div>
  );
}

/* SMALL METRIC CARD */
function Stat({ title, value, change, positive }) {
  return (
    <div className="stat-card">
      <p>{title}</p>
      <h2>{value}</h2>
      {change && (
        <span className={positive ? "green" : "red"}>{change}</span>
      )}
    </div>
  );
}
