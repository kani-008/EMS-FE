// frontend/src/staff/pages/Dashboard/YearWiseStudentMetrics.jsx
// pages/Dashboard/YearWiseStudentMetrics.jsx
import PieDonut from "../../components/charts/PieChart";
import { yearWiseStudentMetrics } from "../../assets/dashboardDummy";

const YearWiseStudentMetrics = () => {
  return (
    <div className="card">
      <h3 className="card-title">Year-Wise Student Metrics</h3>

      <div className="flex gap-10 flex-wrap">
        <PieDonut title="PG First Year" data={yearWiseStudentMetrics.pg1} />
        <PieDonut title="PG Second Year" data={yearWiseStudentMetrics.pg2} />
        <PieDonut title="UG First Year" data={yearWiseStudentMetrics.ug1} />
        <PieDonut title="UG Second Year" data={yearWiseStudentMetrics.ug2} />
        <PieDonut title="UG Third Year" data={yearWiseStudentMetrics.ug3} />
        <PieDonut title="UG Final Year" data={yearWiseStudentMetrics.ug4} />
      </div>
    </div>
  );
};

export default YearWiseStudentMetrics;
