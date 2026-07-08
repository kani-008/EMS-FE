// frontend/src/student/pages/Dashboard/Dashboard.jsx
// import HeaderFilters from "./HeaderFilters";
import OverallStudentMetrics from "./OverallStudentMetrics";
import YearWiseStudentMetrics from "./YearWiseStudentMetrics";
import EventMetrics from "./EventMetrics";
// import GenderEventMetrics from "./GenderEventMetrics";
import YearWiseEventMetrics from "./YearWiseEventMetrics";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* <HeaderFilters /> */}
      <OverallStudentMetrics />
      <YearWiseStudentMetrics />
      <EventMetrics />
      {/* <GenderEventMetrics />*/}
      <YearWiseEventMetrics /> 
    </div>
  );
};

export default Dashboard;
