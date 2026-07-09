// frontend/src/staff/components/charts/PieChart.jsx
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const PieChart = ({ title, data }) => {
  const chartData = {
    labels: ["Boys", "Girls"],
    datasets: [
      {
        data: [data.boys, data.girls],
        backgroundColor: ["#1E40AF", "#60A5FA"], // match UI
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom", // matches screenshots
        labels: {
          boxWidth: 12,
          usePointStyle: true,
        },
      },
      datalabels: {
        color: "#fff",
        font: {
          weight: "bold",
          size: 14,
        },
        formatter: (value) => `${value}%`,
      },
    },
  };

  return (
    <div className="w-[240px] flex flex-col items-center">
      <p className="text-center font-semibold mb-2 text-sm">
        {title}
      </p>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart;
