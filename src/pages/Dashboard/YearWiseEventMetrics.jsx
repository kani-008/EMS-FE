// frontend/src/staff/pages/Dashboard/YearWiseEventMetrics.jsx
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

import { ugYearWiseEventMetrics } from "../../assets/dashboardDummy";

const YearWiseEventMetrics = () => {
  const data = {
    labels: ugYearWiseEventMetrics.labels,
    datasets: [
      {
        label: "Sports",
        data: ugYearWiseEventMetrics.sports,
        backgroundColor: "#60A5FA", // blue
        barThickness: 100,
      },
      {
        label: "Paper Presentation",
        data: ugYearWiseEventMetrics.paperPresentation,
        backgroundColor: "#F97316", // orange
        barThickness: 100,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Overall Student Metrics Year-Wise",
        align: "start",
        color: "#2563EB",
        font: {
          size: 14,
          weight: "bold",
        },
      },
      datalabels: {
        display: false, // 🔴 important
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="h-[360px] p-4 border rounded-lg bg-white">
      <Bar data={data} options={options} />
    </div>
  );
};

export default YearWiseEventMetrics;
