// frontend/src/pages/Dashboard.jsx
import OverallStudentMetrics from "../components/Dashboard/OverallStudentMetrics";
import YearWiseStudentMetrics from "../components/Dashboard/YearWiseStudentMetrics";
import EventMetrics from "../components/Dashboard/EventMetrics";
import YearWiseEventMetrics from "../components/Dashboard/YearWiseEventMetrics";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <OverallStudentMetrics />
      <YearWiseStudentMetrics />
      <EventMetrics />
      <YearWiseEventMetrics /> 
    </div>
  );
};

export default Dashboard;
