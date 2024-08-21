import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GamesSortChart = ({ data }) => {
  // Group the data by game title and sum the orderCount
  const groupedData = useMemo(() => {
    return data.reduce((acc, item) => {
      const gameTitle = item.stockid?.AssignedGame?.title || 'N/A';
      if (acc[gameTitle]) {
        acc[gameTitle].orderCount += 1;
      } else {
        acc[gameTitle] = {
          gameTitle,
          orderCount: 1,
        };
      }
      return acc;
    }, {});
  }, [data]);

  // Sort the data in ascending order by order count
  const sortedData = useMemo(() => {
    return Object.values(groupedData).sort((a, b) => b.orderCount - a.orderCount);
  }, [groupedData]);

  const chartData = {
    labels: sortedData.map(item => item.gameTitle),
    datasets: [
      {
        label: 'Order Count',
        data: sortedData.map(item => item.orderCount),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Most Ordered Games',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Order Count',
        },
      },
      y: {
        ticks: {
          fontSize: 12, // Adjust the font size as needed
        },
      },
    },
    layout: {
      padding: {
        top: 20, // Adjust the top padding as needed
        right: 20, // Adjust the right padding as needed
        bottom: 20, // Adjust the bottom padding as needed
        left: 20, // Adjust the left padding as needed
      },
    },
    aspectRatio: 2.5, // Adjust the aspect ratio as needed
  };

  return <Bar data={chartData} options={options} />;
};

export default GamesSortChart;