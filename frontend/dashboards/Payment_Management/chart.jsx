import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Chart = ({ data }) => {
  // Check if data is available and not empty
  if (!data || data.length === 0) {
    return <div>No data available for the chart</div>;
  }

  const chartData = {
    labels: data.map(item => item.stockid?.AssignedGame?.title || 'N/A'),
    datasets: [
      {
        label: 'Retail Price',
        data: data.map(item => parseFloat(item.stockid?.UnitPrice) || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Sale Price',
        data: data.map(item => parseFloat(item.order?.paymentAmount) || 0),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Game Prices Comparison',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Price (Rs)',
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default Chart;