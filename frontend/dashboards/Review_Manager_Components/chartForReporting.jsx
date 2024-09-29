import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const chartForReporting = ({ data }) => {
  // Check if data is available and not empty
  if (!data || data.length === 0) {
    return <div>No data available for the chart</div>;
  }

  // Sort the data by averageRating and take the top 5 values
  const sortedData = [...data].sort((a, b) => parseFloat(b.averageRating) - parseFloat(a.averageRating)).slice(0, 5);

  const chartData = {
    labels: sortedData.map(item => item?.title || 'N/A'),
    datasets: [
      {
        label: 'Average Rating',
        data: sortedData.map(item => parseFloat(item?.averageRating) || 0),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        maxBarThickness: 80,
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

  return (
    <div style={{ height: '80vh', margin: 'auto', width: '90%' }}>
      <Bar data={chartData} options={options} className='w-[100%]' />
    </div>
  );
};

export default chartForReporting;