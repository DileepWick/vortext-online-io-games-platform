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
    labels: data.map(item => item?.title || 'N/A'),
    datasets: [
      {
        label: 'Average Rating',
        data: data.map(item => parseFloat(item?.averageRating) || 0),
        backgroundColor: 'rgba(53, 162, 235, 0.8)',
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
        labels: {
          color: "black", // Set legend text color to black
        },
      },
      title: {
        display: true,
        text: 'Game Ratings Comparison',
        color: "black", 
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        title: {
          display: true,
          text: "Average Rating",
          color: "black", // Y-axis label color
        },
        ticks: {
          color: "black", // Y-axis tick color
        },
      },
      x: {
        ticks: {
          color: "black", // X-axis tick color
        },
      },
    },
    animation: {
      duration: 1000, // Animation duration in milliseconds
      easing: 'easeInOutQuad', // Easing function for smooth animation
      // Optional callback for completion
      onComplete: () => {
        console.log('Animation complete');
      },
    },
  };


  return<div style={{ height: '80vh', margin: 'auto',  }} className='bg-gray-100 rounded-lg'> 
  <Bar data={chartData} options={options} className='' />
</div>
};

export default Chart;