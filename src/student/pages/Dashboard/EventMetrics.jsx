// frontend/src/student/pages/Dashboard/EventMetrics.jsx
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

import { overallEventMetrics } from "../../../assets/dashboardDummy";

const EventMetrics = () => {
  const data = {
    labels: overallEventMetrics.labels,
    datasets: [
      {
        label: "PG Students",
        data: overallEventMetrics.pg,
        backgroundColor: "#60A5FA", // blue
        barThickness: 100,
      },
      {
        label: "UG Students",
        data: overallEventMetrics.ug,
        backgroundColor: "#F97316", // orange
        barThickness: 100,
      },
    ],
  };

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    datalabels: {
      display: false, // 👈 THIS LINE FIXES IT
    },
    legend: {
      position: "bottom",
    },
    title: {
      display: true,
      text: "Overall Event Metrics",
      align: "start",
    },
  },
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
    },
  },
};

  return (
    <div className="h-[360px] p-4 border rounded-lg bg-white">
      <Bar data={data} options={options} />
    </div>
  );
};

export default EventMetrics;
