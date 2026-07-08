// frontend/src/staff/pages/Dashboard/OverallStudentMetrics.jsx
// pages/Dashboard/OverallStudentMetrics.jsx
import PieDonut from "../../components/charts/PieChart";
import { overallStudentMetrics } from "../../../assets/dashboardDummy";

const OverallStudentMetrics = () => {
  return (
    <div className="card">
      <h3 className="card-title">Overall Student Metrics</h3>

      <div className="flex gap-10 flex-wrap">
        <PieDonut
          title="Overall Student Ratio"
          data={overallStudentMetrics.overall}
        />
        <PieDonut
          title="Overall PG Student Ratio"
          data={overallStudentMetrics.pg}
        />
        <PieDonut
          title="Overall UG Student Ratio"
          data={overallStudentMetrics.ug}
        />
      </div>
    </div>
  );
};

export default OverallStudentMetrics;
